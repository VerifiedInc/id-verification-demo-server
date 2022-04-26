import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import axios from 'axios';

import { Application } from './../declarations';
import { config } from './../config';
import { AxiosClient } from './axiosClient';

/**
 * Client to interface with an external Feathers service.
 *
 * feather-mikro-orm-starter Note: Update to the config variable name and rename this service
 * and file to interface with any external service / API.
 * @param app
 */
export function setupSaaSFeathersServiceClient (app: Application): void {
  const restClient = rest(config.SAAS_CLIENT_URL);
  const saasClient = feathers();
  saasClient.configure(restClient.axios(axios, AxiosClient));

  app.set('saas', saasClient);
}
