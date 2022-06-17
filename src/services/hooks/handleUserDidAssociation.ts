import { BadRequest } from '@feathersjs/errors';
import { Hook } from '@feathersjs/feathers';
import { revokeAllCredentials, UnumDto, VerifiedStatus, verifySignedDid } from '@unumid/server-sdk';
import { CredentialPb, SubjectCredentialRequestsEnrichedDto } from '@unumid/types';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';
import { issueHvUserCredentials, issueProveUserCredentials } from '../../utils/issueUserCredentials';
import { UserDto } from '../user/user.class';

/**
 * Grab and return the associated user. If useDidAssociation is passed update the user with the provided did.
 *
 * Note: this example is most likely slightly different than a real implementation in the sense that two separate issuer DIDs will be issuing credentials based on one issuer callback.
 * @param ctx
 * @returns
 */
export const handleUserDidAssociation: Hook = async (ctx) => {
  const { app, params } = ctx;

  // need to get an existing user either by the userIdentifier or by the subjectDid
  const userEntityService = app.service('userEntity');
  let user: UserDto;

  // populated via getIssuerEntities before hook
  const proveIssuerEntity: IssuerEntity = params?.proveIssuerEntity;
  const hvIssuerEntity: IssuerEntity = params?.hvIssuerEntity;

  const { credentialRequestsInfo, userDidAssociation }: SubjectCredentialRequestsEnrichedDto = ctx.data;

  // if no userDidAssociation as part of request body then it is assume this issuer already has the did associated with a user
  if (!userDidAssociation) {
    logger.debug('No new userDidAssociation in the userCredentialRequests');

    // ensuring credentialRequestsInfo must be present it userDidAssociation is not in the validation before hook validateUserCredentialRequest
    const subjectDid = credentialRequestsInfo?.subjectDid;

    // grabbing user by subjectDid
    try {
      user = await userEntityService.get(null, { where: { did: subjectDid } }); // will throw exception if not found
    } catch (e) {
      logger.warn(`No user found with did ${subjectDid}. This should never happen.`);
      throw e;
    }

    return {
      ...ctx,
      data: {
        ...ctx.data,
        user
      }
    };
  }

  const { userCode, did, issuerDid } = userDidAssociation;

  if (![proveIssuerEntity.did, hvIssuerEntity.did].includes(issuerDid)) {
    throw new BadRequest(`Invalid issuerDid ${issuerDid} in userCredentialRequests.userDidAssociation.issuer does not match either ${[proveIssuerEntity.did, hvIssuerEntity.did]}`);
  }

  try {
    user = await userEntityService.get(null, { where: { userCode } }); // will throw exception if not found
  } catch (e) {
    logger.warn(`No user found with code ${userCode}. Can not associate the did ${did.id}.`);
    throw e;
  }

  // verify the subject did document; issuer.did is strictly for receipt / audit log entry creation
  const result: UnumDto<VerifiedStatus> = await verifySignedDid(proveIssuerEntity.authToken, proveIssuerEntity.did, did);

  // if (!result.body.isVerified) {
  //   throw new Error(`${result.body.message} Subject DID document ${did.id} for user ${userCode} is not verified.`);
  // } // TODO DO NOT COMMIT

  // update the proveIssuerEntity issuer's auth token if it has been reissued
  if (result.authToken !== proveIssuerEntity.authToken) {
    const issuerEntityService = app.service('issuerEntity');
    try {
      await issuerEntityService.patch(hvIssuerEntity.uuid, { authToken: result.authToken });
    } catch (e) {
      logger.error('CredentialRequest create caught an error thrown by issuerEntityService.patch', e);
      throw e;
    }
  }

  const userDid = did.id;

  // if this is a new DID association for the user then we need to revoke all the credentials associated with teh old did document
  if (userDid !== user.did) {
    if (user.did) {
      // revoke all credentials associated with old did
      await revokeAllCredentials(proveIssuerEntity.authToken, proveIssuerEntity.did, proveIssuerEntity.signingPrivateKey, user.did);
      await revokeAllCredentials(hvIssuerEntity.authToken, hvIssuerEntity.did, hvIssuerEntity.signingPrivateKey, user.did);
    }

    // update the user with the new DID
    user = await userEntityService.patch(user.uuid, { did: userDid, userCode: null });

    // now that the user has a DID we can issue Prove credentials for the user
    const proveIssuedCredentialDto: UnumDto<CredentialPb[]> = await issueProveUserCredentials(user, proveIssuerEntity);

    // update the prove issuer's auth token if it has been reissued
    if (proveIssuedCredentialDto.authToken !== proveIssuerEntity.authToken) {
      const userEntityService = ctx.app.service('issuerEntity');
      try {
        await userEntityService.patch(proveIssuerEntity.uuid, { authToken: proveIssuedCredentialDto.authToken });
      } catch (e) {
        logger.error('CredentialRequest create caught an error thrown by userEntityService.patch', e);
        throw e;
      }
    }

    // now that the user has a DID we can issue HV credentials for the user
    const hvIssuedCredentialDto: UnumDto<CredentialPb[]> = await issueHvUserCredentials(user, hvIssuerEntity);

    // update the hv issuer's auth token if it has been reissued
    if (hvIssuedCredentialDto.authToken !== hvIssuerEntity.authToken) {
      const userEntityService = ctx.app.service('issuerEntity');
      try {
        await userEntityService.patch(hvIssuerEntity.uuid, { authToken: hvIssuedCredentialDto.authToken });
      } catch (e) {
        logger.error('CredentialRequest create caught an error thrown by userEntityService.patch', e);
        throw e;
      }
    }
  } else {
    logger.debug('User association information sent with identical user did information.');
    user = await userEntityService.patch(user.uuid, { userCode: null }); // remove the userCode from the user
  }

  return {
    ...ctx,
    data: {
      ...ctx.data,
      user
    }
  };
};
