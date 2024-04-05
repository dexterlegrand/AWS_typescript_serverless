//let config = null;
export const GOOGLE_KEY_FILE = {
  type: 'service_account',
  project_id: 'xxxxx',
  private_key_id: 'xxxxxx',
  private_key: 'xxxxxxx',
  client_email: 'xxxxxxxxx',
  client_id: 'xxxxxx',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'xxxxxxxx',
};
export const GOOGLE_BUNDLE_ID = 'com.xxxxx.xxxxxxxx';

//const readConfig = (configParams) => {
//  if (!configParams) {
//    // no google iap or public key(s) from ENV variables
//    return;
//  }
//
//  Object.keys(configParams).forEach(function (key) {
//    if (isValidConfigKey(key)) {
//      config[key] = configParams[key];
//    }
//  });
//};
