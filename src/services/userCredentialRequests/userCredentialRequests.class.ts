import { Application, Params, Service } from '@feathersjs/feathers';

import { CredentialData, Credential, SubjectCredentialRequests, SubjectCredentialRequestsEnrichedDto } from '@unumid/types';
import { UnumDto, VerifiedStatus, verifySubjectCredentialRequests, reEncryptCredentials, extractCredentialType, handleSubjectCredentialRequests, HandleSubjectCredentialRequestsOptions } from '@unumid/server-sdk';
import { CredentialRequest } from '@unumid/types/build/protos/credential';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';
import { UserDto } from '../user/user.class';
import { buildAtomicCredentialData, buildAtomicCredentialSubject, buildDobCredentialSubject, buildPhoneCredentialSubject, buildSsnCredentialSubject, DobCredentialSubject, issueCredentialsHelper, PhoneCredentialSubject, SsnCredentialSubject } from '../../utils/issueCredentialsHelper';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';
import { reEncryptCredentialsHelper } from '../../utils/reEncryptCredentialsHelper';
import { formatBearerToken } from '../../utils/formatBearerToken';

export type ValidCredentialTypes = PhoneCredentialSubject | SsnCredentialSubject | DobCredentialSubject;

export type CredentialsIssuedResponse = {
  credentialTypesIssued: string[]
 };

export interface UserCredentialRequests extends SubjectCredentialRequestsEnrichedDto {
  user: UserDto;
  credentialsIssuedByDidAssociation: Credential[]
}

/**
 * A class to handle SubjectCredentialRequests and issue credentials accordingly, all verification permitting.
 */
export class UserCredentialRequestsService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  private async handleProveCredentials (data: UserCredentialRequests, params?: Params): Promise<CredentialsIssuedResponse> {
    const proveIssuer: IssuerEntity = params?.proveIssuerEntity;
    const version = params?.headers?.version; // confirmed present in the before hook

    if (!data.credentialRequestsInfo) {
      // short circuit as no requests for credentials
      return {
        credentialTypesIssued: []
      };
    }

    const { user, credentialRequestsInfo: { subjectCredentialRequests, issuerDid, subjectDid } } = data;

    if (proveIssuer.did !== issuerDid) {
      throw new Error(`Persisted Issuer DID ${proveIssuer.did} does not match request's issuer did ${issuerDid}`);
    }

    // handle SDK backwards compatibility
    const verification: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequests(proveIssuer.authToken, proveIssuer.did, subjectDid, subjectCredentialRequests);

    if (!verification.body.isVerified) {
      logger.error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
      throw new Error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
    }

    const userDid = user.did as string; // Note in the userDidAssociation hook we have already ensured that the user has an associated did.
    const credentialTypesRequested: string[] = subjectCredentialRequests.credentialRequests.map((req: CredentialRequest) => req.type);

    /**
     * At this point we have verified the credential requests signature signed by the subject, aka user, and we
     * have confirmed to have a user with the matching did in our data store. Now we need to handle issue credentials to the user.
     * for this have have a couple options:
     *
     * a) if we are persisting the credential data along side the User entity in our database then we should double check if have those
     * values which would correspond to the requested credentials then issue the credentials.
     *
     * b) if we are not persisting credential data in our database and we use the default issueCredentials call to issue the credentials originally then we can just use the SDK's reEncryptCredentials.
     *
     * Note: The option to use reEncryptCredentials is valid even if we are persisting credential data in our database. In fact, we are showcasing that in handleHvCredentials.
     */

    // /**
    //  * Using the server SDK's re-encryption helper to handle the re-encryption of the credentials for target user.
    //  * This made possible by using the default issuerCredentials call which makes a copy of the user credentials available to the issuer keys.
    //  * The benefit of this default is the Issuer do *not* have to store the user's credentials in the their (this demo's) data store.
    //  *
    //  * Note: this corresponds to option b) above even though we are persisting the data on the user entity.
    //  */
    // const unumDtoCredentialsIssuedResponse: UnumDto<Credential[]> = await reEncryptCredentialsHelper(hvIssuer, userDid, credentialTypesRequested);

    /**
     * We need some logic to determine if we have the data related to the user to issue the requested credentials.
     *
     * Note: this check then calling issueCredentials corresponds to option a) above
     */
    const credentialSubjects: CredentialData[] = [];
    credentialTypesRequested.forEach((type: string) => {
      if (type === 'DobCredential' && user.proveDob) {
        credentialSubjects.push(buildDobCredentialSubject(user.proveDob));
      } else if (type === 'SsnCredential' && user.proveSsn) {
        credentialSubjects.push(buildSsnCredentialSubject(user.proveSsn));
      } else if (type === 'PhoneCredential' && user.provePhone) {
        credentialSubjects.push(buildPhoneCredentialSubject(user.provePhone));
      } else if (type === 'FirstNameCredential' && user.proveFirstName) {
        credentialSubjects.push({ type: 'LastNameCredential', firstName: user.proveFirstName });
      } else if (type === 'LastNameCredential' && user.proveLastName) {
        credentialSubjects.push({ type: 'LastNameCredential', lastName: user.proveLastName });
      }
    });

