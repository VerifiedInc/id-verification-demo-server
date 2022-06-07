import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

import { Application, ProveServiceResponseV2 } from '../../declarations';
import logger from '../../logger';
import { makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';

interface EligibilityResponse {
  transactionId: string;
  phoneNumber: string;
  carrier: string;
  lineType: string;
  countryCode: string;
  eligibility: boolean
  payfoneAlias: string;
}

export class EligibilityService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create (data: any, params?: Params): Promise<ProveServiceResponseV2<EligibilityResponse>> {
      // const authorization = params?.authentication?.accessToken;

      const authService = this.app.service('auth');
      const authResponse = await authService.create({}, params);
      const authorization = authResponse['access_token'];

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

    const response = await makeNetworkRequest<ProveServiceResponseV2<EligibilityResponse>>(restData);

    return response.body;
  }
}
