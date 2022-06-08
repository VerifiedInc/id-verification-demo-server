// Initializes the `verification` service on path `/verification`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { EligibilityService } from './eligibility.class';
import hooks from './eligibility.hooks';
// import { VerificationOptions } from '@unumid/web-wallet-types';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'eligibility': EligibilityService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use('/eligibility', new EligibilityService(app));

  // Get our initialized service so that we can register hooks
  const service = app.service('eligibility');

  service.hooks(hooks);
}
