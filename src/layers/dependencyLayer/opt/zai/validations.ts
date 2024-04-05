import {
  BillsPaymentInput,
  EntityUser,
  PaymentMethod,
  Task,
  TaskPaymentStatus,
} from '/opt/API';
import { isPastDate } from '/opt/dates';

export const validatePaymentMethod = (paymentMethod: PaymentMethod | null) => {
  if (!paymentMethod) {
    throw new Error('INVALID_PAYMENT_METHOD'); // payment method doesn't exist
  }

  return paymentMethod;
};

export const validateFeeId = (feeId: string | undefined) => {
  if (!feeId) {
    throw new Error('ERROR_GETTING_ZAI_FEE');
  }
};

export const validateScheduled = ({
  scheduledAt,
}: {
  scheduledAt?: string | null;
}) => {
  if (!scheduledAt) {
    throw new Error('SCHEDULED_AT_REQUIRED');
  }

  // if scheduled at in the past
  if (new Date(scheduledAt) < new Date()) {
    throw new Error('SCHEDULED_AT_IN_PAST');
  }
};

export const validateInstallments = ({
  installments,
  scheduledAt,
}: {
  installments?: number | null;
  scheduledAt?: string | null;
}) => {
  if (!installments) {
    throw new Error('INSTALLMENTS_REQUIRED');
  }

  if (installments < 2 || installments > 12) {
    throw new Error('INVALID_INSTALLMENTS');
  }

  if (!scheduledAt) {
    throw new Error('SCHEDULED_AT_REQUIRED');
  }

  // if scheduled at in the past
  if (isPastDate(scheduledAt)) {
    throw new Error('SCHEDULED_AT_IN_PAST');
  }
};

export const validateEntityUser = (entityUser: EntityUser) => {
  if (!entityUser) {
    throw new Error('UNAUTHORISED_ENTITY');
  }
};

export const validateBills = (
  bills: Task[],
  billPayments: BillsPaymentInput[],
  entityId: string
) => {
  if (!bills) {
    throw new Error('ERROR_GETTING_BILLS');
  }

  if (bills.length === 0) {
    throw new Error('BILLS_REQUIRED');
  }

  if (billPayments?.length !== bills.length) {
    throw new Error('ONE_OR_MORE_BILLS_INVALID');
  }

  const isEntitysBills = !bills.some((bill) => bill.entityId !== entityId);
  if (!isEntitysBills) {
    throw new Error('INVALID_ENTITY_BILLS');
  }

  const isPayable = !bills.some(
    (bill) => bill.paymentStatus !== TaskPaymentStatus.PENDING_PAYMENT
  );

  if (!isPayable) {
    throw new Error('BILLS_NOT_PAYABLE');
  }
};
