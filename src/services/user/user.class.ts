import { NotFound } from '@feathersjs/errors';
import { Application, NullableId, Paginated, Params } from '@feathersjs/feathers';
import { WalletUserCreateOptions } from '@unumid/web-wallet-types';
import { AxiosResponse } from 'axios';
import { config } from '../../config';
import { UserEntity, UserEntityOptions } from '../../entities/User';
import logger from '../../logger';
import { formatBearerToken } from '../../utils/formatBearerToken';
import { UserEntityService } from '../userEntity/userEntity.class';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions {}

export interface UserDto {
  uuid: string;
  email: string;
  referralCode: string;
  referralUrl: string;
  signature: string;
  did?: string;
  referredBy?: string;
  gmailHistoryId?: number;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailAccessTokenExpiration?: Date;
}

export class UserService {
  app: Application;
  options: ServiceOptions;
  entityService: UserEntityService

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.entityService = app.service('userEntity');
  }

  async create (data: UserEntityOptions, params?: Params): Promise<UserEntity> {
    let entity: UserEntity;

    // ensure that a user with the email does not already exist
    try {
      entity = await this.entityService.getByEmail(data.email);

      if (entity) {
        logger.info(`User with email ${data.email} already exists with uuid ${entity.uuid}`);
        return entity;
      }
    } catch (e) {
      logger.warn(`UserService.get caught an error thrown by UserEntityService.get. Most likely a 404. ${e}. This is expected. Swallowing so the user can be created.`);
    }

    try {
      entity = await this.entityService.create(data, params);
    } catch (e) {
      logger.error('UserService.create caught an error thrown by UserEntityService.create', e);
      throw e;
    }

    return entity;
  }

  async get (uuid: NullableId, params?: Params): Promise<UserEntity> {
    let entity: UserEntity;
    try {
      entity = await this.entityService.get(uuid, params);
    } catch (e) {
      logger.error('UserService.get caught an error thrown by UserEntityService.get', e);
      throw e;
    }

    return entity;
  }

  async getByEmail (email: string): Promise<UserEntity> {
    try {
      const entity = await this.entityService.getByEmail(email);
      return entity;
    } catch (e) {
      logger.error(`UserService.getByEmail caught an error thrown by this.get. ${e}`);
      throw e;
    }
  }

  async find (params?: Params): Promise<UserEntity[] | Paginated<UserEntity>> {
    let entities: UserEntity[] | Paginated<UserEntity>;
    try {
      entities = await this.entityService.find(params);
    } catch (e) {
      logger.error('UserService.get caught an error thrown by UserEntityService.get', e);
      throw e;
    }

    return entities;
  }

  async patch (uuid: NullableId, data: Partial<UserEntity>, params: Params): Promise<UserEntity | UserEntity[]> {
    try {
      const patchResponse: UserEntity | UserEntity[] = await this.entityService.patch(uuid, data, params);
      return patchResponse;
    } catch (e) {
      logger.error('UserService.patch caught an error thrown by UserEntityService.patch', e);
      throw e;
    }
  }

  /**
   * Remove user functionality. This is strictly for internal testing usage to allow for resetting verified emails.
   * @param uuid
   * @param params
   * @returns
   */
  async remove (uuid: NullableId, params?: Params): Promise<{success: boolean} | UserEntity> {
    let entity: UserEntity | {success: boolean};
    try {
      // First get the user. This is ensure that a query that can not be written that hits all records in the db by accident.
      entity = await this.entityService.get(uuid);

      if (!entity) {
        logger.info(`User with uuid ${uuid} does not exist`);
        throw new NotFound(`User with uuid ${uuid} does not exist`);
      }

      // then remove the user from the wallet db
      const walletClient = this.app.get('wallet');

      try {
        // call out to the wallet server to delete the user from the wallet db
        const response: AxiosResponse = await walletClient.service('user').remove(
          null,
          {
            query: {
              where: {
                email: entity.email, referralCode: entity.referralCode
              } as WalletUserCreateOptions
            },
            headers: { Authorization: formatBearerToken(config.WALLET_ADMIN_AUTH_KEY) }
          });

        const user = response.data as UserDto;

        if (!user) {
          throw new Error('No user delete in wallet server');
        }
        logger.info(`Successfully delete response from wallet server in regard to user with email ${user.email} and uuid ${user.uuid}`);
      } catch (e) {
        logger.error('User.remove caught an error thrown by walletClient.User.delete', e);
        throw e;
      }

      entity = await this.entityService.remove(uuid, params);
    } catch (e) {
      logger.error('UserService.remove caught an error thrown by UserEntityService.remove', e);
      throw e;
    }

    return entity;
  }
}
