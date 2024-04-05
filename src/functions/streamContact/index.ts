const { ENV, REGION, TABLE_CONTACT } = process.env;
const isProd = ENV === 'prod';
import { updateRecord } from '/opt/dynamoDB';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  createZaiUser,
  getZaiUserWallet,
  isAuthTokenExpired,
} from '/opt/zai';
import { getWalletAccountNppDetails } from '/opt/zai/walletAccounts';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBStreamHandler } from 'aws-lambda';

const secretManager = new SecretsManagerClient({ region: REGION });

let zaiAuthToken: CreateZaiAuthTokenResponse;
let zaiClientSecret: string;

//TODO: types in this file
//TODO: contact type with hidden backend / zai fields

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

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await initZai();

  // create zai user

  for (let i = 0; i < event.Records.length; i++) {
    const data = event.Records[i];

    // record created
    if (data.eventName === 'INSERT' && data?.dynamodb?.NewImage) {
      const contact = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );

      console.log('contact: ', contact);

      // ZAI - create zai user
      if (
        !contact.zaiUserId &&
        contact.firstName &&
        contact.lastName &&
        contact.email
      ) {
        let zaiUser;

        const sanitisedEmail = contact.email.replace(/\+.+@/, '@');
        const [username, domain] = sanitisedEmail.split('@');
        const zaiEmail = `${username}+${contact.id}@${domain}`; // make unique email address for Zai (as email for users must be unique)
        try {
          const zaiUserData = {
            id: contact.id,
            first_name: contact.firstName,
            last_name: contact.lastName,
            email: zaiEmail,
            //mobile: contact.phone, //TODO: what to do here? Mobile is unique in Zai
            country: 'AUS',
            //ip_address: contact.ipAddress,
          };
          console.log('zaiUserData: ', zaiUserData);
          const response = await createZaiUser(
            zaiAuthToken?.access_token,
            zaiUserData
          );
          console.log('Zai user response: ', response);
          zaiUser = response.users;
        } catch (err) {
          console.log('ERROR create zai user: ', err);
        }

        // update user record with new zai user id
        if (zaiUser?.id) {
          let zaiUserWallet;
          try {
            zaiUserWallet = await getZaiUserWallet(
              zaiAuthToken?.access_token,
              zaiUser.id
            );
            console.log('zaiUserWallet: ', zaiUserWallet);
          } catch (err: any) {
            console.log('ERROR get zai user wallet: ', err);
          }

          let walletAccountNppDetails;
          try {
            walletAccountNppDetails = await getWalletAccountNppDetails(
              zaiAuthToken?.access_token,
              zaiUserWallet?.wallet_accounts?.id ?? ''
            );
            console.log('walletAccountNppDetails: ', walletAccountNppDetails);
          } catch (err: any) {
            console.log('ERROR get wallet account npp details: ', err);
          }

          //TODO: also store payId?
          try {
            await updateRecord(
              TABLE_CONTACT ?? '',
              {
                id: contact.id,
              },
              {
                zaiUserId: zaiUser.id,
                zaiUserWalletId: zaiUserWallet?.wallet_accounts?.id ?? null,
                zaiNppCrn:
                  walletAccountNppDetails?.wallet_accounts?.npp_details
                    ?.reference ?? null,
              }
            );
          } catch (err: any) {
            console.log('ERROR get user: ', err);
          }
        }
      }
    }
  }
};
