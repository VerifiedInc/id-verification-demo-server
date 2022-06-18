import { Params } from '@feathersjs/feathers';
import { v4 } from 'uuid';

import { Application, ProveServiceResponseV2 } from '../../declarations';
import { UserEntityOptions } from '../../entities/User';
import { UserEntityService } from '../userEntity/userEntity.class';
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
      hvDob: dob,
      hvFullName: fullName,
      hvAddress: address,
      hvGender: gender,
      userCode: v4()
    };

    const userEntity = await this.userEntityService.create(userEntityOptions, params);

    return {
      userCode: userEntity.userCode as string
    };
  }
}
