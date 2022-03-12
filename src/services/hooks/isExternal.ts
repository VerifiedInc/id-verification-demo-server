import { HookContext } from '@feathersjs/feathers';

// this app currently only uses the rest provider, but let's
// check all of them just to be safe
const externalProviders = ['rest', 'socketio', 'primus'];

export const isExternal = (ctx: HookContext): boolean => {
  if (!ctx.params.provider) return false;
  return externalProviders.includes(ctx.params.provider);
};
