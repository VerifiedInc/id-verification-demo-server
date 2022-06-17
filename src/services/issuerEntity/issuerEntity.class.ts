import { IssuerEntity } from '../../entities/Issuer';
import { Service as MikroOrmService } from 'feathers-mikro-orm';
import logger from '../../logger';
import { config } from '../../config';

export class IssuerEntityService extends MikroOrmService<IssuerEntity> {
  async getProveIssuerEntity (): Promise<IssuerEntity> {
    try {
      const defaultIssuerEntity: IssuerEntity[] = await this.find({
        query: {
          did: config.PROVE_ISSUER_DID
        }
      }) as IssuerEntity[];
      return defaultIssuerEntity[0];
    } catch (e) {
      logger.error('IssuerEntityService.getProveIssuerEntity caught an error thrown by this.find', e);
      throw e;
    }
  }

  async getHyperVergeIssuerEntity (): Promise<IssuerEntity> {
    try {
      const defaultIssuerEntity: IssuerEntity[] = await this.find({
        query: {
          did: config.HV_ISSUER_DID
        }
      }) as IssuerEntity[];
      return defaultIssuerEntity[0];
    } catch (e) {
      logger.error('IssuerEntityService.getHyperVergeIssuerEntity caught an error thrown by this.find', e);
      throw e;
    }
  }
}
