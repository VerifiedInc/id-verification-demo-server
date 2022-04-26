import { HookContext } from '@feathersjs/feathers';
import { NotAuthenticated } from '@feathersjs/errors';
import { checkContext } from 'feathers-hooks-common';
import { ERROR_MESSAGES } from '../../constants';

export function requireAuth (ctx: HookContext): HookContext {
  checkContext(ctx, 'before', [], 'requireAuth');

  if (!ctx.params.headers?.authorization) {
    throw new NotAuthenticated(ERROR_MESSAGES.NOT_AUTHENTICATED);
  }

  return ctx;
}
