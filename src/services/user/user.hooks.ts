import { Hook, HookContext, NullableId } from '@feathersjs/feathers';
import { BadRequest, Forbidden } from '@feathersjs/errors';
import { iff, iffElse, isNot } from 'feathers-hooks-common';

// import { VerifierRequestDto } from './user.class';
import { isExternal } from '../hooks/isExternal';
import { requireAdminAuthKey } from '../hooks/requireAdminAuthKey';
import { UserEntity } from '../../entities/User';
import { UserEntityService } from '../userEntity/userEntity.class';
import { UserDto } from './user.class';
import { config } from '../../config';
import { requireAuthToken } from '../hooks/requireAuthToken';
import _ from 'lodash';
import { DateTime } from 'luxon';
import logger from '../../logger';
import { HookVariableContext } from '../../declarations';
import { createUserEmailSignature } from '../../utils/createUserEmailSignature';
import { getUserIdByAuthToken } from '../hooks/getUserIdByAuthToken';
import { isAdminKey } from '../hooks/isAdminKey';

export interface UserCreateOptions {
  email: string;
  referralCode: string;
  did?: string;
  referredBy?: string;
  authToken?: string;
  gmailHistoryId?: number;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailAccessTokenExpiration?: Date;
  gmailAccessTokenExpiresIn?: number; // Note: allowing for either expires in or the expiration date itself. The date itself is the only one persisted in User Entity.
}

export const validateUserCreateOptions: Hook<UserCreateOptions> = (ctx) => {
  const { data } = ctx;

  if (!data) {
    throw new BadRequest('data is required.');
  }

  const { email, referralCode } = data;

  if (!email) {
    throw new BadRequest('apiKey is required.');
  }

  if (!referralCode) {
    throw new BadRequest('referralCode is required.');
  }

  ctx.params.isValidated = true;
};

/**
 * Handle expires in input. Turned into expiration date.
 * @param ctx
 * @returns
 */
const handleGmailAccessTokenExpiresIn = (ctx: HookContext<UserCreateOptions>): HookContext => {
  const gmailAccessTokenExpiresIn = ctx?.data?.gmailAccessTokenExpiresIn;

  if (!gmailAccessTokenExpiresIn) {
    return ctx;
  }

  // calculate the expiration date. subtracting 1 second to be overly defensive in this calculation.
  const expirationDate = DateTime.local().plus({ seconds: gmailAccessTokenExpiresIn - 1 }).toJSDate();

  return {
    ...ctx,
    data: {
      ...ctx.data,
      gmailAccessTokenExpiration: expirationDate
    }
  };
};

export const makeUserDtoFromEntity = (entity: UserEntity): UserDto => {
  const { uuid, email, referralCode, did, referredBy, gmailHistoryId, gmailAccessToken, gmailRefreshToken, gmailAccessTokenExpiration } = entity;

  const referralUrl = `${config.WALLET_CLIENT_URL}/authenticate?referralCode=${entity.referralCode}`;
  const signature = createUserEmailSignature(referralUrl);

  return {
    uuid,
    email,
    referralCode,
    referralUrl,
    did,
    referredBy,
    signature,
    gmailHistoryId,
    gmailAccessToken,
    gmailRefreshToken,
    gmailAccessTokenExpiration
  };
};

/**
 * Ensuring the auth matches the id requested.
 * @param ctx
 * @returns
 */
async function ensureGetAuthScope (ctx: HookContext): Promise<HookContext> {
  if (ctx.params.authorization.type === 'admin') {
    // skip if admin key is being used
    return ctx;
  }

  const service: UserEntityService = ctx.app.service('userEntity');

  // grab the specified user
  const user = await service.get(ctx.id as NullableId) as UserEntity;

  // ensure that the user matches the auth token did attribute
  const authorization = ctx.params.authorization;
  if (user.did !== authorization.did) {
    throw new Forbidden(`Not authorized to get user ${ctx.id}.`);
  }

  return {
    ...ctx,
    result: user
  };
}

/**
 * Ensuring that the ctx.id is specified, enforcing a single entity patch.
 * @param ctx
 * @returns
 */
