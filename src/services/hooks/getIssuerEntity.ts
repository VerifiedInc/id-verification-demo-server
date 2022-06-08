import { Hook } from '@feathersjs/feathers';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';

export const getIssuerEntity: Hook = async (ctx) => {
// export const handleUserDidAssociation: Hook = async (ctx) => {
  console.log('getIssuerEntity');
  const issuerEntityService = ctx.app.service('issuerEntity');
  let issuerEntity: IssuerEntity;
  try {
    issuerEntity = await issuerEntityService.getDefaultIssuerEntity();
    console.log('issuerEntity', issuerEntity);

    return {
      ...ctx,
      params: {
        ...ctx.params,
        issuerEntity
      }

    };
  } catch (e) {
    logger.error('getIssuerEntity hook caught an error thrown by issuerDataService.getByDid', e);
    throw e;
  }
};
