import { BadRequest } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
import { registerIssuer } from '@unumid/server-sdk';
import { iff } from 'feathers-hooks-common';
import { IssuerEntityOptions } from '../../entities/Issuer';
import logger from '../../logger';
import { isExternal } from '../hooks/isExternal';
import { requireAdminAuthKey } from '../hooks/requireAdminAuthKey';

async function registerIssuerHook (ctx: HookContext): Promise<HookContext> {
  const { data } = ctx;

  if (!data) {
    throw new BadRequest();
  }

  const { apiKey, customerUuid, url } = data;

  try {
    // use the server sdk to generate keys and register the issuer with the saas
    const response = await registerIssuer(apiKey, url);
    const { body, authToken } = response;

    // format the response from the sdk to match the way we represent issuers in this application
    const {
      uuid,
      did,
      name,
      keys
    } = body;

    const issuerEntityOptions: IssuerEntityOptions = {
      issuerUuid: uuid,
      customerUuid,
      did,
      name,
      signingPrivateKey: keys.signing.privateKey,
      encryptionPrivateKey: keys.encryption.privateKey,
      signingKeyId: keys.signing.id,
      encryptionKeyId: keys.encryption.id,
      authToken,
      apiKey
    };

    return {
      ...ctx,
      data: issuerEntityOptions
    };
  } catch (e) {
    logger.error('error registering issuer', e);
    throw e;
  }
}

export default {
  before: {
    all: [iff(isExternal, requireAdminAuthKey)],
    find: [],
    get: [],
    create: [registerIssuerHook],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
