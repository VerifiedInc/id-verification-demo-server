import { issueCredentials, UnumDto } from '@unumid/server-sdk';
import { issueCredentials as issueCredentialsV3 } from '@unumid/server-sdk-v3';
import { CredentialData, CredentialPb, CredentialSubject } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { formatBearerToken } from './formatBearerToken';

export interface PhoneCredentialSubject extends CredentialData {
  phone: string;
}

export interface DobCredentialSubject extends CredentialData {
  dob: string;
}

export interface SsnCredentialSubject extends CredentialData {
  ssn: string;
}

export interface FullNameCredentialSubject extends CredentialData {
  fullName: string;
}

export interface FirstNameCredentialSubject extends CredentialData {
  firstName: string;
}

export interface LastNameCredentialSubject extends CredentialData {
  lastName: string;
}

export interface AddressCredentialSubject extends CredentialData {
  address: string;
}

export interface GenderCredentialSchema extends CredentialData {
  id: string;
  gender: string;
}

export const issueCredentialsHelper = async (
  issuerEntity: IssuerEntity,
  userDid: string,
  credentialDataList: CredentialData[],
  version: string
): Promise<UnumDto<CredentialPb[]>> => {
  let unumDtoCredentialResponse: UnumDto<CredentialPb[]>;

  try {
    logger.debug(`Calling issuerCredentials with date list: ${JSON.stringify(credentialDataList)}`);

    if (version === '1.0.0') {
      unumDtoCredentialResponse = await issueCredentialsV3(
        formatBearerToken(issuerEntity.authToken),
        issuerEntity.did,
        userDid,
        credentialDataList,
        issuerEntity.signingPrivateKey
      ) as UnumDto<CredentialPb[]>;
    } else {
      unumDtoCredentialResponse = await issueCredentials(
        formatBearerToken(issuerEntity.authToken),
        issuerEntity.did,
        userDid,
        credentialDataList,
        issuerEntity.signingPrivateKey
      ) as UnumDto<CredentialPb[]>;
    }

    return unumDtoCredentialResponse;
  } catch (e) {
    logger.error(`issueCredentials caught an error thrown by the server sdk. ${e}`);
    throw e;
  }
};

export function buildDobCredentialSubject (dob: string): DobCredentialSubject {
  return {
    type: 'DobCredential',
    dob
  };
}

export function buildSsnCredentialSubject (ssn: string): SsnCredentialSubject {
  return {
    type: 'SsnCredential',
    ssn
  };
}

export function buildPhoneCredentialSubject (phone: string): PhoneCredentialSubject {
  return {
    type: 'PhoneCredential',
    phone
  };
}

export function buildFirstNameCredentialSubject (firstName: string): FirstNameCredentialSubject {
  return {
    type: 'FirstNameCredential',
    firstName
  };
}

export function buildAtomicCredentialData (type: string, key: string, value: string): CredentialData {
  const subject: CredentialData = {
    type
  };

  subject[key] = value;
  return subject;
}

export function buildAtomicCredentialSubject (did: string, type: string, key: string, value: string): CredentialSubject {
  const subject: CredentialSubject = {
    id: did,
    type
  };

  subject[key] = value;
  return subject;
}
