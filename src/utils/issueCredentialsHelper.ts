import { issueCredentials, UnumDto } from '@unumid/server-sdk';
import { CredentialData, CredentialPb } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { formatBearerToken } from './formatBearerToken';

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
