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

export interface HyperVergeResponse {
  userCode: string;
}

interface KYCData {
  address: string;
  age: string;
  dob: string;
  gender: string;
  fullName: string;
  idType: string;
}

/**
 * Service to receive and persist HV KYC data from the client.
 */
export class HyperVergeService {
  app: Application;
  userEntityService: UserEntityService;

  constructor (app: Application) {
    this.app = app;
    this.userEntityService = app.service('userEntity');
  }

  async create (data: KYCData, params?: Params): Promise<HyperVergeResponse> {
    const { gender, address, fullName, dob } = data;

    // need to store the data until the user has a did to issue credentials to
    const userEntityOptions: UserEntityOptions = {
      hvDob: data.dob,
      hvFullName: data.fullName,
      hvAddress: data.address,
      hvGender: data.gender,
      userCode: v4()
    };

    const userEntity = await this.userEntityService.create(userEntityOptions, params);

    return {
      userCode: userEntity.userCode as string
    };
  }
}
