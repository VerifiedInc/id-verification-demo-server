
/**
 * formats an auth token as a valid Bearer token.
 * If the Bearer prefix was saved with the token it will be returned unchanged,
 * otherwise it will be returned with the Bearer prefix added
 * @param {string} token an auth token
 * @returns {string} a valid Bearer token
 */
export const formatBearerToken = (token: string): string => {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};
