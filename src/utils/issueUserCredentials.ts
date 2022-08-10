import { UnumDto } from '@unumid/server-sdk';
import { CredentialData, CredentialPb, CredentialSubject } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { UserDto } from '../services/user/user.class';
import { ValidCredentialTypes } from '../services/userCredentialRequests/userCredentialRequests.class';
import { buildDobCredentialSubject, buildPhoneCredentialSubject, buildSsnCredentialSubject, issueCredentialsHelper } from './issueCredentialsHelper';

// Handle issuing Prove credentials
export async function issueProveUserCredentials (user: UserDto, proveIssuer: IssuerEntity): Promise<UnumDto<CredentialPb[]>> {
  const credentialSubjects: CredentialData[] = [];

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

  const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(proveIssuer, user.did as string, credentialSubjects);

  return unumDtoCredentialsIssuedResponse;
}

// Handle issuing Prove credentials
export async function issueHvUserCredentials (user: UserDto, hvIssuer: IssuerEntity): Promise<UnumDto<CredentialPb[]>> {
  // const credentialSubjects: ValidCredentialTypes[] = [];
  const credentialSubjects: CredentialData[] = [];

  logger.info(`Issuing hyperverge credentials to user ${user.did}`);

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
      type: 'GenderCredential',
      gender: user.hvGender
    });
  }

  if (user.hvFullName) {
    credentialSubjects.push({
      id: user.did,
      type: 'FullNameCredential',
      fullName: user.hvFullName
    });
  }

  if (user.hvAddress) {
    credentialSubjects.push({
      id: user.did,
      type: 'AddressCredential',
      address: user.hvAddress
    });
  }

  if (user.hvDocCountry) {
    credentialSubjects.push({
      id: user.did,
      type: 'CountryResidenceCredential',
      country: user.hvDocCountry
    });
  }

  if (user.hvDocType) {
    credentialSubjects.push({
      id: user.did,
      type: 'GovernmentIdTypeCredential',
      documentType: user.hvDocType
    });
  }

  if (user.hvLiveFace) {
    credentialSubjects.push({
      id: user.did,
      type: 'LivelinessCredential',
      liveliness: user.hvLiveFace
    });
  }

  if (user.hvLiveFaceConfidence) {
    credentialSubjects.push({
      id: user.did,
      type: 'LivelinessConfidenceCredential',
      confidence: user.hvLiveFaceConfidence
    });
  }

  if (user.hvFaceMatch) {
    credentialSubjects.push({
      id: user.did,
      type: 'FacialMatchCredential',
      match: user.hvFaceMatch
    });
  }

  if (user.hvFaceMatchConfidence) {
    credentialSubjects.push({
      id: user.did,
      type: 'FacialMatchConfidenceCredential',
      confidence: user.hvFaceMatchConfidence
    });
  }

  /**
   * Image credentials are commented out for now... WIP to support encryption of base64 images in server-sdk.
   */
  // if (user.hvDocImage) {
  //   credentialSubjects.push({
  //     id: user.did,
  //     type: 'GovernmentIdDocumentImageCredential',
  //     image: user.hvDocImage
  //   });
  // }

  // if (user.hvFaceImage) {
  //   credentialSubjects.push({
  //     id: user.did,
  //     type: 'FacialImageCredential',
  //     image: user.hvFaceImage
  //   });
  // }

  logger.debug(`Created ${credentialSubjects.length} credential subjects for hyperverge credentials for user ${user.did}`);

  const unumDtoCredentialsIssuedResponse: UnumDto<CredentialPb[]> = await issueCredentialsHelper(hvIssuer, user.did as string, credentialSubjects);

  return unumDtoCredentialsIssuedResponse;
}
