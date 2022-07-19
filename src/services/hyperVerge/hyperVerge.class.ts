import { Params } from '@feathersjs/feathers';
import { v4 } from 'uuid';

import { Application, ProveServiceResponseV2 } from '../../declarations';
import { UserEntityOptions } from '../../entities/User';
import { UserEntityService } from '../userEntity/userEntity.class';
import { KYCData } from '@unumid/id-verification-types';

export interface HyperVergeResponse {
  userCode: string;
}

// interface KYCData {
//   address: string;
//   age: string;
//   dob: string;
//   gender: string;
//   fullName: string;
//   idType: string;
// }

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
    const { gender, address, fullName, dob, docImage, fullFaceImage, docCountryId, docType, liveFace, liveFaceConfidence, faceMatch, faceMatchConfidence } = data;

    // need to store the data until the user has a did to issue credentials to
    const userEntityOptions: UserEntityOptions = {
      userCode: v4(),
      hvDob: dob,
      hvFullName: fullName,
      hvAddress: address,
      hvGender: gender,
      hvDocImage: docImage,
      hvFaceImage: fullFaceImage,
      hvDocCountry: docCountryId,
      hvDocType: docType,
      hvLiveFace: liveFace,
      hvLiveFaceConfidence: liveFaceConfidence,
      hvFaceMatch: faceMatch,
      hvFaceMatchConfidence: faceMatchConfidence
    };

    const userEntity = await this.userEntityService.create(userEntityOptions, params);

    return {
      userCode: userEntity.userCode as string
    };
  }
}