async function ensureSingleEntityPatch (ctx: HookContext): Promise<HookContext> {
  if (!ctx.id) {
    throw new BadRequest('specific entity id is required.');
  }

  return ctx;
}

/**
 * Ensure the user entities found match the jwt did used.
 */
function ensureFindAuthScopeToDtos (ctx: HookContext): Promise<HookContext> {
  // queryResult will either be an array of UserEntities
  // or a Paginated object with a data property that is an array of UserEntities
  const queryResult = ctx.result;
  const userEntities = Array.isArray(queryResult) ? queryResult : queryResult.data;

  if (_.isEmpty(userEntities)) {
    logger.error('userEntities empty');
    throw new Forbidden('Not authorized to find users by that query.');
  }

  // get the authorization did, which is via the authToken
  const authDid = ctx.params.authorization.did;

  const result: UserDto[] = [];

  // loop through the encrypted credentials and create a CredentialRepositoryResponse for each
  for (const userEntity of userEntities) {
    if (authDid && authDid !== userEntity.did) {
      logger.error(`auth dids do not match ${authDid} !== ${userEntity.did}`);
      throw new Forbidden('Not authorized to find users by that query.');
    }
    result.push(makeUserDtoFromEntity(userEntity));
  }

  const newCtx = { ...ctx, result } as any;

  try {
    if (Array.isArray(queryResult)) {
      return newCtx;
    } else {
      return {
        ...queryResult,
        data: result
      };
    }
  } catch (e) {
    throw new Forbidden('Not authorized to find users by that query.');
  } finally {
    console.log('');
  }
}

/**
 * transforms a query result from the EncryptedCredentialService into the dto returned by this service
 * @param {EncryptedCredential[] | Paginated<EncryptedCredential>} queryResult the result of querying the EncryptedCredentialService
 * @returns {EncryptedCredentialsDto} a dto to return from this service
 */
function toDtos (ctx: HookContext): Promise<HookContext> {
  // queryResult will either be an array of UserEntities
  // or a Paginated object with a data property that is an array of UserEntities
  const queryResult = ctx.result;
  const userEntities = Array.isArray(queryResult) ? queryResult : queryResult.data;

  // get the authorization did, which is via the authToken
  const authDid = ctx.params.authorization.did;

  const result: UserDto[] = [];

  // loop through the encrypted credentials and create a CredentialRepositoryResponse for each
  for (const userEntity of userEntities) {
    if (authDid && authDid !== userEntity.did) {
      throw new Forbidden('Not authorized to find users by that query.');
    }
    result.push(makeUserDtoFromEntity(userEntity));
  }

  const newCtx = { ...ctx, result } as any;

  try {
    if (Array.isArray(queryResult)) {
      return newCtx;
    } else {
      return {
        ...queryResult,
        data: result
      };
    }
  } catch (e) {
    throw new Forbidden('Not authorized to find users by that query.');
  } finally {
    console.log('');
  }
}

/**
 * Make a UserDto from a UserEntity
 * @param where
 * @returns
 */
async function makeUserDtoFromEntityHook (ctx: HookContext<UserEntity>): Promise<HookVariableContext<'result', UserDto>> {
  // grab the specified user
  const user = makeUserDtoFromEntity(ctx.result as UserEntity);

  return {
    ...ctx,
    result: user
  };
}

export const hooks = {
  before: {
    create: [iff(isExternal, requireAdminAuthKey)],
    patch: [iff(isExternal, requireAuthToken('subject'), iff(isNot(isAdminKey), getUserIdByAuthToken), handleGmailAccessTokenExpiresIn, ensureSingleEntityPatch)],
    get: [iff(isExternal, requireAuthToken('subject'), ensureGetAuthScope)],
    find: [iff(isExternal, requireAuthToken('subject'))],
    remove: [iff(isExternal, requireAdminAuthKey)]
  },
  after: {
    create: [makeUserDtoFromEntityHook],
    patch: [iff(isExternal, makeUserDtoFromEntityHook)], // ensuring that a only single entity is being patched thanks to ensureSingleEntityPatch in the before hook
    get: [makeUserDtoFromEntityHook],
    find: [iffElse(isExternal, ensureFindAuthScopeToDtos, toDtos)]
  }
};
