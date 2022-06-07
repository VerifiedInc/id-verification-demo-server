import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

import { Application, ProveServiceResponseV1 } from '../../declarations';

import logger from '../../logger';
import { makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';
import { sendSms } from '../../utils/sendSms';

export interface AuthUrlResponse {
  AuthenticationUrl: string;
  MobileOperatorName: string;
}

export class GetAuthUrlService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create (data: any, params?: Params): Promise<ProveServiceResponseV1<AuthUrlResponse>> {
      const authorization = data.authorization;

      const restData: RESTData = {
        method: 'POST',
        baseUrl: config.PROVE_SAAS_URL,
        endPoint: `/fortified/2015/06/01/getAuthUrl`,
        // header: { Authorization: authorization },
        data: {
          "RequestId": uuidv4(),
          "SessionId": "SubmittedSessionId", // TODO
          "ApiClientId": config.PROVE_CLIENT_ID,
          "SourceIp": "127.0.0.1", // TODO
          "FinalTargetUrl": data.finalTargetUrl,
          "MobileNumber": data.mobileNumber,
      }
    };

    const response = await makeNetworkRequest<ProveServiceResponseV1<AuthUrlResponse>>(restData);

    // send sms to mobile number
    const result = await sendSms(data.mobileNumber, response.body.Response.AuthenticationUrl);

    return response.body;
  }
}
