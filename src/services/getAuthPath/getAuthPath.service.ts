// Initializes the `verification` service on path `/verification`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { GetAuthPathService } from './getAuthPath.class';
import hooks from './getAuthPath.hooks';
// import { VerificationOptions } from '@unumid/web-wallet-types';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'getAuthPath': GetAuthPathService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use('/getAuthPath', new GetAuthPathService(app));

  // Get our initialized service so that we can register hooks
  const service = app.service('getAuthPath');

  service.hooks(hooks);
}