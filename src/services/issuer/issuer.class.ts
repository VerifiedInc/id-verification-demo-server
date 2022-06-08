import { NullableId, Params } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';

type WalletIssuerCreateOptions = Partial<IssuerEntity>;

export interface IssuerDto {
  did: string;
}

export class IssuerService {
  /* eslint-disable no-useless-constructor */
  constructor (private app: Application) {}

  async create (data: WalletIssuerCreateOptions): Promise<IssuerEntity> {
    const issuerEntity = await this.app.service('issuerEntity').create(data);

    return issuerEntity;
  }

  async get (uuid: NullableId, params?: Params): Promise<IssuerEntity> {
    try {
      const issuerEntity = await this.app.service('issuerEntity').get(
        uuid,
        params
      );
      return issuerEntity;
    } catch (e) {
      logger.error('IssuerService.get caught an error thrown by IssuerEntityService.get', e);
      throw e;
    }
  }
}
