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
import _ from 'lodash';
import logger from '../../logger';
import { HookVariableContext } from '../../declarations';

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

export const makeUserDtoFromEntity = (entity: UserEntity): UserDto => {
  const { uuid, phone, firstName, did, userCode, dob, ssn } = entity;

  return {
    uuid,
    phone,
    did,
    firstName,
    userCode,
    dob,
    ssn
  };
};

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
    remove: [iff(isExternal, requireAdminAuthKey)]
  },
  after: {
    create: [makeUserDtoFromEntityHook],
    get: [makeUserDtoFromEntityHook]
  }
};
