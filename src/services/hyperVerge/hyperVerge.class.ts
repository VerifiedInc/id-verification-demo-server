import { Params } from '@feathersjs/feathers';
import { v4 } from 'uuid';

import { Application } from '../../declarations';
import { UserEntityOptions } from '../../entities/User';
import { UserEntityService } from '../userEntity/userEntity.class';
import { HyperVergeResponse, HvFieldsExtracted, HvApiResponse, HvClientResponse } from '@unumid/id-verification-types';
import { makeNetworkRequest, RESTResponse } from '../../utils/networkRequestHelper';
import { config } from '../../config';
import logger from '../../logger';

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

  async create (data: HvClientResponse, params?: Params): Promise<HyperVergeResponse> {
    // const { gender, address, fullName, dob, docImage, fullFaceImage, docCountryId, docType, liveFace, liveFaceConfidence, faceMatch, faceMatchConfidence } = data;
    const { details, transactionId, status } = data;

    try {
      // need to hit HV results API to get user data
      const response: RESTResponse<HvApiResponse> = await makeNetworkRequest({
        method: 'POST',
        baseUrl: 'https://ind.idv.hyperverge.co',
        endPoint: '/v1/link-kyc/results',
        data: {
          transactionId
        },
        header: {
          appId: config.HYPER_VERGE_APP_ID,
          appKey: config.HYPER_VERGE_APP_KEY
        }
      });

      const results: HvFieldsExtracted = response.body.result.results[0].apiResponse.result.details[0].fieldsExtracted;

      const docCountryId = results.countryCode.value;
      const firstName = results.firstName.value;
      const lastName = results.lastName.value;
      const fullName = results.fullName.value;
      const dateOfBirth = results.dateOfBirth.value;
      const address = results.address.value;
      const gender = results.gender.value;
      const docType = results.type.value;

      /**
     * Reformat the DOB from the HV document scan.
     * dateOfBirthday was taking the format MM-DD-YYYY from HV, but as of 6/23 was updated to dD-mM-YYYY.
     * and Prove needs it in the format YYYY-MM-DD, so just turning it in that here
     */
      const proveDob = dateOfBirth.split('-');

      // loop through the split data array and ensure all values have at least 2 digits
      for (let i = 0; i < proveDob.length; i++) {
        if (proveDob[i].length < 2) {
          proveDob[i] = '0' + proveDob[i];
        }
      }

      // shift values to fit desired format; having to deal with the format of DD-MM-YYYY
      const hold = proveDob[2];
      proveDob[2] = proveDob[0];
      proveDob[0] = hold;

      // now should be in YYYY-MM-DD format
      const dob = proveDob.join('-');

      // need to store the data until the user has a did to issue credentials to
      const userEntityOptions: UserEntityOptions = {
        userCode: transactionId,
        hvDob: dob,
        hvFullName: fullName,
        hvAddress: address,
        hvGender: gender,
        hvDocCountry: docCountryId,
        hvDocType: docType
      };

      const userEntity = await this.userEntityService.create(userEntityOptions, params);

      return {
        userCode: userEntity.userCode as string,
        dob: userEntity.hvDob as string
      };
    } catch (e) {
      logger.error(`Error hitting HV results api: ${e}`);
      throw e;
    }
  }
}
