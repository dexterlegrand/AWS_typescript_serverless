const { ENV, REGION, TABLE_PAYMENT_ACCOUNT, TABLE_PAYMENTS, TABLE_ENTITY } =
  process.env;
const isProd = ENV === 'prod';
import { createRecord, getRecord, updateRecord } from '/opt/dynamoDB';
import {
  ZaiItemWebhookEvent,
  ZaiBatchTransactionsWebhookEvent,
  ZaiUserWebhookEvent,
  ZaiTransactionWebhookEvent,
  ZaiDisbursementWebhookEvent,
  ZaiAccountsWebhookEvent,
  ZaiCompanyWebhookEvent,
  ZaiVirtualAccountWebhookEvent,
  ZaiPayIdsWebhookEvent,
  ZaiPaytoAgreementWebhook,
  ZaiPaytoPaymentsWebhookEvent,
  ZaiTransactionFailureAdviceWebhookEvent,
  ItemStatuses,
  ZaiTransaction,
  createZaiItem,
  CreateZaiAuthTokenResponse,
  isAuthTokenExpired,
  createZaiAuthToken,
  makeZaiPayment,
  createZaiUser,
  createZaiCompany,
  CreateZaiUserRequest,
  getZaiUserWallet,
  createBpayAccount,
} from '/opt/zai';
import { getWallet, payBill } from '/opt/zai/walletAccounts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { DateTime } from 'luxon';

const secretManager = new SecretsManagerClient({ region: REGION });
const DdbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DdbClient);

let zaiAuthToken: CreateZaiAuthTokenResponse;
let zaiClientSecret: string;

interface ZaiWebhookHandlerEvent {
  webhookEvent: {
    payload:
      | ZaiBatchTransactionsWebhookEvent
      | ZaiItemWebhookEvent
      | ZaiUserWebhookEvent
      | ZaiDisbursementWebhookEvent
      | ZaiTransactionWebhookEvent
      | ZaiAccountsWebhookEvent
      | ZaiCompanyWebhookEvent
      | ZaiVirtualAccountWebhookEvent
      | ZaiPayIdsWebhookEvent
      | ZaiPaytoAgreementWebhook
      | ZaiPaytoPaymentsWebhookEvent
      | ZaiTransactionFailureAdviceWebhookEvent;
  };
}

const isUpdatedDateNewerThanExisting = (
  updatedAt: string,
  lastUpdatedAt?: string | null
) => {
  if (!lastUpdatedAt) {
    return true;
  }

  const d1 = DateTime.fromISO(updatedAt);
  const d2 = DateTime.fromISO(lastUpdatedAt);

  if (d1 < d2) {
    console.log('updatedAt is older');
  } else if (d1 === d2) {
    console.log('updatedAt is equal');
  }
  return d1 > d2;
};

// init zai
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

export const queryPaymentAccount = async (
  billerCode: string,
  reference: string
) => {
  // query paymentAccountsByEntityBillerCode index
  const params = {
    TableName: TABLE_PAYMENT_ACCOUNT,
    IndexName: 'paymentAccountsByBillerCodeReference',
    KeyConditionExpression:
      '#billerCode = :billerCode and #reference = :reference',
    ExpressionAttributeNames: {
      '#billerCode': 'billerCode',
      '#reference': 'reference',
    },
    ExpressionAttributeValues: {
      ':billerCode': billerCode,
      ':reference': reference,
    },
  };

  const command: QueryCommand = new QueryCommand(params);
  const data = await docClient.send(command);
  return data.Items;
};

