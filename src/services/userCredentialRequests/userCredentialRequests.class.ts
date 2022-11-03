import { Application, Params } from '@feathersjs/feathers';

import { CredentialData, Credential, SubjectCredentialRequestsEnrichedDto } from '@unumid/types';
import { UnumDto, extractCredentialType, handleSubjectCredentialRequests, HandleSubjectCredentialRequestsOptions } from '@unumid/server-sdk';
import { CredentialRequest } from '@unumid/types/build/protos/credential';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';
import { UserDto } from '../user/user.class';
import { buildDobCredentialSubject, buildPhoneCredentialSubject, buildSsnCredentialSubject, DobCredentialSubject, issueCredentialsHelper, PhoneCredentialSubject, SsnCredentialSubject } from '../../utils/issueCredentialsHelper';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';
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

    /**
     * Using the server SDK's handleSubjectCredentialRequests helper to handle the subjectCredentialRequest verification and for re-encryption of the credentials for target user.
     * This made possible by using the default issuerCredentials call which makes a copy of the user credentials available to the issuer keys.
     * The benefit of this default is the Issuer does *not* have to store the user's credentials in the their (this demo's) data store.
     */
    const inputs: HandleSubjectCredentialRequestsOptions = {
      authorization: formatBearerToken(proveIssuer.authToken),
      issuerDid: proveIssuer.did,
      subjectDid,
      subjectCredentialRequests,
      reEncryptCredentialsOptions: {
        signingPrivateKey: proveIssuer.signingPrivateKey,
        encryptionPrivateKey: proveIssuer.encryptionPrivateKey,
        issuerEncryptionKeyId: proveIssuer.encryptionKeyId
      }
    };
    const unumDtoCredentialsReEncryptedResponse: UnumDto<Credential[]> = await handleSubjectCredentialRequests(inputs);
    logger.debug(`handleSubjectCredentialRequests response: ${JSON.stringify(unumDtoCredentialsReEncryptedResponse)}`);

    // get the credential types from the re-encrypted credentials
    const credentialTypesReEncrypted: string[] = unumDtoCredentialsReEncryptedResponse.body.flatMap((credential: Credential) => extractCredentialType(credential.type)[0]);

    const credentialTypesRequested: string[] = subjectCredentialRequests.credentialRequests.map((req: CredentialRequest) => req.type);
    logger.debug(`credentialTypesRequested: ${JSON.stringify(credentialTypesRequested)}`);

    // take the difference of the credentials that were able to be re-encrypted with those requested.
    const credentialTypesToIssue: string[] = credentialTypesRequested.filter((type: string) => !credentialTypesReEncrypted.includes(type));
    logger.info(`credentialTypesToIssue that were not able to be handled by handleSubjectCredentialRequests: ${JSON.stringify(credentialTypesToIssue)}`);

    /**
     * We need some logic to determine if we have the data related to the user to issue the requested credentials that were not able to be handled via re-encryption.
     */
    const credentialSubjects: CredentialData[] = [];
    credentialTypesToIssue.forEach((type: string) => {
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

    const unumDtoCredentialsIssuedResponse: UnumDto<Credential[]> = await issueCredentialsHelper(proveIssuer, subjectDid, credentialSubjects);

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

    /**
     * Using the server SDK's handleSubjectCredentialRequests helper to handle the subjectCredentialRequest verification and for re-encryption of the credentials for target user.
     * This made possible by using the default issuerCredentials call which makes a copy of the user credentials available to the issuer keys.
     * The benefit of this default is the Issuer does *not* have to store the user's credentials in the their (this demo's) data store.
     */
    const inputs: HandleSubjectCredentialRequestsOptions = {
      authorization: formatBearerToken(hvIssuer.authToken),
      issuerDid: hvIssuer.did,
      subjectDid,
      subjectCredentialRequests,
      reEncryptCredentialsOptions: {
        signingPrivateKey: hvIssuer.signingPrivateKey,
        encryptionPrivateKey: hvIssuer.encryptionPrivateKey,
        issuerEncryptionKeyId: hvIssuer.encryptionKeyId
      }
    };
    const unumDtoCredentialsReEncryptedResponse: UnumDto<Credential[]> = await handleSubjectCredentialRequests(inputs);
    logger.debug(`handleSubjectCredentialRequests response: ${JSON.stringify(unumDtoCredentialsReEncryptedResponse)}`);

    // get the credential types from the re-encrypted credentials
    const credentialTypesReEncrypted: string[] = unumDtoCredentialsReEncryptedResponse.body.flatMap((credential: Credential) => extractCredentialType(credential.type)[0]);

    const credentialTypesRequested: string[] = subjectCredentialRequests.credentialRequests.map((req: CredentialRequest) => req.type);
    logger.debug(`credentialTypesRequested: ${JSON.stringify(credentialTypesRequested)}`);

    // take the difference of the credentials that were able to be re-encrypted with those requested.
    const credentialTypesToIssue: string[] = credentialTypesRequested.filter((type: string) => !credentialTypesReEncrypted.includes(type));
    logger.info(`credentialTypesToIssue that were not able to be handled by handleSubjectCredentialRequests: ${JSON.stringify(credentialTypesToIssue)}`);

    /**
     * We need some logic to determine if we have the data related to the user to issue the requested credentials that were not able to be handled via re-encryption.
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

    const unumDtoCredentialsIssuedResponse: UnumDto<Credential[]> = await issueCredentialsHelper(hvIssuer, subjectDid, credentialSubjects);

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
