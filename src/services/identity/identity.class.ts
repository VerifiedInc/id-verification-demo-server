import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { v4 as uuidv4, v4 } from 'uuid';

import { Application, ProveServiceResponseV2 } from '../../declarations';
import logger from '../../logger';
import { makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';
import { IssuerEntity } from '../../entities/Issuer';
import { issueCredentials } from '@unumid/server-sdk';
import { CredentialData } from '@unumid/types';
import { UserEntityOptions } from '../../entities/User';
import { UserEntityService } from '../userEntity/userEntity.class';

interface phoneCredentialSubject extends CredentialData {
  id: string;
  phone: string;
}

interface ssnCredentialSubject extends CredentialData {
  id: string;
  ssn: string;
}

interface dobCredentialSubject extends CredentialData {
  id: string;
  dob: string;
}

export interface WalletUserDidAssociation<T> {
  proveResponse: ProveServiceResponseV2<T>
  userCode: string;
  issuerDid: string;
}

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
  userEntityService: UserEntityService;

  constructor (app: Application) {
    this.app = app;
    this.userEntityService = app.service('userEntity');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create (data: any, params?: Params): Promise<WalletUserDidAssociation<identityResponse>> {
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
    const identityData: identityResponse = response.body.response;

    // need to store the data until the user has a did to issue credentials to
    const userEntityOptions: UserEntityOptions = {
      dob: identityData.individual.dob,
      ssn: identityData.individual.ssn,
      phone: identityData.phoneNumber,
      userCode: v4()
    };

    const userEntity = await this.userEntityService.create(userEntityOptions, params);


    // // issue credentials for user
    
    // get issuer
    const issuerEntityService = this.app.service('issuerEntity');
    const issuer: IssuerEntity = await issuerEntityService.getDefaultIssuerEntity();

    // // issue credentials
    // const phoneCredentialSubject = {
    //   id: 
    // }

    // await issueCredentials(issuer.authToken, issuer.did, did, [emailCredentialSubject], issuer.signingPrivateKey);

    return {
      userCode: userEntity.userCode as string,
      issuerDid: issuer.did,
      proveResponse: response.body
    }
  }
}
