import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { Application } from '../../declarations';
import logger from '../../logger';
import { makeFormDataNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export class AuthService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create (data: any, params?: Params): Promise<AuthTokens> {
      const formBody = [];

      const encodedKeyU = encodeURIComponent("username");
      const encodedValueU = encodeURIComponent(config.PROVE_USERNAME);
      formBody.push(encodedKeyU + "=" + encodedValueU);

      const encodedKeyP = encodeURIComponent("password");
      const encodedValueP = encodeURIComponent(config.PROVE_PASSWORD);
      formBody.push(encodedKeyP + "=" + encodedValueP);

      const encodedKeyG = encodeURIComponent("grant_type");
      const encodedValueG = encodeURIComponent("password");
      formBody.push(encodedKeyG + "=" + encodedValueG);
      
    const restData: RESTData = {
      method: 'POST',
      baseUrl: config.PROVE_SAAS_URL,
      endPoint: `/token`,
      header: { },
      formBody
    };

    const response = await makeFormDataNetworkRequest<AuthTokens>(restData);

    return response.body;
  }
}
