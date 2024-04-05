import { updateRecord } from '/opt/dynamoDB';
import { randomUUID } from 'crypto';
import { jwtDecode } from 'jwt-decode';
import { TokenSet, XeroClient, XeroIdToken } from 'xero-node';
import { User } from './API';

const { XERO_CLIENT_ID, XERO_CLIENT_SECRET, TABLE_USER } = process.env;

//export const xeroUrl = ENV === '' ? '' : '';

interface InitXeroProps {
  redirectUris?: string[]; //The redirect URI configured for the app created at https://developer.xero.com/myapps must match the REDIRECT_URI variable otherwise an "Invalid URI" error will be reported when attempting the initial connection to Xero.
  scopes: string[];
  state?: string;
  httpTimeout?: number;
  clockTolerance?: number;
  grantType?: string;
}

export interface UserWithTokenSet extends User {
  xeroTokenSet?: TokenSet;
}

/**
 * Initialize Xero client
 *
 * @param redirectUris
 * @param scopes
 * @param httpTimeout
 * @param grantType
 */
export const initXeroClient = ({
  redirectUris = ['http://localhost:4200/xero-redirect'],
  scopes,
  //state = '123',
  httpTimeout = 2000,
  grantType,
}: //clockTolerance = 10
InitXeroProps) => {
  if (!XERO_CLIENT_ID) {
    throw new Error('XERO_CLIENT_ID not set');
  }

  if (!XERO_CLIENT_SECRET) {
    throw new Error('XERO_CLIENT_SECRET not set');
  }

  return new XeroClient({
    clientId: XERO_CLIENT_ID,
    clientSecret: XERO_CLIENT_SECRET,
    redirectUris,
    scopes,
    grantType,
    //state, // custom params (optional) - The state parameter should be used to avoid forgery attacks. Pass in a value that’s unique to the user you’re sending through authorisation. It will be passed back after the user completes authorisation.
    httpTimeout, // ms (optional)
    //clockTolerance // seconds (optional)
  });
};

interface InitXeroAndTokenSetProps {
  user: UserWithTokenSet;
  scopes: string;
  sub: string;
}

/**
 * Initialize Xero client and set token set, including update user with refreshed tokenSet if necessary
 *
 * @param user
 * @param scopes
 * @param sub
 */
export const initXeroAndTokenSet = async ({
  user,
  scopes,
  sub,
}: InitXeroAndTokenSetProps) => {
  let xero;
  let tokenSet;

  if (!TABLE_USER) {
    console.log('TABLE_USER not set');
    throw new Error('TABLE_USER not set');
  }
  if (!user?.xeroTokenSet) {
    throw new Error('No xero token set for user');
  }
  try {
    xero = initXeroClient({
      scopes: scopes.split(' '),
      grantType: 'authorization_code',
    });
  } catch (err: any) {
    console.log('ERROR init xero: ', err);
    throw new Error(handleXeroError(err));
  }

  try {
    xero = await xero.initialize();
  } catch (err: any) {
    console.log('ERROR initialize xero: ', err);
    throw new Error(handleXeroError(err));
  }

  try {
    xero.setTokenSet(user?.xeroTokenSet);
    tokenSet = xero.readTokenSet();
  } catch (err: any) {
    console.log('ERROR setTokenSet:', err);
    throw new Error(err.message);
  }

  if (tokenSet.expired()) {
    console.log('tokenSet is expired, refreshing token: ', tokenSet);
    try {
      tokenSet = await xero.refreshWithRefreshToken(
        XERO_CLIENT_ID,
        XERO_CLIENT_SECRET,
        tokenSet.refresh_token
      );
    } catch (err: any) {
      console.log('ERROR refreshWithRefreshToken: ', err);
      throw new Error(handleXeroError(err));
    }

    // refresh token set
    try {
      tokenSet = await xero.refreshToken();
      console.log('refreshed token set: ', tokenSet);
    } catch (err: any) {
      console.log('ERROR refreshToken: ', err);
      throw new Error(handleXeroError(err));
    }

    try {
      xero.setTokenSet(user?.xeroTokenSet);
      tokenSet = xero.readTokenSet();
      console.log('read tokenset: ', tokenSet);
    } catch (err: any) {
      console.log('ERROR setTokenSet:', err);
      throw new Error(err.message);
    }

    if (tokenSet?.id_token) {
      const decodedIdToken: XeroIdToken = jwtDecode(tokenSet.id_token);
      console.log('Decoded Xero id token: ', decodedIdToken);

      // update user with new xero token set
      try {
        const updateParams = {
          xeroDecodedIdToken: decodedIdToken,
          xeroTokenSet: tokenSet,
          //xeroActiveTenantId: activeTenant, //TODO
          xeroSession: randomUUID(),
        };
        console.log('Update user params: ', updateParams);
        const updatedUser = await updateRecord(
          TABLE_USER ?? '',
          {
            id: sub,
          },
          updateParams
        );
        console.log('Updated user: ', updatedUser);
      } catch (err: any) {
        throw new Error(handleXeroError(err));
      }
    }
  }

  try {
    await xero.updateTenants(false);
  } catch (err: any) {
    console.log('ERROR update tenants: ', err);
    throw new Error(handleXeroError(err));
  }

  console.log('xero.tenants: ', xero.tenants);

  return xero;
};

//export interface XeroGetOriginalUrl {
//  code: string;
//  scopes: string;
//  sessionState: string;
//}

//interface VerifyXeroWebhookEventSignatureProps {
//  webhookKey: string;
//  req: Request;
//}

//export const verifyXeroWebhookEventSignature = ({ webhookKey, req }: VerifyXeroWebhookEventSignatureProps) => {
//  if (!req.body) {
//    throw new Error('No webhook request body');
//  }
//
//  if (!req.headers) {
//    throw new Error('No request headers')
//  }
//
//  const computedSignature = crypto.createHmac('sha256', webhookKey).update(req.body.toString()).digest('base64');
//  const xeroSignature = req.headers['x-xero-signature'];
//
//  if (xeroSignature === computedSignature) {
//    console.log('Signature passed! This is from Xero!');
//    return true;
//  }
//  else {
//    // If this happens someone who is not Xero is sending you a webhook
//    console.log('Signature failed. Webhook might not be from Xero or you have misconfigured something...');
//    console.log(`Got {${computedSignature}} when we were expecting {${xeroSignature}}`);
//    return false;
//  }
//}

export const handleXeroError = (err: any) => {
  console.log('Xero error statuscode: ', err?.statusCode);
  console.log('Xero error statusMessage: ', err?.statusMessage);
  console.log('Xero error Detail: ', err?.body?.Detail);
  console.log('Xero body error: ', err?.body);
  return err?.statusMessage || err?.body; //TODO: body is string, err?.body?.error
  //if (err?.statusCode === 401) {
  //  return 'Xero error 401';
  //}
  //else if (err?.statusCode === 403) {
  //  return 'Xero error 403';
  //}
  //else if (err?.statusCode === 404) {
  //  return 'Xero error 404';
  //}
  //else if (err?.statusCode === 500) {
  //  return 'Xero error 500';
  //}
  //else {
  //  return err.message;
  //}
};

export const getScopes = (scopeSet: string) => {
  if (scopeSet === 'PROFILE') {
    return 'openid profile email offline_access';
  } else if (scopeSet === 'ACCOUNTING') {
    return 'offline_access accounting.transactions accounting.settings accounting.contacts accounting.contacts accounting.attachments';
  } else {
    return '';
  }
};
