import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { IssuerEntity } from '../../entities/Issuer';
import { IssuerService } from './issuer.class';
import hooks from './issuer.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    issuer: IssuerService & ServiceAddons<IssuerEntity>
  }
}

export default function (app: Application): void {
  app.use('issuer', new IssuerService(app));

  const service = app.service('issuer');

  service.hooks(hooks);
}
