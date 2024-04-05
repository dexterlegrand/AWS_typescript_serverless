import { Context, DynamoDBUpdateItemRequest, util } from '@aws-appsync/utils';
import { dynamodbUpdateRequest } from '../helpers/dynamodb';

const validatePaymentStatus = (
  newPaymentStatus: string,
  existingPaymentStatus: string
) => {
  // PAYMENT_PENDING
  if (
    newPaymentStatus === 'MARKED_AS_PAID' &&
    existingPaymentStatus !== 'PENDING_PAYMENT'
  ) {
    util.error('INVALID_PAYMENT_STATUS');
  }

  if (
    newPaymentStatus === 'PENDING_PAYMENT' &&
    existingPaymentStatus !== 'MARKED_AS_PAID'
  ) {
    util.error('INVALID_PAYMENT_STATUS');
  }
};

export function request(ctx: Context): DynamoDBUpdateItemRequest {
  console.log('Mutation.updateTask2.ts request: ', ctx);
  const {
    input: { id, entityId, ...values },
  } = ctx.args;

  const key = { id, entityId };
  const { existingTask } = ctx.stash;

  if (!existingTask) {
    util.error('TASK_NOT_FOUND');
  }

  validatePaymentStatus(values.paymentStatus, existingTask.paymentStatus);

  const data = {
    ...values,
    updatedAt: util.time.nowISO8601(),
  };

  const condition = {
    id: { attributeExists: true },
    entityId: { attributeExists: true },
  };

  return dynamodbUpdateRequest({ key, data, condition });
}

export function response(ctx: Context) {
  console.log('Mutation.updateTask2.ts response: ', ctx);
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return result;
}
