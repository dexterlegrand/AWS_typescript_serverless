const {
  ENV,
  REGION,
  TABLE_AUTOCOMPLETE_RESULT,
  TABLE_BENEFICIAL_OWNER,
  TABLE_ENTITY,
} = process.env;
const isProd = ENV === 'prod';

import { abrLookupByAbn } from '/opt/abr';
import {
  BeneficialOwner,
  BeneficialOwnerVerificationStatus,
  EntityType,
} from '/opt/API';
import { createRecord, updateRecord } from '/opt/dynamoDB';
import { FrankieOneEntityTypeMap, initApi } from '/opt/frankieone';
import {
  EntityObject,
  EnumAddressType,
  EnumEntityType,
  EnumKVPType,
} from '/opt/frankieone/frankieone.types';
import {
  createZaiAuthToken,
  CreateZaiAuthTokenResponse,
  createZaiCompany,
  CreateZaiCompanyRequest,
  isAuthTokenExpired,
  updateZaiCompany,
  UpdateZaiCompanyRequest,
} from '/opt/zai';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { DynamoDBStreamHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';

const secretManager = new SecretsManagerClient({ region: REGION });

let zaiAuthToken: CreateZaiAuthTokenResponse;
let zaiClientSecret: string;

//TODO: types in this file

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

  const frankieOne = initApi();

  for (let i = 0; i < event.Records.length; i++) {
    const data = event.Records[i];

    // record created
    if (data.eventName === 'INSERT' && data?.dynamodb?.NewImage) {
      const entity = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );

      //if (entity.taxNumber && (entity.type === EntityType.INDIVIDUAL || entity.type === EntityType.SOLE_TRADER)) {
      if (
        entity.type === EntityType.INDIVIDUAL ||
        entity.type === EntityType.SOLE_TRADER
      ) {
        // create frankieone entity for KYC verification
        const frankieOneEntityParams = {
          entityType: EnumEntityType.INDIVIDUAL,
          displayName: entity.name, // TODO: required?
          givenName: entity.firstName,
          familyName: entity.lastName,
        };

        let createFrankieOneEntity;
        try {
          console.log('frankieOneEntityParams: ', frankieOneEntityParams);
          createFrankieOneEntity = await frankieOne.entity.createEntity(
            frankieOneEntityParams
          );
          console.log('createFrankieOneEntity: ', createFrankieOneEntity);
        } catch (err: any) {
          console.log('ERROR createFrankieOneEntity: ', JSON.stringify(err));
        }

        // create beneficial owner for individual / sole trader
        if (createFrankieOneEntity?.data.entity.entityId) {
          const beneficialOwner: Partial<BeneficialOwner> = {
            id: randomUUID(),
            entityId: entity.id,
            firstName: entity.firstName,
            lastName: entity.lastName,
            providerEntityId: createFrankieOneEntity.data.entity.entityId,
            verificationStatus: BeneficialOwnerVerificationStatus.UNVERIFIED,
            owner: entity.owner,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          try {
            await createRecord(TABLE_BENEFICIAL_OWNER ?? '', beneficialOwner);
          } catch (err: any) {
            console.log('ERROR createRecord TABLE_BENEFICIAL_OWNER: ', err);
          }
        }
      }

      console.log('Entity: ', entity);

      // entity created just for bpay payouts
      if (entity.type === EntityType.BPAY) {
        try {
          const createdAt = new Date().toISOString();
          await createRecord(TABLE_AUTOCOMPLETE_RESULT ?? '', {
            id: entity.id,
            value: entity.id,
            label: entity.name,
            type: 'ENTITY',
            searchName: entity.name.toLowerCase(),
            createdAt,
            metadata: {},
            updatedAt: createdAt,
          });
        } catch (err) {
          console.log('ERROR createRecord TABLE_AUTOCOMPLETE_RESULT: ', err);
        }
      }

      // get entity details from abr if abn
      else if (entity.type !== EntityType.INDIVIDUAL && entity.taxNumber) {
        // get entity details from abr
        let abrDetails;
        try {
          abrDetails = await abrLookupByAbn(entity.taxNumber);
          console.log('abrDetails: ', abrDetails);
        } catch (err) {
          console.log('ERROR abrLookupByAbn: ', err);
        }

        console.log('abrDetails: ', abrDetails);

        // create zai company if non-individual and has ABN

        // create zai company
        if (entity.taxNumber) {
          const zaiEntity: CreateZaiCompanyRequest = {
            name: entity.name,
            legal_name: entity.name, //TODO: need to collect legal trading name?
            tax_number: entity.taxNumber,
            //email: entity.email, //TODO: add user email to entity?
            //mobile: entity.mobile, //TODO: add user mobile to entity?
            user_id: entity.owner,
            country: 'AUS',
            //custom_descriptor: //TODO: allow user to add custom descriptor or generate one on behalf?
          };

          if (entity.address) {
            zaiEntity.address_line1 = entity.address.address1;
            //zaiEntity.address_line2 = entity.address.address2;
            zaiEntity.city = entity.address.city;
            zaiEntity.state = entity.address.state;
            zaiEntity.zip = entity.address.postalCode;
            zaiEntity.country = entity.address.country; //TODO: need to collect country code?
          }

          console.log('create zai entity: ', zaiEntity);

          // create zai company
          let zaiCompany;
          try {
            zaiCompany = await createZaiCompany(
              zaiAuthToken?.access_token,
              zaiEntity
            );
            console.log('createZaiCompany: ', zaiCompany);
          } catch (err) {
            console.log('ERROR createZaiCompany: ', err);
          }

          // create frankieone entity for taxnumber business
          //@ts-ignore TODO: resolve type issue
          const entityType = FrankieOneEntityTypeMap[entity.type as EntityType];
          const frankieOneEntityParams: EntityObject = {
            //entityId: entity.id,
            entityType: entityType,
            extraData: [
              {
                kvpKey: 'ABN',
                kvpValue: abrDetails.abn,
                kvpType: EnumKVPType.IdExternal,
              },
            ],
            organisationData: {
              registeredName: entity.name,
            },
          };

          if (abrDetails.acn) {
            frankieOneEntityParams?.extraData?.push({
              kvpKey: 'ACN',
              kvpValue: abrDetails.acn,
              kvpType: EnumKVPType.IdExternal,
            });
          }

          let createFrankieOneEntity;
          try {
            console.log('frankieOneEntityParams: ', frankieOneEntityParams);
            createFrankieOneEntity = await frankieOne.entity.createEntity(
              frankieOneEntityParams
            );
            console.log('createFrankieOneEntity: ', createFrankieOneEntity);
          } catch (err: any) {
            console.log('ERROR createFrankieOneEntity: ', JSON.stringify(err));
          }

          // update entity record if new data created
          if (
            zaiCompany?.companies?.id ||
            createFrankieOneEntity?.data.entity.entityId
          ) {
            let updatedEntityParams = {};

            if (zaiCompany?.companies?.id) {
              updatedEntityParams = {
                zaiCompanyId: zaiCompany?.companies?.id,
              };
            }

            if (createFrankieOneEntity?.data.entity.entityId) {
              updatedEntityParams = {
                frankieOneEntityId: createFrankieOneEntity.data.entity.entityId, //TODO: Entity type / interface that includes these non-frontend properties
              };
            }

            // update entity with frankieOne entity id
            let updatedEntity;
            try {
              updatedEntity = await updateRecord(
                TABLE_ENTITY ?? '',
                { id: entity.id },
                updatedEntityParams
              );

              console.log('Updated entity: ', updatedEntity);
            } catch (err: any) {
              console.log('ERROR updateRecord TABLE_ENTITY: ', err);
            }
          }
        }
      }
    }

    // record updated
    if (
      data.eventName === 'MODIFY' &&
      data?.dynamodb?.NewImage &&
      data?.dynamodb?.OldImage
    ) {
      const newEntity = unmarshall(
        data.dynamodb.NewImage as { [key: string]: AttributeValue }
      );
      const oldEntity = unmarshall(
        data.dynamodb.OldImage as { [key: string]: AttributeValue }
      );
      console.log('newEntity: ', newEntity);
      console.log('oldEntity: ', oldEntity);

      if (newEntity.type === 'BPAY') {
        try {
          const createdAt = new Date().toISOString();
          await createRecord(TABLE_AUTOCOMPLETE_RESULT ?? '', {
            id: newEntity.id,
            value: newEntity.id,
            label: newEntity.name,
            type: 'ENTITY',
            searchName: newEntity.name.toLowerCase(),
            createdAt,
            metadata: {},
            updatedAt: createdAt,
          });
        } catch (err) {
          console.log('ERROR createRecord TABLE_AUTOCOMPLETE_RESULT: ', err);
        }
      }

      //TODO: prevent duplicate requests?
      // update zai company if non-individual and has ABN
      if (newEntity.taxNumber && newEntity.type !== 'INDIVIDUAL') {
        const zaiEntity: UpdateZaiCompanyRequest = {
          name: newEntity.name,
          legal_name: newEntity.name, //TODO: need to collect legal trading name?
          tax_number: newEntity.taxNumber,
          //email: newEntity.email, //TODO: add user email to entity?
          //mobile: newEntity.mobile, //TODO: add user mobile to entity?
          user_id: newEntity.owner,
          country: 'AUS',
          //custom_descriptor: //TODO: allow user to add custom descriptor or generate one on behalf?
        };

        if (newEntity.address) {
          zaiEntity.address_line1 = newEntity.address.address1;
          //zaiEntity.address_line2 = newEntity.address.address2;
          zaiEntity.city = newEntity.address.city;
          zaiEntity.state = newEntity.address.state;
          zaiEntity.zip = newEntity.address.postalCode;
          zaiEntity.country = newEntity.address.country; //TODO: need to collect country code?
        }

        console.log('zaiEntity: ', zaiEntity);

        try {
          const zaiCompany = await updateZaiCompany(
            zaiAuthToken?.access_token,
            newEntity.zaiCompanyId,
            zaiEntity
          );
          console.log('updateZaiCompany: ', zaiCompany);
        } catch (err) {
          console.log('ERROR updateZaiCompany: ', err);
        }

        if (newEntity.address) {
          // update frankieone entity
          const updateFrankieOneEntity: EntityObject = {
            addresses: [
              {
                addressType: EnumAddressType.PLACE_OF_BUSINESS,
                unitNumber: newEntity.address.unitNumber,
                streetNumber: newEntity.address.streetNumber,
                streetName: newEntity.address.address1,
                streetType: newEntity.address.streetType, //TODO: street type from address?
                town: newEntity.address.city,
                suburb: newEntity.address.city,
                state: newEntity.address.state,
                postalCode: newEntity.address.postalCode,
                country: newEntity.address.country,
              },
            ],
          };

          try {
            console.log('updateFrankieOneEntity: ', updateFrankieOneEntity);
            const response = await frankieOne.entity.updateEntity(
              newEntity.frankieOneEntityId,
              updateFrankieOneEntity
            );
            console.log('frankieOne.entity.updateEntity response: ', response);
          } catch (err: any) {
            console.log('ERROR updateFrankieOneEntity: ', err);
          }
        }
      }
    }
  }
};
