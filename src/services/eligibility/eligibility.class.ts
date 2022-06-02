import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
// import { VerificationOptions, WalletUserDto } from '@unumid/web-wallet-types';
// import { EMAIL_CONTENT } from '../../constants';
import { v4 as uuidv4 } from 'uuid';

import { Application } from '../../declarations';
// import { UserEntity } from '../../entities/User';
import logger from '../../logger';
import { makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';
import { Configuration } from '@mikro-orm/core';
// import { generateEmailVerificationToken } from '../../utils/generateEmailVerificationToken';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class EligibilityService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create (data: any, params?: Params): Promise<AuthTokens> {
      const authorization = params?.authentication?.accessToken;

      const restData: RESTData = {
        method: 'POST',
        baseUrl: config.PROVE_SAAS_URL,
        endPoint: `/identity/eligibility/v2`,
        header: { Authorization: `Bearer ${authorization}` },
        data: {
          "requestId": uuidv4(),
          "phoneNumber": data.phoneNumber,
          "minTrustScore": 500
      }
    };

    const response = await makeNetworkRequest<AuthTokens>(restData);

    return response.body;
  }
}
