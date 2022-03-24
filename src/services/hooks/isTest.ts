import { HookContext } from '@feathersjs/feathers';
import { config } from '../../config';

export const isTest = (ctx: HookContext): boolean => {
  return config.NODE_ENV === 'TEST';
};
