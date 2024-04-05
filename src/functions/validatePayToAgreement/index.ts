const { ENV, REGION, TABLE_ENTITY, TABLE_ENTITY_USER, TABLE_TASKS } =
  process.env;
const isProd = ENV === 'prod';
import { EntityType, Task } from '/opt/API';
import { batchGet, getRecord } from '/opt/dynamoDB';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  isAuthTokenExpired,
  validateBills,
  validatePayToAgreement,
  ValidatePayToAgreementRequest,
} from '/opt/zai';
import { AppSyncIdentityCognito } from '@aws-appsync/utils';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { AppSyncResolverHandler } from 'aws-lambda';
import { DateTime } from 'luxon';

const secretManager = new SecretsManagerClient({ region: REGION });

let zaiAuthToken: CreateZaiAuthTokenResponse;
let zaiClientSecret: string;

const initZai = async () => {
  // get secret from aws secrets manager after init from aws-sdk v3
  try {
    const zaiEnv = isProd ? 'prod' : 'dev';
    const response = await secretManager.send(
      new GetSecretValueCommand({ SecretId: `ZaiSecrets-${zaiEnv}` })
    );

    // access zaiClientSecret from secret
    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);
      zaiClientSecret = secrets.zaiClientSecret;
    }
  } catch (err: any) {
    console.log('ERROR get secret: ', err);
    throw new Error(err.message);
  }

  if (isAuthTokenExpired(zaiAuthToken)) {
    try {
      zaiAuthToken = await createZaiAuthToken({ zaiClientSecret });
      console.log('zaiAuthToken: ', zaiAuthToken);
    } catch (err: any) {
      console.log('ERROR createZaiAuthToken: ', err);
      throw new Error(err.message);
    }
  }

  return {
    zaiAuthToken,
    zaiClientSecret,
  };
};

export const handler: AppSyncResolverHandler<any, any> = async (ctx) => {
  console.log('ctx received: ', JSON.stringify(ctx));
  const { sub, sourceIp } = ctx.identity as AppSyncIdentityCognito;
  const {
    accountNumber,
    bsb,
    entityId,
    billPayments,
    maxPaymentAmount,
    description,
  } = ctx.arguments.input; //TODO: remove description?

  console.log('sourceIp: ', sourceIp);

  await initZai();

  let entityUser;
  try {
    entityUser = await getRecord(TABLE_ENTITY_USER ?? '', {
      id: entityId,
      userId: sub,
    });
    console.log('entityUser: ', entityUser);
  } catch (err: any) {
    console.log('ERROR get entity: ', err);
    throw new Error(err.message);
  }

  if (!entityUser) {
    throw new Error('UNAUTHORISED_ENTITY');
  }

  let entity;
  try {
    entity = await getRecord(TABLE_ENTITY ?? '', { id: entityId });
    console.log('entity: ', entity);
  } catch (err: any) {
    console.log('ERROR get entity: ', err);
    throw new Error(err.message);
  }

  // list tasks from batch get using billIds
  let tasks: Task[] = [];
  const keys = billPayments.map(({ id }: { id: string }) => ({ entityId, id }));
  try {
    tasks = await batchGet({
      tableName: TABLE_TASKS ?? '',
      keys,
    });

    console.log('tasks: ', tasks);
  } catch (err: any) {
    console.log('ERROR batch get bills: ', err);
    throw new Error(err.message);
  }

  validateBills(tasks, billPayments, entityId);

  const today = DateTime.now()
    .setZone('Australia/Sydney')
    .toFormat('yyyy-MM-dd');

  // create zai validate pay to agreement function

  const params: ValidatePayToAgreementRequest = {
    user_external_id: entity?.owner,
    priority: 'ATTENDED',
    //response_requested_by: '', // add custom iso date if need agreement within 5 days
    agreement_info: {
      description,
      short_description: 'Admiin payments limit', // anything more we should add here?
      purpose_code: 'OTHR',
      agreement_type: 'AUPM',
      automatic_renewal: false,
      validity_start_date: today,
    },
    debtor_info: {
      debtor_account_details: {
        // Entity making payment details
        account_id_type: 'BBAN',
        account_id: `${bsb}${accountNumber}`, // BSB and account number
        //payid_details: { // disabled - only support bsb / account number for now
        //  payid_type: "TELI",
        //  payid: "payid"
        //}
      },
      debtor_details: {
        // Entity who will approve the agreement in their banking app
        debtor_name: `${entity.contact.firstName} ${entity.contact.lastName}`,
        debtor_type: entity.type === EntityType.COMPANY ? 'ORGN' : 'PERS',
        ultimate_debtor_name: entity.legalName, // legal name
        debtor_id: entity.taxNumber,
        debtor_id_type: 'AUBN',
        //debtor_reference: ""
      },
    },
    creditor_info: {
      // platform or seller details
      ultimate_creditor_name: 'Admiin',
      //creditor_reference: "creditor reference" - dont think we need as we will take payment for multiple invoices
    },
    payment_initiator_info: {
      // platform or seller details
      initiator_id: '66667797828',
      initiator_id_type_code: 'AUBN',
      initiator_legal_name: 'SIGNPAY PTY LTD',
      initiator_name: 'Admiin',
    },
    payment_terms: {
      payment_amount_info: {
        amount: '1', // For USGB/VARI, indicates the minimum amount per payment.
        currency: 'AUD',
        type: 'VARI',
      },
      maximum_amount_info: {
        //Represents the maximum amount that may be debited in any single payment initiation
        amount: maxPaymentAmount, //e.g. 5000
        currency: 'AUD',
      },
      point_in_time: 'Adhoc',
      frequency: 'ADHOC',
    },
  };

  let validatedPayToAgreement;
  try {
    validatedPayToAgreement = await validatePayToAgreement(
      zaiAuthToken?.access_token,
      params
    );
    console.log('validatedPayToAgreement: ', validatedPayToAgreement);
  } catch (err: any) {
    console.log('ERROR validatePayToAgreement: ', err);
    throw new Error(err.message);
  }

  return validatedPayToAgreement;

  // if validated, create payto agreement
  //if (validatedPayToAgreement?.agreement_uuid) {
  //  let payToAgreement;
  //
  //  try {
  //    payToAgreement = await createPayToAgreement(
  //      zaiAuthToken?.access_token,
  //      validatedPayToAgreement.agreement_uuid
  //    );
  //    console.log('payToAgreement: ', payToAgreement);
  //  } catch (err: any) {
  //    console.log('ERROR createPayToAgreement: ', err);
  //    throw new Error(err.message);
  //  }
  //}
};
