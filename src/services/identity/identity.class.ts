import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
import { v4 as uuidv4, v4 } from 'uuid';

import { Application, ProveServiceResponseV2 } from '../../declarations';
import logger from '../../logger';
import { makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';
import { IssuerEntity } from '../../entities/Issuer';
import { issueCredentials } from '@unumid/server-sdk';
import { CredentialData } from '@unumid/types';
import { UserEntity, UserEntityOptions } from '../../entities/User';
import { UserEntityService } from '../userEntity/userEntity.class';
import { maskString } from '../../utils/maskString';

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

export interface IdentityResponse {
  transactionId: string;
  phoneNumber: string;
  lineType: string,
  carrier: string,
  countryCode: string,
  reasonCodes: string[],
  individual: IndividualInfoDetailed
}

export interface IdentityOptions {
  phoneNumber: string;
  dob?: string;
  userCode?: string;
}

export class IdentityService {
  app: Application;
  userEntityService: UserEntityService;

  constructor (app: Application) {
    this.app = app;
    this.userEntityService = app.service('userEntity');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: any, params?: Params): Promise<WalletUserDidAssociation<IdentityResponse>> {
    const { phoneNumber, dob, userCode } = data;

    const authService = this.app.service('auth');
    const authResponse = await authService.create({}, params);
    const authorization = authResponse.access_token;

    const restData: RESTData = {
      method: 'POST',
      baseUrl: config.PROVE_SAAS_URL,
      endPoint: '/identity/v2',
      header: {
        Authorization: `Bearer ${authorization}`,
        'Content-Type': 'application/json'
      },
      data: {
        requestId: uuidv4(),
        phoneNumber,
        dob
        // ssn: data.ssn,
        // last4: data.last4
      }
    };

    const response = await makeNetworkRequest<ProveServiceResponseV2<IdentityResponse>>(restData);
    const identityData: IdentityResponse = response.body.response;

    // need to store the data until the user has a did to issue credentials to
    const userEntityOptions: UserEntityOptions = {
      proveDob: identityData.individual.dob,
      proveSsn: maskString(identityData.individual.ssn, 2),
      provePhone: identityData.phoneNumber,
      userCode: v4()
    };

    let userEntity;

    if (userCode) {
      // if userCode is present than we have already created a pending user with HV data. We need to get it and patch it with Prove data.
      // userEntity = await this.userEntityService.getByUserCode(userCode); // Just getting so can use the uuid to ensure only patching one to appease the types
      // userEntity = await this.userEntityService.patch(userEntity.uuid, {
      //   ...userEntityOptions
      // }) as UserEntity;
      userEntity = await this.userEntityService.patch(null, {
        ...userEntityOptions
      }, { where: { userCode } }) as UserEntity;
    } else {
      // no pending user, we need to create one
      userEntity = await this.userEntityService.create(userEntityOptions, params);
    }

    // get issuer did for UnumID saas to know where to send the /subjectCredentialRequest callback request. We will then issue credentials from HV and Prove in the handler.
    const issuerEntityService = this.app.service('issuerEntity');
    const proveIssuer: IssuerEntity = await issuerEntityService.getProveIssuerEntity();

    return {
      userCode: userEntity.userCode as string,
      issuerDid: proveIssuer.did,
      proveResponse: response.body
    };
  }
}
