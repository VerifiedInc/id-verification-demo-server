import { UnumDto } from '@unumid/server-sdk';
import { CredentialData, CredentialPb } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { UserDto } from '../services/user/user.class';
import { buildDobCredentialSubject, buildPhoneCredentialSubject, buildSsnCredentialSubject, issueCredentialsHelper } from './issueCredentialsHelper';

// Handle issuing Prove credentials
export async function issueProveUserCredentials (user: UserDto, proveIssuer: IssuerEntity, version: string): Promise<UnumDto<CredentialPb[]>> {
  const credentialSubjects: CredentialData[] = [];

  if (!user.did) {
    logger.error('User did not have a did. This should never happen.');
    throw new Error('User did not have a did');
  }

  if (user.proveDob) {
    credentialSubjects.push(buildDobCredentialSubject(user.proveDob));
  }

  if (user.proveSsn) {
    credentialSubjects.push(buildSsnCredentialSubject(user.proveSsn));
  }

  if (user.provePhone) {
    credentialSubjects.push(buildPhoneCredentialSubject(user.provePhone));
  }

  if (user.proveFirstName) {
    credentialSubjects.push({
      id: user.did,
      type: 'FirstNameCredential',
      firstName: user.proveFirstName
    });
  }

  if (user.proveLastName) {
    credentialSubjects.push({
      id: user.did,
      type: 'LastNameCredential',
      lastName: user.proveLastName
    });
  }

  const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(proveIssuer, user.did as string, credentialSubjects, version);

  return unumDtoCredentialsIssuedResponse;
}

// Handle issuing Prove credentials
export async function issueHvUserCredentials (user: UserDto, hvIssuer: IssuerEntity, version: string): Promise<UnumDto<CredentialPb[]>> {
  // const credentialSubjects: ValidCredentialTypes[] = [];
  const credentialSubjects: CredentialData[] = [];

  logger.info(`Issuing hyperverge credentials to user ${user.did}`);

  if (!user.did) {
    logger.error('User did not have a did. This should never happen.');
    throw new Error('User did not have a did');
  }

  if (user.hvDob) {
    credentialSubjects.push(buildDobCredentialSubject(user.hvDob));
  }

  if (user.hvGender) {
    credentialSubjects.push({
      type: 'GenderCredential',
      gender: user.hvGender
    });
  }

  if (user.hvFullName) {
    credentialSubjects.push({
      type: 'FullNameCredential',
      fullName: user.hvFullName
    });
  }

  if (user.hvAddress) {
    credentialSubjects.push({
      type: 'AddressCredential',
      address: user.hvAddress
    });
  }

  if (user.hvLiveFace) {
    credentialSubjects.push({
      type: 'LivelinessCredential',
      liveliness: user.hvLiveFace
    });
  }

  if (user.hvDocCountry) {
    credentialSubjects.push({
      type: 'CountryResidenceCredential',
      country: user.hvDocCountry
    });
  }

  if (user.hvDocType) {
    credentialSubjects.push({
      type: 'GovernmentIdTypeCredential',
      documentType: user.hvDocType
    });
  }

  if (user.hvLiveFaceConfidence) {
    credentialSubjects.push({
      type: 'LivelinessConfidenceCredential',
      confidence: user.hvLiveFaceConfidence
    });
  }

  if (user.hvFaceMatch) {
    credentialSubjects.push({
      type: 'FacialMatchCredential',
      match: user.hvFaceMatch
    });
  }

  if (user.hvFaceMatchConfidence) {
    credentialSubjects.push({
      type: 'FacialMatchConfidenceCredential',
      confidence: user.hvFaceMatchConfidence
    });
  }

  /**
   * Image credentials
   */
  if (user.hvDocImage) {
    credentialSubjects.push({
      type: 'GovernmentIdDocumentImageCredential',
      image: user.hvDocImage
    });
  }

  if (user.hvFaceImage) {
    credentialSubjects.push({
      type: 'FacialImageCredential',
      image: user.hvFaceImage
    });
  }

  logger.debug(`Created ${credentialSubjects.length} credential subjects for hyperverge credentials for user ${user.did}`);

  const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(hvIssuer, user.did as string, credentialSubjects, version);

  logger.info(`Successfully issued ${unumDtoCredentialsIssuedResponse.body.length} hyperverge credentials to user ${user.did}`);

  return unumDtoCredentialsIssuedResponse;
}
