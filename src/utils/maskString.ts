import twilio from 'twilio';
import { config } from '../config';

import logger from '../logger';

/**
 * Mask all but some last number of characters in a string.
 * ref: https://stackoverflow.com/a/61034707/2631728
 * @param ssn
 * @param numOfDigits
 * @returns
 */
export function maskString (ssn: string, numOfDigits: number): string {
  return ssn ? ssn.slice(0, -numOfDigits).replace(/./g, '#') + ssn.slice(-numOfDigits) : '';
}
