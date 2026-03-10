// Central configuration for API endpoints based on DEBUG mode
// When REACT_APP_ENCRYPTION_ON=false, use MYSPACE-DEV endpoints
// When REACT_APP_ENCRYPTION_ON=true, use MYSPACE endpoints

const encryptionON = process.env.REACT_APP_ENCRYPTION_ON === "true";
const BASE_URL = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2";

// Determine which environment suffix to use
const ENV_SUFFIX = encryptionON ? "MYSPACE" : "MYSPACE-DEV";

// Export all API endpoints
export const API_ENDPOINTS = {
  ACCOUNT_SALT: `${BASE_URL}/AccountSalt/${ENV_SUFFIX}`,
  LOGIN: `${BASE_URL}/Login/${ENV_SUFFIX}`,
  USER_SOCIAL_LOGIN: `${BASE_URL}/UserSocialLogin/${ENV_SUFFIX}`,
  UPDATE_USER_BY_UID: `${BASE_URL}/UpdateUserByUID/${ENV_SUFFIX}`,
  CREATE_ACCOUNT: `${BASE_URL}/CreateAccount/${ENV_SUFFIX}`,
  SET_TEMP_PASSWORD: `${BASE_URL}/SetTempPassword/${ENV_SUFFIX}`,
  USER_SOCIAL_SIGNUP: `${BASE_URL}/UserSocialSignUp/${ENV_SUFFIX}`,
  UPDATE_ACCESS_TOKEN: `${BASE_URL}/UpdateAccessToken/${ENV_SUFFIX}`,
};

// For debugging purposes
console.log(`API Endpoints configured for: ${ENV_SUFFIX} (DEBUG: ${encryptionON})`);
