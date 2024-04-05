import { updateRecord } from '/opt/dynamoDB';
import { getScopes, initXeroClient } from '/opt/xero';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import {
  InvocationType,
  InvokeCommand,
  LambdaClient,
} from '@aws-sdk/client-lambda';
import { AppSyncResolverHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { jwtDecode } from 'jwt-decode';
import { XeroAccessToken, XeroIdToken } from 'xero-node';
import { createCognitoUser, getCognitoUser } from '/opt/cognito';

const { AUTH_USERPOOLID, FUNCTION_CREATEUSER, TABLE_USER } = process.env;

const lambda = new LambdaClient({ apiVersion: '2015-03-31' });

let xero;
// openid profile email offline_access accounting.transactions accounting.settings accounting.contacts accounting.contacts accounting.attachments
export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  const { input } = ctx.arguments;
  const { url, scopeSet } = input;
  console.log('url: ', url);

  const scopes = getScopes(scopeSet);

  try {
    xero = initXeroClient({
      scopes: scopes.split(' '),
      grantType: 'authorization_code',
    });
  } catch (err: any) {
    console.log('ERROR init xero: ', err);
    throw new Error(err.message);
  }

  try {
    xero = await xero.initialize();
  } catch (err: any) {
    console.log('ERROR initialize xero: ', err);
    throw new Error(err.message);
  }

  let tokenSet;
  try {
    tokenSet = await xero.apiCallback(url);

    console.log('tokenSet: ', tokenSet);
  } catch (err: any) {
    console.log('ERROR get token set: ', err);
    throw new Error(err.message);
  }

  //TODO: tokenSet?.id_token is only returned if scopeSet === 'PROFILE'
  if (tokenSet?.id_token && tokenSet?.access_token) {
    const identity = ctx?.identity as AppSyncIdentityCognito;
    try {
      await xero.updateTenants(false);
    } catch (err: any) {
      console.log('ERROR update tenants: ', err);
      throw new Error(err.message);
    }

    console.log('xero.config.state: ', xero?.config?.state);

    //const activeTenant = xero.tenants?.[0];
    console.log('xero.tenants: ', xero.tenants);

    const decodedIdToken: XeroIdToken = jwtDecode(tokenSet.id_token);
    console.log('Decoded Xero id token: ', decodedIdToken);

    const decodedAccessToken: XeroAccessToken = jwtDecode(
      tokenSet.access_token
    );
    console.log('Decoded Xero access token: ', decodedAccessToken);

    let user;
    if (identity?.sub) {
      // update user
      const updateParams = {
        xeroDecodedIdToken: decodedIdToken,
        xeroTokenSet: tokenSet,
        //xeroActiveTenant: activeTenant,
        xeroSession: randomUUID(),
      };

      console.log('Update params: ', updateParams);
      try {
        user = await updateRecord(
          TABLE_USER ?? '',
          {
            id: identity?.sub,
          },
          updateParams
        );

        console.log('Updated user: ', user);
      } catch (err: any) {
        throw new Error(err.message);
      }
    }

    // non user
    else {
      // check existing cognito user by email
      let cognitoUser;
      try {
        cognitoUser = await getCognitoUser(
          AUTH_USERPOOLID ?? '',
          decodedIdToken.email
        );
        console.log('Existing cognito user: ', cognitoUser);
      } catch (err: any) {
        // only throw error if not user not found
        if (err?.message?.includes('UserNotFoundException')) {
          console.log('ERROR get cognito user: ', err);
          throw new Error(err.message);
        }
      }

      let user;
      // if user update record
      if (cognitoUser) {
        // update user
        const updateParams = {
          xeroDecodedIdToken: decodedIdToken,
          xeroTokenSet: tokenSet,
          //xeroActiveTenant: activeTenant,
          xeroSession: randomUUID(),
        };

        console.log('Update params: ', updateParams);
        try {
          user = await updateRecord(
            TABLE_USER ?? '',
            {
              id: cognitoUser.Username,
            },
            updateParams
          );
        } catch (err: any) {
          throw new Error(err.message);
        }
      }

      // create user if not found
      else {
        try {
          const cognitoParams = {
            firstName: decodedIdToken.given_name,
            lastName: decodedIdToken.family_name,
            email: decodedIdToken.email,
          };

          const { User } = await createCognitoUser(
            AUTH_USERPOOLID ?? '',
            cognitoParams
          );
          cognitoUser = User;
          console.log('New cognito user: ', cognitoUser);
        } catch (err: any) {
          console.log('err create cognito user: ', err);
          throw new Error(err.message);
        }

        //const userParams = {
        //  firstName: decoded.given_name,
        //  lastName: decoded.family_name,
        //  email: decoded.email,
        //  xeroUserId: decoded.xero_userid,
        //  xeroDecodedIdToken: decoded,
        //  xeroTokenSet: tokenSet,
        //  xeroActiveTenant: activeTenant,
        //  session: randomUUID()
        //}

        const userAttributes = {
          sub: cognitoUser?.Username,
          email: decodedIdToken.email,
          given_name: decodedIdToken.given_name,
          family_name: decodedIdToken.family_name,
          xeroUserId: decodedIdToken.xero_userid,
          xeroDecodedIdToken: decodedIdToken,
          xeroTokenSet: tokenSet,
          //xeroActiveTenant: activeTenant,
          xeroSession: randomUUID(),
        };

        console.log('Create user userAttributes: ', userAttributes);

        const params = {
          FunctionName: FUNCTION_CREATEUSER,
          InvocationType: InvocationType.RequestResponse, // | RequestResponse = sync / Event = not wait for response
          Payload: Buffer.from(
            JSON.stringify({
              userPoolId: AUTH_USERPOOLID,
              userAttributes,
              userName: cognitoUser?.Username,
            })
          ),
        };

        try {
          const command = new InvokeCommand(params);
          user = await lambda.send(command);
          console.log('user: ', user);
        } catch (err: any) {
          console.log('ERROR invoke create user: ', err);
          throw new Error(err.message);
        }
      }

      return {
        token: tokenSet.id_token,
        expiresIn: decodedIdToken.exp, //potentially need expires_at: expiresIn * 1000 + new Date().getTime() on the client https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation https://github.com/aws-amplify/amplify-js/issues/11321
        user: {
          email: decodedIdToken.email,
          givenName: decodedIdToken.given_name,
          familyName: decodedIdToken.family_name,
        },
      };
    }
  }

  return {};
};
