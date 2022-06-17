import { UnumDto } from '@unumid/server-sdk';
import { CredentialData, CredentialPb, CredentialSubject } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { UserDto } from '../services/user/user.class';
import { ValidCredentialTypes } from '../services/userCredentialRequests/userCredentialRequests.class';
import { buildDobCredentialSubject, buildPhoneCredentialSubject, buildSsnCredentialSubject, issueCredentialsHelper } from './issueCredentialsHelper';

// Handle issuing Prove credentials
export async function issueProveUserCredentials (user: UserDto, proveIssuer: IssuerEntity): Promise<UnumDto<CredentialPb[]>> {
  const credentialSubjects: ValidCredentialTypes[] = [];

  if (user.dob) {
    credentialSubjects.push(buildDobCredentialSubject(user.did as string, user.dob));
  }

  if (user.ssn) {
    credentialSubjects.push(buildSsnCredentialSubject(user.did as string, user.ssn));
  }

  if (user.phone) {
    credentialSubjects.push(buildPhoneCredentialSubject(user.did as string, user.phone));
  }

  const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(proveIssuer, user.did as string, credentialSubjects);

  return unumDtoCredentialsIssuedResponse;
}

// Handle issuing Prove credentials
export async function issueHvUserCredentials (user: UserDto, hvIssuer: IssuerEntity): Promise<UnumDto<CredentialPb[]>> {
  // const credentialSubjects: ValidCredentialTypes[] = [];
  const credentialSubjects: CredentialSubject[] = [];

  if (!user.did) {
    logger.error('User did not have a did. This shold never happen.');
    throw new Error('User did not have a did');
  }

  if (user.hvDob) {
    credentialSubjects.push(buildDobCredentialSubject(user.did as string, user.hvDob));
  }

  if (user.hvGender) {
    credentialSubjects.push(buildSsnCredentialSubject(user.did as string, user.hvGender));
  }

  if (user.hvFullName) {
    credentialSubjects.push(buildPhoneCredentialSubject(user.did as string, user.hvFullName));
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