    const unumDtoCredentialsIssuedResponse: UnumDto<Credential[]> = await issueCredentialsHelper(proveIssuer, userDid, credentialSubjects);

    // update the default issuer's auth token if it has been reissued
    if (unumDtoCredentialsIssuedResponse.authToken !== proveIssuer.authToken) {
      const issuerEntityService = this.app.service('issuerEntity');
      try {
        await issuerEntityService.patch(proveIssuer.uuid, { authToken: unumDtoCredentialsIssuedResponse.authToken });
      } catch (e) {
        logger.error('CredentialRequest create caught an error thrown by userEntityService.patch', e);
        throw e;
      }
    }

    return {
      credentialTypesIssued: credentialSubjects.map((credentialSubject: CredentialData) => credentialSubject.type)
    };
  }

  private async handleHvCredentials (data: UserCredentialRequests, params?: Params): Promise<CredentialsIssuedResponse> {
    const hvIssuer: IssuerEntity = params?.hvIssuerEntity;

    if (!data.credentialRequestsInfo) {
      // short circuit as no requests for credentials
      return {
        credentialTypesIssued: []
      };
    }

    const { user, credentialRequestsInfo: { subjectCredentialRequests, issuerDid, subjectDid } } = data;

    if (hvIssuer.did !== issuerDid) {
      throw new Error(`Persisted Issuer DID ${hvIssuer.did} does not match request's issuer did ${issuerDid}`);
    }

    const verification: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequests(hvIssuer.authToken, hvIssuer.did, subjectDid, subjectCredentialRequests);

    if (!verification.body.isVerified) {
      logger.error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
      throw new Error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
    }

    const userDid = user.did as string; // Note in the userDidAssociation hook we have already ensured that the user has an associated did.

    /**
     * At this point we have verified the credential requests signature signed by the subject, aka user, and we
     * have confirmed to have a user with the matching did in our data store. Now we need to handle issue credentials to the user.
     * for this have have a couple options:
     *
     * a) if we are persisting the credential data along side the User entity in our (this demo's) database then we should double check if have those
     * values which would correspond to the requested credentials then issue the credentials.
     *
     * b) if we are not persisting credential data in our database and we use the default issueCredentials call to issue the credentials originally then we can just use the SDK's reEncryptCredentials.
     *
     * Note: The option to use reEncryptCredentials is valid even if we are persisting credential data in our database. In fact, that is what are going to do here.
     */

    /**
     * Using the server SDK's re-encryption helper to handle the re-encryption of the credentials for target user.
     * This made possible by using the default issuerCredentials call which makes a copy of the user credentials available to the issuer keys.
     * The benefit of this default is the Issuer do *not* have to store the user's credentials in the their (this demo's) data store.
     *
     * Note: this corresponds to option b) above even though we are persisting the data on the user entity.
     */
    // const unumDtoCredentialsIssuedResponse: UnumDto<Credential[]> = await reEncryptCredentialsHelper(hvIssuer, userDid, credentialTypesRequested);
    const inputs: HandleSubjectCredentialRequestsOptions = {
      authorization: formatBearerToken(hvIssuer.authToken),
      issuerDid: hvIssuer.did,
      subjectDid: userDid,
      subjectCredentialRequests,
      reEncryptCredentialsOptions: {
        signingPrivateKey: hvIssuer.signingPrivateKey,
        encryptionPrivateKey: hvIssuer.encryptionPrivateKey,
        issuerEncryptionKeyId: hvIssuer.encryptionKeyId
      }
    };
    const unumDtoCredentialsReEncryptedResponse: UnumDto<Credential[]> = await handleSubjectCredentialRequests(inputs);

    const credentialTypesRequested: string[] = subjectCredentialRequests.credentialRequests.map((req: CredentialRequest) => req.type);

    // take the difference of the credentials that were able to be re-encrypted with those requested
    const credentialTypesToIssue: string[] = unumDtoCredentialsReEncryptedResponse.body.map((credential: Credential) => extractCredentialType(credential.type)[0]).filter((type: string) => credentialTypesRequested.includes(type));
    // const credentialTypesToIssue: string[] = credentialTypesRequested.filter((type: string) => !unumDtoCredentialsReEncryptedResponse.body.map((credential: Credential) => credential.type).includes(type));

    /**
     * We need some logic to determine if we have the data related to the user to issue the requested credentials.
     */
    const credentialSubjects: CredentialData[] = [];
    credentialTypesToIssue.forEach((type: string) => {
      if (type === 'DobCredential' && user.hvDob) {
        credentialSubjects.push(buildDobCredentialSubject(user.hvDob));
      } else if (type === 'GenderCredential' && user.hvGender) {
        credentialSubjects.push({ type: 'GenderCredential', gender: user.hvGender });
      } else if (type === 'FullNameCredential' && user.hvFullName) {
        credentialSubjects.push({ type: 'FullNameCredential', fullName: user.hvFullName });
      } else if (type === 'AddressCredential' && user.hvAddress) {
        credentialSubjects.push({ type: 'AddressCredential', address: user.hvAddress });
      } else if (type === 'GovernmentIdDocumentImageCredential' && user.hvDocImage) {
        credentialSubjects.push({ type: 'GovernmentIdDocumentImageCredential', image: user.hvDocImage });
      } else if (type === 'CountryResidenceCredential' && user.hvDocCountry) {
        credentialSubjects.push({ type: 'CountryResidenceCredential', country: user.hvDocCountry });
      } else if (type === 'GovernmentIdTypeCredential' && user.hvDocType) {
        credentialSubjects.push({ type: 'GovernmentIdTypeCredential', documentType: user.hvDocType });
      } else if (type === 'FacialImageCredential' && user.hvFaceImage) {
        credentialSubjects.push({ type: 'FacialImageCredential', image: user.hvFaceImage });
      } else if (type === 'LivelinessCredential' && user.hvLiveFace) {
        credentialSubjects.push({ type: 'LivelinessCredential', liveliness: user.hvLiveFace });
      } else if (type === 'LivelinessConfidenceCredential' && user.hvLiveFaceConfidence) {
        credentialSubjects.push({ type: 'LivelinessConfidenceCredential', confidence: user.hvLiveFaceConfidence });
      } else if (type === 'FacialMatchCredential' && user.hvFaceMatch) {
        credentialSubjects.push({ type: 'FacialMatchCredential', match: user.hvFaceMatch });
      } else if (type === 'FacialMatchConfidenceCredential' && user.hvFaceMatchConfidence) {
        credentialSubjects.push({ type: 'FacialMatchConfidenceCredential', confidence: user.hvFaceMatchConfidence });
      }
    });

    const unumDtoCredentialsIssuedResponse: UnumDto<Credential[]> = await issueCredentialsHelper(hvIssuer, userDid, credentialSubjects);

    // update the default issuer's auth token if it has been reissued
    if (unumDtoCredentialsIssuedResponse.authToken !== hvIssuer.authToken) {
      const issuerEntityService = this.app.service('issuerEntity');
      try {
        await issuerEntityService.patch(hvIssuer.uuid, { authToken: unumDtoCredentialsIssuedResponse.authToken });
      } catch (e) {
        logger.error('CredentialRequest create caught an error thrown by userEntityService.patch', e);
        throw e;
      }
    }

    // the output can be anything but for completeness going to return all the credentials that are now available to the subject.
    // aka all the credentials that were re-encrypted and all the credentials that were issued.
    const resultReEncrypted: string[] = unumDtoCredentialsReEncryptedResponse.body.map((credential: Credential) => extractCredentialType(credential.type)[0]);
    const resultIssued: string[] = unumDtoCredentialsIssuedResponse.body.map((credential: Credential) => extractCredentialType(credential.type)[0]);
    const result: string[] = resultReEncrypted.concat(resultIssued);

    return {
      credentialTypesIssued: result
    };
  }

  /**
   * User Credential Requests are normally only made for one issuer. This demo is an exception because we are acting as more than one issuer.
   * However because of the normal usage User Credential Requests are made for one issuer per request.
   * @param data
   * @param params
   * @returns
   */
  async create (data: UserCredentialRequests, params?: Params): Promise<CredentialsIssuedResponse> {
    // cut off the preceding 'VerifiableCredential' string in each credential type array
    const credentialTypesIssuedByDidAssociation = data.credentialsIssuedByDidAssociation.flatMap(cred => !_.isEmpty(cred.type) && cred.type[0] === 'VerifiableCredential' ? cred.type.slice(1) : cred.type);

    if (!data.credentialRequestsInfo) {
      // short circuit as no requests for credentials
      return {
        credentialTypesIssued: credentialTypesIssuedByDidAssociation
      };
    }

    // Issuer entities added to params in before hook getIssuerEntities
    const proveIssuer: IssuerEntity = params?.proveIssuerEntity;
    const hvIssuer: IssuerEntity = params?.hvIssuerEntity;
    const { credentialRequestsInfo: { issuerDid } } = data;

    // handling credential requests for which ever issuer is being specified. Can only be one per request.
    if (proveIssuer.did === issuerDid) {
      const proveResult = await this.handleProveCredentials(data, params);

      return {
        // return the credential types requested that were issued by the HV issuer + those issued part of the did association
        credentialTypesIssued: proveResult.credentialTypesIssued.concat(credentialTypesIssuedByDidAssociation)
      };
    } else if (hvIssuer.did === issuerDid) {
      const hvResult = await this.handleHvCredentials(data, params);

      return {
        // return the credential types requested that were issued by the HV issuer + those issued part of the did association
        credentialTypesIssued: hvResult.credentialTypesIssued.concat(credentialTypesIssuedByDidAssociation)
      };
    } else {
      throw new BadRequest(`Unsupported issuerDid in /userCredentialRequest ${issuerDid}`);
    }
  }
}
