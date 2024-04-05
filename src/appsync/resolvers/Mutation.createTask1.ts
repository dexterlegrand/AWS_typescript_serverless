import {
  AppSyncIdentityCognito,
  Context,
  DynamoDBPutItemRequest,
  util,
} from '@aws-appsync/utils';
import {
  CreateTaskInput,
  PaymentFrequency,
  PaymentType,
  TaskDirection,
  TaskStatus,
  TaskType,
} from '../API';
import { dynamodbPutRequest } from '../helpers/dynamodb';

//TODO: finish and refactor validation for create task

export function request(ctx: Context): DynamoDBPutItemRequest {
  console.log('create task1 ctx: ', ctx);
  const { sub } = ctx.identity as AppSyncIdentityCognito;
  const { input } = ctx.arguments;
  const {
    amount,
    direction,
    fromId,
    toId,
    paymentTypes,
    paymentFrequency,
    type,
    reference,
    documents,
  } = input as CreateTaskInput;
  const entityUser = ctx?.prev?.result;

  // ensure fromId and toId are unique
  if (toId === fromId) {
    util.error('TASK_TO_FROM_SAME');
  }

  // payable validation
  if (type === TaskType.SIGN_PAY || type === TaskType.PAY_ONLY) {
    if (!amount || amount <= 0) {
      util.error('TASK_AMOUNT_INVALID');
    }
  }

  //signable validation
  if (type === TaskType.SIGN_PAY || type === TaskType.SIGN_ONLY) {
    if (!documents || documents.length === 0) {
      util.error('TASK_DOCUMENTS_REQUIRED');
    }
  }

  // if payment type includes INSTALLMENTS but is not once off
  if (
    (type === TaskType.SIGN_PAY || type === TaskType.PAY_ONLY) &&
    paymentTypes?.includes(PaymentType.INSTALLMENTS) &&
    paymentFrequency !== PaymentFrequency.ONCE
  ) {
    util.error('INSTALLMENTS_ONLY_WITH_ONCE_OFF');
  }

  if (
    (type === TaskType.SIGN_PAY || type === TaskType.PAY_ONLY) &&
    !paymentTypes?.includes(PaymentType.PAY_NOW)
  ) {
    util.error('PAY_NOW_REQUIRED');
  }

  const id = util.autoId();
  const key = { id, entityId: entityUser.entityId };
  const signatureStatus =
    type === 'SIGN_PAY' || type === 'SIGN_ONLY'
      ? 'PENDING_SIGNATURE'
      : 'NOT_SIGNABLE';
  const paymentStatus =
    type === 'SIGN_PAY' || type === 'PAY_ONLY'
      ? 'PENDING_PAYMENT'
      : 'NOT_PAYABLE';
  const createdAt = util.time.nowISO8601();

  const data = {
    ...input,
    id,
    entityId: entityUser.entityId,
    entityIdBy: entityUser.entityId, //TODO? what if created by accountant
    status: TaskStatus.INCOMPLETE,
    signatureStatus,
    paymentStatus,
    createdBy: sub,
    createdAt,
    updatedAt: createdAt,
  };

  // search name
  if (reference) {
    data.searchName = reference.toLowerCase();
  }

  if (direction === TaskDirection.RECEIVING && toId) {
    data.toSearchStatus = `${toId}#INCOMPLETE`;
    data.contactId = fromId;
  }

  if (direction === TaskDirection.SENDING && fromId) {
    data.fromSearchStatus = `${fromId}#INCOMPLETE`;
    data.contactId = toId;
  }

  const condition = { id: { attributeExists: false } };
  return dynamodbPutRequest({ key, data, condition });
}

export function response(ctx: Context) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }

  return ctx.result;
}
