
import { SubjectCredentialRequestsEnrichedDto } from '@unumid/types';
import { BadRequest } from '@feathersjs/errors';
import { Hook } from '@feathersjs/feathers';
import { getIssuerEntities } from '../hooks/getIssuerEntities';
import { handleUserDidAssociation } from '../hooks/handleUserDidAssociation';
import { validateCredentialRequest } from '../hooks/validateCredentialRequest';
import logger from '../../logger';

const validateUserCredentialRequest: Hook = async (ctx) => {
  const data = ctx.data as SubjectCredentialRequestsEnrichedDto;
  const { params } = ctx;

  if (!params.headers?.version) {
    logger.info('CredentialRequest request made without version');
  } else {
    logger.info(`CredentialRequest request made with version ${params.headers?.version}`);
  }

  if (!data) {
    throw new BadRequest('Invalid body must be defined.');
  }

  if (!data.credentialRequestsInfo && !data.userDidAssociation) {
    throw new BadRequest('Invalid body: userDidAssociation or credentialRequestsInfo must be defined.');
  }

  return ctx;
};

export const hooks = {
  before: {
    create: [getIssuerEntities, validateUserCredentialRequest, handleUserDidAssociation]
  },
  after: {
    create: []
  }
};
