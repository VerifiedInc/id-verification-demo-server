import { HookContext } from '@feathersjs/feathers';
import { checkContext } from 'feathers-hooks-common';
import { config } from '../../config';

import logger from '../../logger';
import { formatBearerToken } from '../../utils/formatBearerToken';

export function checkAdminKey (ctx: HookContext): HookContext {
  checkContext(ctx, 'before', [], 'requireAdminKey');

  const headers = ctx.params.headers;

  if (!headers) {
    return ctx;
  }

  const { authorization } = headers;

  if (!authorization) {
    return ctx;
  }

  if (authorization === formatBearerToken(config.ADMIN_AUTH_KEY)) {
    logger.info('Admin key is being used.');
    return {
      ...ctx,
      params: {
        ...ctx.params,
        authorization: { type: 'admin' }
      }
    };
  }

  return ctx;
}
