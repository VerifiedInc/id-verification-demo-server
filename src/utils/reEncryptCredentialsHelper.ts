import { reEncryptCredentials, UnumDto } from '@unumid/server-sdk';
import { CredentialPb } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { formatBearerToken } from './formatBearerToken';

export const reEncryptCredentialsHelper = async (
  issuerEntity: IssuerEntity,
  userDid: string,
  credentialTypes: string[]
): Promise<UnumDto<CredentialPb[]>> => {
  let unumDtoCredentialResponse;

  const { authToken, did, signingPrivateKey, encryptionKeyId, encryptionPrivateKey } = issuerEntity;

  try {
    logger.debug(`Calling reEncryptCredentials for user ${userDid}`);

    unumDtoCredentialResponse = await reEncryptCredentials(
      formatBearerToken(authToken),
      did,
      signingPrivateKey,
      encryptionPrivateKey,
      userDid,
      encryptionKeyId,
      credentialTypes
    );

    return unumDtoCredentialResponse as UnumDto<CredentialPb[]>;
  } catch (e) {
    logger.error(`reEncryptCredentials caught an error thrown by the server sdk. ${e}`);
    throw e;
  }
};
