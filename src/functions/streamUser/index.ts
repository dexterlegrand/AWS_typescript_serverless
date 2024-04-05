const { ENV, REGION, TABLE_ENTITY, TABLE_ENTITYUSER, TABLE_USER } = process.env;
const isProd = ENV === 'prod';
import { EntityType } from '/opt/API';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  createZaiUser,
  getZaiUserWallet,
  isAuthTokenExpired,
  updateZaiUser,
} from '/opt/zai';
import { getWalletAccountNppDetails } from '/opt/zai/walletAccounts';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { createRecord, updateRecord } from '/opt/dynamoDB';
import { DynamoDBStreamHandler } from 'aws-lambda';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { randomUUID } from 'crypto';
import { generateEntityEmail } from '/opt/entity';

const secretManager = new SecretsManagerClient({ region: REGION });

let zaiAuthToken: CreateZaiAuthTokenResponse;
let zaiClientSecret: string;

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

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: DynamoDBStreamHandler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  await initZai();

  for (let i = 0; i < event.Records.length; i++) {
    const data = event.Records[i];

    // UPDATE RECORD TRIGGERED
    if (
      data.eventName === 'MODIFY' &&
      data?.dynamodb?.NewImage &&
      data?.dynamodb?.OldImage
    ) {
      const newUser = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );
      const oldUser = unmarshall(
        data.dynamodb.OldImage as { [key: string]: AttributeValue }
      );
      console.log('newUser: ', newUser);
      console.log('oldUser: ', oldUser);

      // ENTITY - Create individual entity and entity user records
      if (
        !oldUser.firstName &&
        newUser.firstName &&
        !oldUser.lastName &&
        newUser.lastName
      ) {
        const name = `${newUser.firstName} ${newUser.lastName}`;
        const createdAt = new Date().toISOString();
        const entityData = {
          id: randomUUID(),
          owner: newUser.id,
          ocrEmail: generateEntityEmail(name ?? ''),
          paymentMethodId: null,
          searchName: name.toLowerCase() ?? '',
          phone: newUser.phone,
          type: EntityType.INDIVIDUAL,
          name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          createdAt,
          updatedAt: createdAt,
        };

        const entityUserData = {
          id: randomUUID(),
          owner: newUser.id,
          entityId: entityData.id,
          entitySearchName: entityData.searchName,
          searchName: name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: 'OWNER',
          userId: newUser.id,
          createdBy: newUser.id,
          createdAt,
          updatedAt: createdAt,
        };
        const requests = [
          createRecord(TABLE_ENTITY ?? '', entityData),
          createRecord(TABLE_ENTITYUSER ?? '', entityUserData),
        ];

        try {
          const entityResponses = await Promise.all(requests);
          console.log('Entity responses: ', entityResponses);
        } catch (err) {
          console.log('ERROR create entity: ', err);
        }
      }

      // ZAI - create zai user
      if (
        !newUser.zaiUserId &&
        newUser.firstName &&
        newUser.lastName &&
        newUser.email
      ) {
        let zaiUser;

        const sanitisedEmail = newUser.email.replace(/\+.+@/, '@');
        const [username, domain] = sanitisedEmail.split('@');
        const zaiEmail = `${username}+${newUser.id}@${domain}`; // make unique email address for Zai (as email for users must be unique)
        try {
          const zaiUserData = {
            id: newUser.id,
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            email: zaiEmail,
            //mobile: newUser.phone, //TODO: what to do here? Mobile is unique in Zai
            country: 'AUS',
            ip_address: newUser.ipAddress,
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
              TABLE_USER ?? '',
              {
                id: newUser.id,
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

      // ZAI - update zai user
      else if (
        newUser.firstName !== oldUser.firstName ||
        newUser.lastName !== oldUser.lastName
      ) {
        const zaiUpdateUserParams = {
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          ipAddress: newUser.ipAddress,
        };

        try {
          const zaiUser = await updateZaiUser(
            zaiAuthToken?.access_token,
            newUser.id,
            zaiUpdateUserParams
          );
          console.log('zaiUser: ', zaiUser);
        } catch (err: any) {
          console.log('ERROR get user: ', err);
        }
      }
    }
  }
};
