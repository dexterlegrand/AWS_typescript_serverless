import { getRecord } from '/opt/dynamoDB';
import { initXeroAndTokenSet } from '/opt/xero';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import { Contact } from 'xero-node';

const { TABLE_USER } = process.env;

const scopes =
  'openid profile email offline_access accounting.transactions accounting.settings accounting.contacts accounting.contacts accounting.attachments';

export const handler: AppSyncResolverHandler<any, any> = async (
  ctx
): Promise<Contact[]> => {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { page = 1 } = ctx.arguments;
  console.log('EVENT RECEIVED: ', ctx);
  console.log('EVENT RECEIVED STRINGIFIED: ', JSON.stringify(ctx));

  let user;
  try {
    user = await getRecord(TABLE_USER ?? '', { id: sub });
  } catch (err: any) {
    console.log('ERROR get user: ', err);
    throw new Error(err.message);
  }

  console.log('user: ', user);
  console.log('user xero token set: ', user?.xeroTokenSet);

  //let tokenSet;
  //if (user?.xeroTokenSet) {
  //  try {
  //    xero = initXeroClient({
  //      scopes: scopes.split(' '),
  //      grantType: 'authorization_code'
  //    })
  //  } catch (err: any) {
  //    console.log('ERROR init xero: ', err);
  //    throw new Error(err.message);
  //  }
  //
  //  try {
  //    xero = await xero.initialize();
  //  } catch (err: any) {
  //    console.log('ERROR initialize xero: ', err);
  //    throw new Error(err.message);
  //  }
  //
  //  try {
  //    xero.setTokenSet(user?.xeroTokenSet);
  //    tokenSet = xero.readTokenSet();
  //  } catch (err: any) {
  //    console.log('ERROR setTokenSet:', err);
  //    throw new Error(err.message)
  //  }
  //
  //  if (tokenSet.expired()) {
  //    console.log('tokenSet is expired, refreshing token');
  //    tokenSet = await xero.refreshWithRefreshToken(XERO_CLIENT_ID, XERO_CLIENT_SECRET, tokenSet.refresh_token)
  //
  //    // refresh token set
  //    try {
  //      tokenSet = await xero.refreshToken();
  //      console.log('refreshed token set: ', tokenSet);
  //    } catch (err: any) {
  //      throw new Error(err.message);
  //    }
  //
  //    if (tokenSet?.id_token) {
  //      const decodedIdToken: XeroIdToken = jwtDecode(tokenSet.id_token);
  //      console.log('Decoded Xero id token: ', decodedIdToken);
  //
  //      // update user with new xero token set
  //      const updateParams = {
  //        xeroDecodedIdToken: decodedIdToken,
  //        xeroTokenSet: tokenSet,
  //        //xeroActiveTenantId: activeTenant, //TODO
  //        xeroSession: randomUUID()
  //      }
  //
  //      console.log('Update params: ', updateParams);
  //      try {
  //        user = await updateRecord(TABLE_USER ?? '', {
  //          id: sub
  //        }, updateParams);
  //
  //        console.log('Updated user: ', user);
  //      } catch (err: any) {
  //        throw new Error(err.message);
  //      }
  //    }
  //  }
  //
  //  try {
  //    await xero.updateTenants(false)
  //  } catch (err: any) {
  //    console.log('ERROR update tenants: ', err);
  //    throw new Error(err.message);
  //  }
  //
  //  console.log('xero.tenants: ', xero.tenants);
  //} else {
  //  throw new Error('no token set')
  //}

  let xero;
  try {
    xero = await initXeroAndTokenSet({
      user,
      scopes,
      sub,
    });
  } catch (err: any) {
    throw new Error(err.message);
  }

  const activeTenant = xero.tenants?.[0];

  if (!activeTenant) {
    throw new Error('no active tenant');
  }

  let contacts;
  try {
    //getContacts(xeroTenantId, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm?, options)
    contacts = await xero.accountingApi.getContacts(
      activeTenant.tenantId,
      undefined,
      undefined,
      undefined,
      undefined,
      page,
      false,
      undefined,
      undefined,
      undefined
    );
  } catch (err: any) {
    console.log('ERROR list contacts: ', err);
    throw new Error(err.message);
  }

  console.log('contacts: ', contacts?.body?.contacts);

  return contacts?.body?.contacts || [];
};
