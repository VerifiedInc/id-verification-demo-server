import { issueCredentials, UnumDto } from '@unumid/server-sdk';
import { CredentialData, CredentialPb, CredentialSubject } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { formatBearerToken } from './formatBearerToken';

export interface PhoneCredentialSubject extends CredentialData {
  id: string;
  phone: string;
}

export interface DobCredentialSubject extends CredentialData {
  id: string;
  dob: string;
}

export interface SsnCredentialSubject extends CredentialData {
  id: string;
  ssn: string;
}

export interface FullNameCredentialSubject extends CredentialData {
  id: string;
  fullName: string;
}

export interface FirstNameCredentialSubject extends CredentialData {
  id: string;
  firstName: string;
}

export interface LastNameCredentialSubject extends CredentialData {
  id: string;
  lastName: string;
}

export interface AddressCredentialSubject extends CredentialData {
  id: string;
  address: string;
}

export interface GenderCredentialSchema extends CredentialData {
  id: string;
  gender: string;
}

export const issueCredentialsHelper = async (
  issuerEntity: IssuerEntity,
  credentialSubject: string,
  credentialDataList: CredentialData[]
): Promise<UnumDto<CredentialPb[]>> => {
  let authCredentialResponse;

  try {
    logger.debug(`Calling issuerCredentials with date list: ${JSON.stringify(credentialDataList)}`);

    authCredentialResponse = await issueCredentials(
      formatBearerToken(issuerEntity.authToken),
      issuerEntity.did,
      credentialSubject,
      credentialDataList,
      issuerEntity.signingPrivateKey
    );

    return authCredentialResponse as UnumDto<CredentialPb[]>;
  } catch (e) {
    logger.error(`issueCredentials caught an error thrown by the server sdk. ${e}`);
    throw e;
  }
};

export function buildDobCredentialSubject (did: string, dob: string): DobCredentialSubject {
  return {
    id: did,
    type: 'DobCredential',
    dob
  };
}

export function buildSsnCredentialSubject (did: string, ssn: string): SsnCredentialSubject {
  return {
    id: did,
    type: 'SsnCredential',
    ssn
  };
}

export function buildPhoneCredentialSubject (did: string, phone: string): PhoneCredentialSubject {
  return {
    id: did,
    type: 'PhoneCredential',
    phone
  };
}

export function buildFirstNameCredentialSubject (did: string, firstName: string): FirstNameCredentialSubject {
  return {
    id: did,
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
