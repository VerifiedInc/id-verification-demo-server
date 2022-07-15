import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

import { Application, ProveServiceResponseV1 } from '../../declarations';

import logger from '../../logger';
import { makeNetworkRequest, RESTData } from '../../utils/networkRequestHelper';
import { sendSms } from '../../utils/sendSms';

export interface AuthUrlResponse {
  AuthenticationUrl: string;
  MobileOperatorName: string;
}

export interface AuthUrlOptions {
  userCode: string;
  dob?: string;
  mobileNumber: string; // actually not sure this is needed anymore with the instant redirect
}

export class GetAuthUrlService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: AuthUrlOptions, params?: Params): Promise<ProveServiceResponseV1<AuthUrlResponse>> {
    const { userCode, dob, mobileNumber } = data;

    const restData: RESTData = {
      method: 'POST',
      baseUrl: config.PROVE_SAAS_URL,
      endPoint: '/fortified/2015/06/01/getAuthUrl',
      data: {
        RequestId: uuidv4(),
        SessionId: 'SubmittedSessionId', // TODO
        ApiClientId: config.PROVE_CLIENT_ID,
        SubClientId: config.PROVE_SUB_CLIENT_ID,
        SourceIp: '127.0.0.1', // TODO
        FinalTargetUrl: `${config.FRONTEND_URL}?dob=${dob}&userCode=${userCode}&&phone=${mobileNumber}`,
        MobileNumber: mobileNumber
      }
    };

    const response = await makeNetworkRequest<ProveServiceResponseV1<AuthUrlResponse>>(restData);

    // send sms to mobile number
    const result = await sendSms(data.mobileNumber, `Please click the url to verify your phone number ${response.body.Response.AuthenticationUrl}.`);

    return response.body;
  }
}
