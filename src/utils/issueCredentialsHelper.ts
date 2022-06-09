import { issueCredentials, UnumDto } from '@unumid/server-sdk';
import { CredentialData, CredentialPb } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { formatBearerToken } from './formatBearerToken';

export interface PhoneCredentialSubject extends CredentialData{
  id: string;
  phone: string;
}

export interface DobCredentialSubject extends CredentialData{
  id: string;
  dob: string;
}

export interface SsnCredentialSubject extends CredentialData{
  id: string;
  ssn: string;
}

export const issueCredentialsHelper = async (
  issuerEntity: IssuerEntity,
  credentialSubject: string,
  credentialDataList: CredentialData[]
): Promise<UnumDto<CredentialPb[]>> => {
  let authCredentialResponse;

  try {
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
