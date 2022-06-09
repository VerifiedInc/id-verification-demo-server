import { UnumDto } from '@unumid/server-sdk';
import { CredentialPb } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import { UserDto } from '../services/user/user.class';
import { ValidCredentialTypes } from '../services/userCredentialRequests/userCredentialRequests.class';
import { buildDobCredentialSubject, buildPhoneCredentialSubject, buildSsnCredentialSubject, issueCredentialsHelper } from './issueCredentialsHelper';

export async function issueUserCredentials (user: UserDto, issuer: IssuerEntity): Promise<UnumDto<CredentialPb[]>> {
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

  const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(issuer, user.did as string, credentialSubjects);

  return unumDtoCredentialsIssuedResponse;
}
