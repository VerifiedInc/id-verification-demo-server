import { Application as ExpressFeathers } from '@feathersjs/express';
import { TransactionHandle } from 'newrelic';
import { HookContext, Service } from '@feathersjs/feathers';

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;

export interface HookContextWithTransaction<T = never, S = Service<T>, R = T> extends HookContext {
    transaction?: TransactionHandle;
  }
