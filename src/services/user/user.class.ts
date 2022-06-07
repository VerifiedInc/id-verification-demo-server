import { NotFound } from '@feathersjs/errors';
import { Application, NullableId, Paginated, Params } from '@feathersjs/feathers';
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
  firstName?: string;
  did?: string;
  userCode?: string;
  phone: string;
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

    // ensure that a user with the phone does not already exist
    try {
      entity = await this.entityService.getByEmail(data.phone);

      if (entity) {
        logger.info(`User with email ${data.phone} already exists with uuid ${entity.uuid}`);
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
}
