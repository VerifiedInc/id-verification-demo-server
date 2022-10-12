import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { Application } from '../../declarations';
import logger from '../../logger';
import { makeFormDataNetworkRequest, makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';

interface HyperVergeAuthToken {
    status: string,
    statusCode: number,
    result: {
        token: string
    }
}

export class HyperVergeAuth {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: any, params?: Params): Promise<HyperVergeAuthToken> {
    const restData: RESTData = {
      method: 'POST',
      baseUrl: config.HYPER_VERGE_SAAS_URL,
      endPoint: '/login',
      header: { },
      data: {
        appId: config.HYPER_VERGE_APP_ID,
        appKey: config.HYPER_VERGE_APP_KEY,
        expiry: 300
      }
    };

    const response = await makeNetworkRequest<HyperVergeAuthToken>(restData);

    return response.body;
  }
}