export const handler = async (event: ZaiWebhookHandlerEvent) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const {
    webhookEvent: { payload },
  } = event;

  await initZai();

  // Handle 'items' webhook event
  // Triggers: Any data changes for that Item. Typically used whenever the state of the object changes.
  if ('items' in payload && payload?.items) {
    console.log('Zai ITEM: ', payload?.items);
    const zaiItem = payload.items;
    let paymentRecord;
    try {
      paymentRecord = await getRecord(TABLE_PAYMENTS ?? '', { id: zaiItem.id });
    } catch (err: any) {
      console.log('ERROR get item record: ', err);
    }

    if (paymentRecord) {
      if (
        isUpdatedDateNewerThanExisting(
          zaiItem.updated_at,
          paymentRecord.zaiUpdatedAt
        )
      ) {
        const paymentParams = {
          status: ItemStatuses[zaiItem.status],
          zaiUpdatedAt: zaiItem.updated_at,
          updatedAt: zaiItem.updated_at,
        };

        try {
          await updateRecord(
            TABLE_PAYMENTS ?? '',
            { id: zaiItem.id },
            paymentParams
          );
        } catch (err: any) {
          console.log('ERROR update payment record', err);
          //throw new Error(err.message);
        }
      }
    }

    console.log('paymentRecord: ', paymentRecord);

    // Checking that an Item has had a payment made

    // state => pending. status => 22000. Do this on createPayment or here? maybe updatedAt will be the same

    // state => completed. status => 22500. Task to paid?

    // Checking if a payment has been held

    // Checking if a payment has been refunded
  }

  // Handle 'users' webhook event
  // Triggers: Any data changes for that User. Typically used whenever the state of the object changes.
  else if ('users' in payload && payload?.users) {
    console.log('USERS event: ', payload);

    //Checking when a user’s KYC state has been approved

    //Checking if a user has been 'KYC held'
  }

  // Handle 'batch_transactions' webhook event
  // Triggers: On creation of any Batch Transactions and whenever the state changes.
  else if ('batch_transactions' in payload && payload?.batch_transactions) {
    console.log('BATCH_TRANSACTIONS event: ', payload);
    const type = payload?.batch_transactions?.type;
    const typeMethod = payload?.batch_transactions?.type_method;
    const state = payload?.batch_transactions?.state;
    console.log('type: ', type);
    // direct credit payout

    // Checking the status of a direct debit/ACH payment

    // Checking the details of a disbursement for a User or Item

    // initiate a payout to a seller
    //type: payment_funding and type_method: credit_card with a status of successful. Additionally, you will also receive another callback for items with the value of released_amount equal to the value of the item amount.
    if (type === 'payment_funding') {
      if (typeMethod === 'credit_card') {
        if (state === 'successful') {
          let paymentAccount;

          // get payment
          let paymentRecord;
          try {
            paymentRecord = await getRecord(TABLE_PAYMENTS ?? '', {
              id: payload?.batch_transactions?.item?.id,
            });

            console.log('paymentRecord: ', paymentRecord);
          } catch (err: any) {
            console.log('ERROR get payment: ', err);
            //throw new Error(err.message);
          }

          // get payment entity To
          let entityToRecord;
          try {
            entityToRecord = await getRecord(TABLE_ENTITY ?? '', {
              id: paymentRecord?.entityToId,
            });
            console.log('entityTo: ', entityToRecord);
          } catch (err: any) {
            console.log('ERROR get entity: ', err);
            //throw new Error(err.message);
          }

          const sanitisedEmail = entityToRecord.email.replace(/\+.+@/, '@');
          const [username, domain] = sanitisedEmail.split('@');
          const zaiEmail = `${username}+${entityToRecord.billerCode}#${paymentRecord.reference}@${domain}`; // make unique email address for Zai (as email for users must be unique)
          const userId = `${entityToRecord.billerCode}#${paymentRecord.reference}`;

          // lookup BPAY account for entity To and the CRN

          let paymentAccountRecord;
          try {
            paymentAccountRecord = await queryPaymentAccount(
              entityToRecord?.billerCode,
              paymentRecord?.reference
            );
            console.log('paymentAccountRecord: ', paymentAccountRecord);
          } catch (err: any) {
            console.log('ERROR get payment account record: ', err);
            //throw new Error(err.message);
          }

          // set seller details if exists

          if (paymentAccountRecord?.[0]) {
            // set seller details
            paymentAccount = paymentAccountRecord[0];
          } else {
            // create seller and BPAY account if it doesn't exist
            const user: CreateZaiUserRequest = {
              first_name: entityToRecord?.firstName,
              last_name: entityToRecord?.lastName,
              email: zaiEmail,
              id: userId,
              country: 'AUS',
            };
            let zaiUser;
            try {
              zaiUser = await createZaiUser(zaiAuthToken?.access_token, user);
              console.log('zai user: ', zaiUser);
            } catch (err: any) {
              console.log('ERROR create zai user: ', err);
            }

            if (zaiUser) {
              const company = {
                name: entityToRecord?.name,
                legal_name: entityToRecord?.name,
                tax_number: entityToRecord?.taxNumber,
                user_id: userId,
                country: 'AUS',
              };
              let zaiCompany;
              try {
                zaiCompany = await createZaiCompany(
                  zaiAuthToken?.access_token,
                  company
                );
                console.log('Zai company: ', zaiCompany);
              } catch (err: any) {
                console.log('ERROR create zai company: ', err);
              }

              let zaiUserWallet;
              try {
                zaiUserWallet = await getZaiUserWallet(
                  zaiAuthToken?.access_token,
                  zaiUser.users.id
                );
                console.log('zaiUserWallet: ', zaiUserWallet);
              } catch (err: any) {
                console.log('ERROR get zai user wallet: ', err);
              }

              let zaiBpayAccount;
              try {
                zaiBpayAccount = await createBpayAccount(
                  zaiAuthToken?.access_token,
                  {
                    user_id: zaiUser?.users.id,
                    account_name: entityToRecord?.name,
                    biller_code: entityToRecord?.billerCode,
                    bpay_crn: paymentRecord?.reference,
                  }
                );
                console.log('bpayAccount: ', zaiBpayAccount);
              } catch (err: any) {
                console.log('ERROR create bpay account: ', err);
              }

              const createdAt = DateTime.now().toISO();
              const createPaymentAccountParams = {
                id: randomUUID(),
                billerCode: entityToRecord?.billerCode,
                reference: paymentRecord?.reference,
                entityId: entityToRecord?.id,
                zaiBpayAccountId: zaiBpayAccount?.bpay_accounts?.id ?? null,
                paymentAccountType: 'BPAY', //'PaymentAccountType.BPAY',
                direction: 'PAYOUT',
                zaiUserId: zaiUser?.users.id,
                zaiCompanyId: zaiCompany?.companies?.id,
                zaiUserWalletId: zaiUserWallet?.wallet_accounts?.id ?? null,
                createdAt,
                updatedAt: createdAt,
              };
              try {
                await createRecord(
                  TABLE_PAYMENT_ACCOUNT ?? '',
                  createPaymentAccountParams
                );
              } catch (err: any) {
                console.log('ERROR create payment account: ', err);
              }
            }
            // set seller details
          }

          console.log('paymentAccount: ', paymentAccount);
          // do payout to zai seller's payment account
          let payBillData;
          const payBillParams = {
            account_id: paymentAccount?.zaiBpayAccountId,
            amount: paymentRecord?.amount,
            reference_id: paymentRecord?.reference,
          };
          console.log('payBillParams: ', payBillParams);
          try {
            payBillData = await payBill(
              zaiAuthToken?.access_token,
              paymentAccount?.zaiBpayAccountId,
              payBillParams
            );
            console.log('payBillData: ', payBillData);
          } catch (err: any) {
            console.log('ERROR payBill: ', JSON.stringify(err));
          }

          // do something with payBillData.id (disbursement id)
          let updatedPaymentRecord;
          const disbursementId = payBillData?.disbursements?.id;
          try {
            updatedPaymentRecord = await updateRecord(
              TABLE_PAYMENTS ?? '',
              { id: paymentRecord?.id },
              { disbursementId }
            );

            console.log('updatedPaymentRecord: ', updatedPaymentRecord);
          } catch (err: any) {
            console.log('ERROR update payment record', err);
          }
        } else {
          console.log('UNHANDLED payment_funding STATE: ', state);
        }
      } else {
        console.log('UNHANDLED payment_funding method: ', typeMethod);
      }
    }

    // get the entity To
    // ZAI comments - Please onboard a separate payout user for each unique CRN + Biller code. Please do not use a single user and attach CRNs to the same user.
  }

  // Handle 'accounts' webhook event
  // Triggers: When the state or enabled status of an account changes. This includes creating one and covers all types of accounts (bank, card, wallets...etc). No data can be changed on an existing account.
  // Examples: Checking if a bank account has invalid details, received after a failed disbursement
  else if ('accounts' in payload && payload?.accounts) {
    console.log('ACCOUNTS event: ', payload);
  }

  // Handle 'transactions' webhook event
  // Triggers: On creation of any Transactions and whenever the state changes.
  else if ('transactions' in payload && payload?.transactions) {
    console.log('TRANSACTIONS event: ', payload);
    const transaction: ZaiTransaction = payload?.transactions;
    //const updatedAt = transaction?.updated_at;
    //const id = transaction?.id;
    console.log('transaction: ', transaction);

    if (
      transaction?.type === 'deposit' &&
      transaction?.type_method === 'npp_payin'
    ) {
      console.log('NPP_PAYIN transaction: ', transaction);
      //const userId = transaction?.user_id;
      const accountId = transaction?.account_id;

      // With PayID, it will be different as the funds will settle into the Buyer's wallet as opposed to the Seller's wallet.
      // So you can transfer the funds to each seller's wallet only after the reconciliation.
      // You can use reference details entered by them for each payin to reconcile at your end

      // for bill of bills money deposited for

      const bills = [
        {
          id: 'task-id',
          amount: 500,
          buyerId: 'entity.owner',
          sellerId: 'entityTo.owner',
          entityIdFrom: 'entity.id',
          entityIdTo: 'entityTo.id',
          ipAddress: 'ipAddress',
        },
        {
          id: 'task-id',
          amount: 500,
          buyerId: 'entity.owner',
          sellerId: 'entityTo.owner',
          entityIdFrom: 'entity.id',
          entityIdTo: 'entityTo.id',
          ipAddress: 'ipAddress',
        },
      ];
      for (const bill of bills) {
        // create item with each seller
        const zaiItemParams = {
          id: bill.id,
          name: `Task: ${bill.id}`,
          payment_type: 2,
          amount: bill.amount,
          currency: 'AUD',
          buyer_id: bill.buyerId,
          seller_id: bill.sellerId,
        };

        let entityTo;
        try {
          entityTo = await getRecord(TABLE_ENTITY ?? '', {
            id: bill.entityIdTo,
          });
          console.log('entityTo: ', entityTo);
        } catch (err: any) {
          console.log('ERROR get entity: ', err);
          //throw new Error(err.message);
        }

        // create zai item
        let zaiItem;
        try {
          const zaiItemData = await createZaiItem(
            zaiAuthToken?.access_token,
            zaiItemParams
          );
          console.log('zaiItemData: ', zaiItemData);

          zaiItem = zaiItemData?.items;
        } catch (err: any) {
          console.log('ERROR createZaiItem: ', err);
          //throw new Error(err.message);
        }

        //make payment for item
        if (zaiItem?.id) {
          let itemPaymentData;
          const itemPaymentParams = {
            account_id: transaction.account_id,
            ip_address: bill.ipAddress,
            merchant_phone: entityTo?.phone,
          };
          console.log('makeZaiPayment params: ', itemPaymentParams);
          try {
            itemPaymentData = await makeZaiPayment(
              zaiAuthToken?.access_token,
              zaiItem.id,
              itemPaymentParams
            );
            console.log('makeZaiPayment data: ', itemPaymentData);
            zaiItem = itemPaymentData?.items;
          } catch (err: any) {
            console.log('ERROR makeZaiPayment: ', JSON.stringify(err));
          }

          // get wallet to see if funds disbursed
          let wallet;
          try {
            wallet = await getWallet(zaiAuthToken?.access_token, accountId);
            console.log('wallet: ', wallet);
          } catch (err: any) {
            console.log('ERROR get wallet: ', err);
          }
        }
      }
    } else {
      console.log('UNHANDLED transaction: ', transaction);
    }

    //let existingTransaction;
    //try {
    //  existingTransaction = await getRecord(TABLE_PAYMENT ?? '', {
    //    id
    //  });
    //
    //  console.log('existingTransaction: ', existingTransaction);
    //} catch (err) {
    //  console.log('ERROR get existing transaction: ', err);
    //}

    // updatedAt is later than existingTransaction.updatedAt

    //if (isUpdatedDateNewerThanExisting(updatedAt, existingTransaction?.updatedAt)) {
    //  //
    //
    //  try {
    //    const paymentParams = {
    //      updatedAt
    //    };
    //    console.log('paymentParams: ', paymentParams);
    //
    //    await updateRecord(TABLE_PAYMENT ?? '', { id }, paymentParams);
    //  } catch (err: any) {
    //    console.log('ERROR update payment record', err);
    //    throw new Error(err.message);
    //  }
    //
    //  // create transaction record if successful
    //  if (transaction?.state === 'successful') {
    //    const transactionParams = {
    //      id: transaction?.id,
    //    }
    //
    //    try {
    //      await createRecord(TABLE_TRANSACTION ?? '', transactionParams);
    //    } catch (err) {
    //      console.log('ERROR create transaction record', err);
    //    }
    //  }
    //}

    if (transaction?.type === 'payment') {
      //if (transaction?.type_method === 'credit_card') {
      //}
    }
  }

  // Handle 'disbursements' webhook event
  // Triggers: On creation of any disbursement.
  else if ('disbursements' in payload && payload?.disbursements) {
    console.log('DISBURSEMENTS event: ', payload);

    // Checking that payout has been created for a seller or platform disbursement account
  }

  // Handle 'companies' webhook event
  // Triggers: On creation or change of a company.
  else if ('companies' in payload && payload?.companies) {
    console.log('COMPANIES event: ', payload);

    // Checking if a company's details have changed
  }

  // Handle 'virtual_accounts' webhook event
  // Triggers: When the virtual account status changes from pending_activation to active or pending_activation to activation_failed.
  else if ('virtual_accounts' in payload && payload?.virtual_accounts) {
    console.log('VIRTUAL_ACCOUNTS event: ', payload);

    // Checking if a virtual account's status has changed
  }

  // Handle 'pay_ids' webhook event
  // Triggers: When the PayID status changes from pending_activation to active or pending_activation to activation_failed.
  else if ('pay_ids' in payload && payload?.pay_ids) {
    console.log('PAY_IDS event: ', payload);

    //Checking if PayID status has changed
  }

  // Handle 'payto_agreements' webhook event
  // Triggers: Triggered whenever the agreement status changes.
  // Examples: This notification is triggered whenever the agreement status changes. Example - When the payer approves/rejects the agreement via their banking portal, Zai would notify you about the same.
  else if ('payto_agreements' in payload && payload?.payto_agreements) {
    console.log('PAYTO_AGREEMENTS event: ', payload);
  }

  // Handle 'payto_payments' webhook event
  // Triggers: Triggered whenever the payment initiation request status changes.
  // Examples: This notification is triggered whenever the payment initiation request status changes. Example - when the payment initiation requested has been cleared and settled with the payer bank
  else if ('payto_payments' in payload && payload?.payto_payments) {
    console.log('PAYTO_PAYMENTS event: ', payload);
  }

  // Handle 'transaction_failure_advice' webhook event
  // Triggers: Triggered whenever funds have been debited from the payer's bank account, however, failed to be matched with the payer's digital wallet in Zai.
  // Examples: This notification is triggered whenever reconciliation of funds (received via PayTo) fails on user's wallet.
  else if (
    'transaction_failure_advice' in payload &&
    payload?.transaction_failure_advice
  ) {
    console.log('TRANSACTION_FAILURE_ADVICE event: ', payload);

    // when the user is in held status in Zai due to any reason
  }
  // unhandled webhook event
  else {
    console.log('UNHANDLED WEBHOOK EVENT: ', payload);
  }
};
