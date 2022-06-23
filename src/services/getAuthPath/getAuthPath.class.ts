import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

import { Application, ProveServiceResponseV1 } from '../../declarations';
import logger from '../../logger';
import { makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';

interface AuthPathResponse {
  TransactionId: string,
  Path: string,
  SessionId: string;
}

export class GetAuthPathService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: any, params?: Params): Promise<ProveServiceResponseV1<AuthPathResponse>> {
    const restData: RESTData = {
      method: 'POST',
      baseUrl: config.PROVE_SAAS_URL,
      endPoint: '/fortified/2015/06/01/getAuthPath',
      data: {
        RequestId: uuidv4(),
        ApiClientId: config.PROVE_CLIENT_ID,
        SubClientId: config.PROVE_SUB_CLIENT_ID,
        VerificationFingerprint: data.verificationFingerprint
      }
    };

    const response = await makeNetworkRequest<ProveServiceResponseV1<AuthPathResponse>>(restData);

    return response.body;
  }
}
