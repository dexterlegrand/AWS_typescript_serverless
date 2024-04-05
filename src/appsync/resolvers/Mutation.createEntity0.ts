import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBPutItemRequest,
  util,
} from '@aws-appsync/utils';
import { dynamodbPutRequest } from '../helpers/dynamodb';
import { generateEntityEmail } from '../helpers/ocr';

// creates the entity
export function request(ctx: Context): DynamoDBPutItemRequest {
  console.log('CreateEntity0 ctx request: ', ctx);
  const {
    sub,
    claims: { phone_number },
  } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;

  const key = { id: util.autoId() };
  const createdAt = util.time.nowISO8601();
  const ocrEmail = generateEntityEmail(input.name ?? '');
  console.log('ocrEmail: ', ocrEmail);
  const data = {
    ...input,
    owner: sub,
    paymentMethodId: null,
    searchName: input.name.toLowerCase() ?? '',
    phone: phone_number, //TODO: should be contact number of the user / contact?
    // email?
    createdAt,
    updatedAt: createdAt,
  };

  if (ocrEmail) {
    data.ocrEmail = ocrEmail;
  }

  const condition = { id: { attributeExists: false } };
  return dynamodbPutRequest({ key, data, condition });
}

export function response(ctx: Context) {
  console.log('CreateEntity0 ctx response: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
