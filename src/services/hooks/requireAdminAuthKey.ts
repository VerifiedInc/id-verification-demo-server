import { HookContext } from '@feathersjs/feathers';
import { Forbidden } from '@feathersjs/errors';
import { checkContext } from 'feathers-hooks-common';
import { requireAuth } from './requireAuth';
import { ERROR_MESSAGES } from '../../constants';

export function requireAdminAuthKey (ctx: HookContext): HookContext {
  checkContext(ctx, 'before', [], 'requireAdminKey');
  requireAuth(ctx);
  if (ctx.params.authorization && ctx.params.authorization.type === 'admin') {
    return ctx;
  }

  throw new Forbidden(ERROR_MESSAGES.FORBIDDEN);
}
