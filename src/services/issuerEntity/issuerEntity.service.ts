// Initializes the `issuer` service on path `/issuer`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { IssuerEntity } from '../../entities/Issuer';
import { IssuerEntityService } from './issuerEntity.class';
import hooks from './issuerEntity.hooks';

// Add this service to the service type index
declare module '../../declarations' {

  interface ServiceTypes {
    issuerEntity: IssuerEntityService & ServiceAddons<IssuerEntity>;
  }
}

export default function (app: Application): void {
  const issuerEntityService = new IssuerEntityService({ Entity: IssuerEntity, orm: app.get('orm') });

  app.use('issuerEntity', issuerEntityService);

  // Get our initialized service so that we can register hooks
  const service = app.service('issuerEntity');
  service.hooks(hooks);
}
