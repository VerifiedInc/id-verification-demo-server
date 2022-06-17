import { Hook } from '@feathersjs/feathers';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';

export const getIssuerEntities: Hook = async (ctx) => {
  console.log('getIssuerEntities');
  const issuerEntityService = ctx.app.service('issuerEntity');
  let proveIssuerEntity: IssuerEntity, hwIssuerEntity: IssuerEntity;

  try {
    proveIssuerEntity = await issuerEntityService.getProveIssuerEntity();
    logger.info('proveIssuerEntity', proveIssuerEntity);

    hwIssuerEntity = await issuerEntityService.getHVIssuerEntity();
    logger.info('hwIssuerEntity', hwIssuerEntity);

    return {
      ...ctx,
      params: {
        ...ctx.params,
        proveIssuerEntity,
        hwIssuerEntity
      }

    };
  } catch (e) {
    logger.error('getIssuerEntities hook caught an error thrown by issuerDataService.getByDid', e);
    throw e;
  }
};
