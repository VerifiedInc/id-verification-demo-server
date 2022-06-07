import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { UserEntityService } from './userEntity.class';
import { UserEntity } from '../../entities/User';

declare module '../../declarations' {
  interface ServiceTypes {
    UserEntity: UserEntityService & ServiceAddons<UserEntity>;
  }
}

export default function (app: Application): void {
  const userEntityService = new UserEntityService({
    Entity: UserEntity,
    orm: app.get('orm')
  });
  app.use('/userEntity', userEntityService);
}
