// Initializes the `verification` service on path `/verification`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { GetAuthUrlService } from './getAuthUrl.class';
import hooks from './getAuthUrl.hooks';
// import { VerificationOptions } from '@unumid/web-wallet-types';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'getAuthUrl': GetAuthUrlService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use('/getAuthUrl', new GetAuthUrlService(app));

  // Get our initialized service so that we can register hooks
  const service = app.service('getAuthUrl');

  service.hooks(hooks);
}