import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
// import { VerificationOptions, WalletUserDto } from '@unumid/web-wallet-types';
// import { EMAIL_CONTENT } from '../../constants';

import { Application } from '../../declarations';
// import { UserEntity } from '../../entities/User';
import logger from '../../logger';
import { makeFormDataNetworkRequest, makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';
// import { generateEmailVerificationToken } from '../../utils/generateEmailVerificationToken';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
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
