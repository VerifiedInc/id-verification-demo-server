import { Application as ExpressFeathers } from '@feathersjs/express';
import { HookContext as FeathersHookContext, Service } from '@feathersjs/feathers';
import '@feathersjs/transport-commons';
import { TransactionHandle } from 'newrelic';

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;

/**
 * Used to give the service a concrete type. Useful for ctx.service situation, which admittedly is rare.
 * Typing will be enforced because passing to the Feather's HookContext.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HookContext<T = any, S = Service<T>, R = T> extends FeathersHookContext<any, S> {
  data?: T;
  result?: R;
}

/**
 * Used for handling New Relic transaction tracing.
 */
export interface HookContextWithTransaction<T = any, S = Service<T>, R = T> extends HookContext<T, S, R> {
  transaction?: TransactionHandle;
}

/**
 * Used for better code readability but typing will not be enforced because not passing to the Feathers HookContext.
 * Useful for expressing expected input and output types in Hooks.
 */
export interface HookVariableContext<K, T> extends FeathersHookContext {
  K?: T;
}
