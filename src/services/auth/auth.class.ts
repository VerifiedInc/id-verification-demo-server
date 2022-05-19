import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { config } from '../../config';
// import { VerificationOptions, WalletUserDto } from '@unumid/web-wallet-types';
// import { EMAIL_CONTENT } from '../../constants';

import { Application } from '../../declarations';
// import { UserEntity } from '../../entities/User';
import logger from '../../logger';
import { makeNetworkRequest, RESTData, RESTResponse } from '../../utils/networkRequestHelper';
// import { generateEmailVerificationToken } from '../../utils/generateEmailVerificationToken';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // async create (data: any, params?: Params): Promise<AuthTokens> {
    async create (data: any, params?: Params): Promise<AuthTokens> {
    const restData: RESTData = {
      method: 'POST',
      baseUrl: config.PROVE_SAAS_URL,
      endPoint: `/token`,
      header: { },
      data: {
        username: config.PROVE_USERNAME,
        password: config.PROVE_PASSWORD,
        grant_type: 'password'
      }
    };

    const response = await makeNetworkRequest<AuthTokens>(restData);
    // console.log('response', response);
    // const authToken = handleAuthTokenHeader(response, authorization);
    

    // if (!user) {
    //   throw new Error('User not found');
    // }

    // if (data.token !== user.emailVerificationToken) {
    //   throw new BadRequest('The code you entered isn\'t valid. Please try again.');
    // }

    // // if the user has already verified once before then no need to send welcome email again.
    // if (!user.isEmailVerified) {
    //   this.sendWelcomeEmail(user);
    // }

    // const updatedUser: UserEntity = await userService.patch(
    //   user.uuid,
    //   { isEmailVerified: true, emailVerificationToken: undefined },
    //   { populate: ['webauthnCredentials'] }
    // ) as UserEntity;

    // return updatedUser.toDto();

    return response.body;
  }
}
