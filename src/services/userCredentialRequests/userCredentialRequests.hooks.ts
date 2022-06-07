
import { SubjectCredentialRequestsEnrichedDto } from '@unumid/types';
import { BadRequest } from '@feathersjs/errors';
import { Hook } from '@feathersjs/feathers';
import { getIssuerEntity } from '../hooks/getIssuerEntity';
import { handleUserDidAssociation } from '../hooks/handleUserDidAssociation';
import { validateCredentialRequest } from '../hooks/validateCredentialRequest';

const validateUserCredentialRequest: Hook = async (ctx) => {
  const data = ctx.data as SubjectCredentialRequestsEnrichedDto;

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
    all: [validateCredentialRequest],
    create: [getIssuerEntity, validateUserCredentialRequest, handleUserDidAssociation]
  },
  after: {}
};
