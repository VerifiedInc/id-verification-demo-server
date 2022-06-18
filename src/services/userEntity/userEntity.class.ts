import { Service as MikroOrmService } from 'feathers-mikro-orm';
import logger from '../../logger';
import { UserEntity } from '../../entities/User';
import { Params } from '@feathersjs/feathers';

export class UserEntityService extends MikroOrmService<UserEntity> {
  async getByPhone (phone: string): Promise<UserEntity> {
    try {
      const entity: UserEntity = await this.get(null, { where: { provePhone: phone } }) as UserEntity;
      return entity;
    } catch (e) {
      logger.error(`UserEntityService.getByPhone caught an error thrown by this.get. ${e}`);
      throw e;
    }
  }

  async getByDid (did: string): Promise<UserEntity> {
    try {
      const entity: UserEntity = await this.get(null, { where: { did } }) as UserEntity;
      return entity;
    } catch (e) {
      logger.error(`UserEntityService.getByDid caught an error thrown by this.get. ${e}`);
      throw e;
    }
  }

  async getByUserCode (userCode: string): Promise<UserEntity> {
    try {
      const entity: UserEntity = await this.get(null, { where: { userCode } }); // will throw exception if not found
      return entity;
    } catch (e) {
      logger.error(`UserEntityService.getByDid caught an error thrown by this.get. ${e}`);
      throw e;
    }
  }
}
