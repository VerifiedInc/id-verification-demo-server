import twilio from 'twilio';
import { config } from '../config';

import logger from '../logger';

export const sendSms = async function sendSms (
  phoneNumber: string,
  body: string
): Promise<any> {
  logger.info(`sendSms to ${phoneNumber} with body ${body}.`);
  const twilioClient = twilio(config.ACCOUNT_SID, config.AUTH_TOKEN);
  const response = await twilioClient.messages.create({
    body,
    from: config.FROM_NUMBER,
    to: phoneNumber
  });
  logger.debug(`sendSms response ${JSON.stringify(response)}.`);
};
