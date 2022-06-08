// Initializes the `verifier` service on path `/verifier`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UserEntity } from '../../entities/User';
import { UserService } from './user.class';
import { hooks } from './user.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    user: UserService & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use('/user', new UserService({}, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('user');

  service.hooks(hooks);
}
