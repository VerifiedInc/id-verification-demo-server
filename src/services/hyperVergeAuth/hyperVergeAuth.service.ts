// Initializes the `verification` service on path `/verification`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { HyperVergeAuth } from './hyperVergeAuth.class';
import hooks from './hyperVergeAuth.hooks';
// import { VerificationOptions } from '@unumid/web-wallet-types';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'hyperVergeAuth': HyperVergeAuth & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use('/hyperVergeAuth', new HyperVergeAuth(app));

  // Get our initialized service so that we can register hooks
  const service = app.service('hyperVergeAuth');

  service.hooks(hooks);
}
