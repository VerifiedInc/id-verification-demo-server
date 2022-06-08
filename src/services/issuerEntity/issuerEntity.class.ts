import { IssuerEntity } from '../../entities/Issuer';
import { Service as MikroOrmService } from 'feathers-mikro-orm';
import logger from '../../logger';

export class IssuerEntityService extends MikroOrmService<IssuerEntity> {
  async getDefaultIssuerEntity (): Promise<IssuerEntity> {
    try {
      const defaultIssuerEntity: IssuerEntity[] = await this.find() as IssuerEntity[];
      return defaultIssuerEntity[0];
    } catch (e) {
      logger.error('IssuerEntityService.getDefaultEntity caught an error thrown by this.find', e);
      throw e;
    }
  }
}
