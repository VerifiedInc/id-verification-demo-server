import { UnumDto } from '@unumid/server-sdk';
import { CredentialData, CredentialPb, CredentialSubject } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { UserDto } from '../services/user/user.class';
import { ValidCredentialTypes } from '../services/userCredentialRequests/userCredentialRequests.class';
import { buildDobCredentialSubject, buildPhoneCredentialSubject, buildSsnCredentialSubject, issueCredentialsHelper } from './issueCredentialsHelper';

// Handle issuing Prove credentials
export async function issueProveUserCredentials (user: UserDto, proveIssuer: IssuerEntity): Promise<UnumDto<CredentialPb[]>> {
  const credentialSubjects: CredentialSubject[] = [];

  if (!user.did) {
    logger.error('User did not have a did. This should never happen.');
    throw new Error('User did not have a did');
  }

  if (user.proveDob) {
    credentialSubjects.push(buildDobCredentialSubject(user.did as string, user.proveDob));
  }

  if (user.proveSsn) {
    credentialSubjects.push(buildSsnCredentialSubject(user.did as string, user.proveSsn));
  }

  if (user.provePhone) {
    credentialSubjects.push(buildPhoneCredentialSubject(user.did as string, user.provePhone));
  }

  if (user.proveFirstName) {
    credentialSubjects.push({
      id: user.did,
      firstName: user.proveFirstName
    });
  }

  if (user.proveLastName) {
    credentialSubjects.push({
      id: user.did,
      lastName: user.proveLastName
    });
  }

  const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(proveIssuer, user.did as string, credentialSubjects);

  return unumDtoCredentialsIssuedResponse;
}

// Handle issuing Prove credentials
export async function issueHvUserCredentials (user: UserDto, hvIssuer: IssuerEntity): Promise<UnumDto<CredentialPb[]>> {
  // const credentialSubjects: ValidCredentialTypes[] = [];
  const credentialSubjects: CredentialSubject[] = [];

  if (!user.did) {
    logger.error('User did not have a did. This should never happen.');
    throw new Error('User did not have a did');
  }

  if (user.hvDob) {
    credentialSubjects.push(buildDobCredentialSubject(user.did as string, user.hvDob));
  }

  if (user.hvGender) {
    credentialSubjects.push({
      id: user.did,
      gender: user.hvGender
    });
  }

  if (user.hvFullName) {
    credentialSubjects.push({
      id: user.did,
      fullName: user.hvFullName
    });
  }

  if (user.hvAddress) {
    credentialSubjects.push({
      id: user.did,
      address: user.hvAddress
    });
  }

  const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(hvIssuer, user.did as string, credentialSubjects);

  return unumDtoCredentialsIssuedResponse;
}
