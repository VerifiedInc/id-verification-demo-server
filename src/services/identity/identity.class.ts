import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

import { Application, ProveServiceResponseV2 } from '../../declarations';
import logger from '../../logger';
import { makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';

export interface Address {
  address: string;
  extendedAddress: string;
  city: string;
  region: string,
  postalCode: string;
}

export interface IndividualInfoDetailed {
  firstName: string,
  lastName: string,
  addresses: Address[],
  emailAddresses: string[],
  ssn: string,
  dob: string
}

export interface identityResponse {
  transactionId: string;
  phoneNumber: string;
  lineType: string,
  carrier: string,
  countryCode: string,
  reasonCodes: string[],
  individual: IndividualInfoDetailed
}

export class IdentityService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create (data: any, params?: Params): Promise<ProveServiceResponseV2<identityResponse>> {
      // const authorization = params?.authentication?.accessToken;

      const authService = this.app.service('auth');
      const authResponse = await authService.create({}, params);
      const authorization = authResponse['access_token'];

      const restData: RESTData = {
        method: 'POST',
        baseUrl: config.PROVE_SAAS_URL,
        endPoint: `/identity/v2`,
        header: { 
          Authorization: `Bearer ${authorization}`,
          "Content-Type": "application/json" 
        },
        data: {
          "requestId": uuidv4(),
          "phoneNumber": data.phoneNumber,
          "dob": data.dob,
          "ssn": data.ssn,
          "last4": data.last4
      }
    };

    const response = await makeNetworkRequest<ProveServiceResponseV2<identityResponse>>(restData);

    return response.body;
  }
}
