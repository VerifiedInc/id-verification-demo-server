// Initializes the `verification` service on path `/verification`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { HyperVergeService } from './hyperVerge.class';
import hooks from './hyperVerge.hooks';
// import { VerificationOptions } from '@unumid/web-wallet-types';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'hyperVerge': HyperVergeService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use('/hyperVerge', new HyperVergeService(app));

  // Get our initialized service so that we can register hooks
  const service = app.service('hyperVerge');

  service.hooks(hooks);
}
