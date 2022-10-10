import { Params } from '@feathersjs/feathers';
import { v4 } from 'uuid';

import { Application, ProveServiceResponseV2 } from '../../declarations';
import { UserEntityOptions } from '../../entities/User';
import { UserEntityService } from '../userEntity/userEntity.class';
import { HvDocScanData, KYCData, HyperVergeResponse, HvFieldsExtracted, HvResultsApiResponse, HvApiResponse, HvClientResponse } from '@unumid/id-verification-types';
import { makeNetworkRequest, RESTResponse } from '../../utils/networkRequestHelper';
import { config } from '../../config';
import logger from '../../logger';

// export interface HyperVergeResponse {
//   userCode: string;
// }

// export interface HVDetails {
//   dateOfBirth: string;
//   firstName: string;
//   fullName: string;
//   // eslint-disable-next-line camelcase
//   id_back_imagePath: string;
//   idNumber: string;
//   lastName: string;
//   middleName: string;
// }

// export interface HvResult {
//   status: string;
//   transactionId: string;
//   details: HVDetails;
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
          transactionId: data.transactionId
        },
        header: {
          appId: config.HYPER_VERGE_APP_ID,
          appKey: config.HYPER_VERGE_APP_KEY
        }
      });

      const results: HvFieldsExtracted = response.body.result.results[0].apiResponse.result.details[0].fieldsExtracted;

      // const hvDocScanData: HvDocScanData = HyperKycResult.Success.data;
      const docCountryId = results.countryCode.value;
      const firstName = results.firstName.value;
      const lastName = results.lastName.value;
      const fullName = results.fullName.value;
      const dob = results.dateOfBirth.value;
      const address = results.address.value;
      const gender = results.gender.value;
      const docType = results.type.value;

      // const faceMatchData = hvDocScanData.faceMatchData.responseResult.result.details.match;
      // const faceMatch = faceMatchData.value;
      // const faceMatchConfidence = faceMatchData.confidence;

      // const faceData = hvDocScanData.faceData;
      // // const fullFaceImage = faceData.fullFaceImagePath;
      // const liveFace = faceData.responseResult.result.details.liveFace.value;
      // const liveFaceConfidence = faceData.responseResult.result.details.liveFace.confidence;

      // const docData = hvDocScanData.docListData[0];
      // // const docImage = docData.docImagePath;
      // const docType = docData.documentId;
      // const { address, dateOfBirth, fullName, gender } = docData.responseResult.result.details[0].fieldsExtracted;
      /**
     * Reformat the DOB from the HV document scan.
     * dateOfBirthday was taking the format MM-DD-YYYY from HV, but as of 6/23 was updated to dD-mM-YYYY.
     * and Prove needs it in the format YYYY-MM-DD, so just turning it in that here
     */
      // const proveDob = dateOfBirth.value.split('-');

      // // loop through the split data array and ensure all values have at least 2 digits
      // for (let i = 0; i < proveDob.length; i++) {
      //   if (proveDob[i].length < 2) {
      //     proveDob[i] = '0' + proveDob[i];
      //   }
      // }

      // shift values to fit desired format; this was working when HV was returning in format MM-DD-YYYY
      // const hold = proveDob[2];
      // proveDob[2] = proveDob[1];
      // proveDob[1] = proveDob[0];
      // proveDob[0] = hold;

      // shift values to fit desired format; having to deal with new format of DD-MM-YYYY
      // const hold = proveDob[2];
      // proveDob[2] = proveDob[0];
      // proveDob[0] = hold;

      // // now should be in YYYY-MM-DD format
      // const dob = proveDob.join('-');

      // need to store the data until the user has a did to issue credentials to
      const userEntityOptions: UserEntityOptions = {
        userCode: v4(),
        hvDob: dob,
        hvFullName: fullName,
        hvAddress: address,
        hvGender: gender,
        // hvDocImage: docImage,
        // hvFaceImage: fullFaceImage,
        hvDocCountry: docCountryId,
        hvDocType: docType
        // hvLiveFace: liveFace,
        // hvLiveFaceConfidence: liveFaceConfidence,
        // hvFaceMatch: faceMatch,
        // hvFaceMatchConfidence: faceMatchConfidence
      };

      const userEntity = await this.userEntityService.create(userEntityOptions, params);

      return {
        userCode: userEntity.userCode as string
      };
      // return { userCode: 'test' };
    } catch (e) {
      logger.error(`Error hitting HV results api: ${e}`);
      throw e;
    }
  }
}
