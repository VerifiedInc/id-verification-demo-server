import { Application, Params, Service } from '@feathersjs/feathers';

import { CredentialData, CredentialPb, SubjectCredentialRequests, SubjectCredentialRequestsEnrichedDto } from '@unumid/types';
import { UnumDto, VerifiedStatus, verifySubjectCredentialRequests } from '@unumid/server-sdk';
import { CredentialRequest } from '@unumid/types/build/protos/credential';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';
import { UserDto } from '../user/user.class';
import { buildAtomicCredentialData, buildAtomicCredentialSubject, buildDobCredentialSubject, buildPhoneCredentialSubject, buildSsnCredentialSubject, DobCredentialSubject, issueCredentialsHelper, PhoneCredentialSubject, SsnCredentialSubject } from '../../utils/issueCredentialsHelper';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';

export type ValidCredentialTypes = PhoneCredentialSubject | SsnCredentialSubject | DobCredentialSubject;

export type CredentialsIssuedResponse = {
  credentialTypesIssued: string[]
 };

export interface UserCredentialRequests extends SubjectCredentialRequestsEnrichedDto {
  user: UserDto;
  credentialsIssuedByDidAssociation: CredentialPb[]
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

    const verification: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequests(proveIssuer.authToken, proveIssuer.did, subjectDid, subjectCredentialRequests);

    if (!verification.body.isVerified) {
      logger.error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
      throw new Error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
    }

    // Note in the userDidAssociation hook we have already ensured that the user has an associated did.
    const userDid = user.did as string;

    /**
     * Now that we have verified the credential requests signature signed by the subject, aka user, and we
     * have confirmed to have a user with the matching did in our data store, we need some logic to determine if we can
     * issue the requested credentials.
     *
     * For demonstration purposes just simply full-filling email, kyc and auth credential requests.
     */
    const credentialSubjects: CredentialData[] = [];
    subjectCredentialRequests.credentialRequests.forEach((credentialRequest: CredentialRequest) => {
      if (credentialRequest.type === 'DobCredential' && user.proveDob) {
        credentialSubjects.push(buildDobCredentialSubject(userDid, user.proveDob));
      } else if (credentialRequest.type === 'SsnCredential' && user.proveSsn) {
        credentialSubjects.push(buildSsnCredentialSubject(userDid, user.proveSsn));
      } else if (credentialRequest.type === 'PhoneCredential' && user.provePhone) {
        credentialSubjects.push(buildPhoneCredentialSubject(userDid, user.provePhone));
      } else if (credentialRequest.type === 'FirstNameCredential' && user.proveFirstName) {
        credentialSubjects.push({ type: 'LastNameCredential', firstName: user.proveFirstName });
      } else if (credentialRequest.type === 'LastNameCredential' && user.proveLastName) {
        credentialSubjects.push({ type: 'LastNameCredential', lastName: user.proveLastName });
      }
    });

    const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(proveIssuer, userDid, credentialSubjects);

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

    // Note in the userDidAssociation hook we have already ensured that the user has an associated did.
    const userDid = user.did as string;

    /**
     * Now that we have verified the credential requests signature signed by the subject, aka user, and we
     * have confirmed to have a user with the matching did in our data store, we need some logic to determine if we can
     * issue the requested credentials.
     *
     * For demonstration purposes just simply full-filling email, kyc and auth credential requests.
     */
    const credentialSubjects: CredentialData[] = [];
    subjectCredentialRequests.credentialRequests.forEach((credentialRequest: CredentialRequest) => {
      if (credentialRequest.type === 'DobCredential' && user.hvDob) {
        credentialSubjects.push(buildDobCredentialSubject(userDid, user.hvDob));
      } else if (credentialRequest.type === 'GenderCredential' && user.hvGender) {
        credentialSubjects.push({ type: 'GenderCredential', gender: user.hvGender });
      } else if (credentialRequest.type === 'FullNameCredential' && user.hvFullName) {
        credentialSubjects.push({ type: 'FullNameCredential', fullName: user.hvFullName });
      } else if (credentialRequest.type === 'AddressCredential' && user.hvAddress) {
        credentialSubjects.push({ type: 'AddressCredential', address: user.hvAddress });
      } else if (credentialRequest.type === 'GovernmentIdDocumentImageCredential' && user.hvDocImage) {
        credentialSubjects.push({ type: 'GovernmentIdDocumentImageCredential', image: user.hvDocImage });
      } else if (credentialRequest.type === 'CountryResidenceCredential' && user.hvDocCountry) {
        credentialSubjects.push({ type: 'CountryResidenceCredential', country: user.hvDocCountry });
      } else if (credentialRequest.type === 'GovernmentIdTypeCredential' && user.hvDocType) {
        credentialSubjects.push({ type: 'GovernmentIdTypeCredential', documentType: user.hvDocType });
      } else if (credentialRequest.type === 'FacialImageCredential' && user.hvFaceImage) {
        credentialSubjects.push({ type: 'FacialImageCredential', image: user.hvFaceImage });
      } else if (credentialRequest.type === 'LivelinessCredential' && user.hvLiveFace) {
        credentialSubjects.push({ type: 'LivelinessCredential', liveliness: user.hvLiveFace });
      } else if (credentialRequest.type === 'LivelinessConfidenceCredential' && user.hvLiveFaceConfidence) {
        credentialSubjects.push({ type: 'LivelinessConfidenceCredential', confidence: user.hvLiveFaceConfidence });
      } else if (credentialRequest.type === 'FacialMatchCredential' && user.hvFaceMatch) {
        credentialSubjects.push({ type: 'FacialMatchCredential', match: user.hvFaceMatch });
      } else if (credentialRequest.type === 'FacialMatchConfidenceCredential' && user.hvFaceMatchConfidence) {
        credentialSubjects.push({ type: 'FacialMatchConfidenceCredential', confidence: user.hvFaceMatchConfidence });
      }
    });

    const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(hvIssuer, userDid, credentialSubjects);

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

    return {
      credentialTypesIssued: credentialSubjects.map((credentialSubject: CredentialData) => credentialSubject.type)
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
