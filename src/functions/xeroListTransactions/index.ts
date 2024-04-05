import { getRecord } from '/opt/dynamoDB';
import { initXeroAndTokenSet } from '/opt/xero';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import { AppSyncResolverHandler } from 'aws-lambda';
import { Invoice } from 'xero-node';
const { TABLE_USER } = process.env;

const scopes =
  'openid profile email offline_access accounting.transactions accounting.settings accounting.contacts accounting.contacts accounting.attachments';

//const xeroTenantId = 'YOUR_XERO_TENANT_ID';
//const ifModifiedSince: Date = new Date("2020-02-06T12:17:43.202-08:00");
//const where = 'Status=="DRAFT"';
//const order = 'InvoiceNumber ASC';
//const iDs = ["00000000-0000-0000-0000-000000000000"];
//const invoiceNumbers = ["INV-001", "INV-002"];
//const contactIDs = ["00000000-0000-0000-0000-000000000000"];
//const statuses = ["DRAFT", "SUBMITTED"];
//const page = 1;
//const includeArchived = true;
//const createdByMyApp = false;
//const unitdp = 4;
//const summaryOnly = true;

export const handler: AppSyncResolverHandler<any, any> = async (
  ctx
): Promise<Invoice[]> => {
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { statuses, page = 1 } = ctx.arguments;
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
  //    try {
  //      xero.setTokenSet(user?.xeroTokenSet);
  //      tokenSet = xero.readTokenSet();
  //    } catch (err: any) {
  //      console.log('ERROR setTokenSet:', err);
  //      throw new Error(err.message)
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
  //      } catch (err: any) {
  //        throw new Error(err.message);
  //      }
  //
  //      console.log('Updated user: ', user);
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

  let invoices;
  try {
    //invoices = await xero.accountingApi.getInvoices(activeTenant.tenantId);
    invoices = await xero.accountingApi.getInvoices(
      activeTenant.tenantId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      statuses,
      page,
      false,
      undefined,
      undefined,
      undefined
    );
    //invoices = await xero.accountingApi.getInvoices(activeTenant.tenantId, ifModifiedSince, where, order, iDs, invoiceNumbers, contactIDs, statuses, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
  } catch (err: any) {
    console.log('ERROR list invoices: ', err);
    throw new Error(err.message);
  }

  console.log('invoices: ', invoices?.body?.invoices);

  return invoices?.body?.invoices || [];
};
