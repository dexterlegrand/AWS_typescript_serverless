import { DateTime } from 'luxon';

export const isFutureDate = (date: string) => {
  return (
    DateTime.fromFormat(date, 'yyyy-MM-dd')
      .setZone('Australia/Sydney')
      .startOf('day') >
    DateTime.now().setZone('Australia/Sydney').startOf('day')
  );
};

export const isPastDate = (date: string) => {
  return (
    DateTime.fromFormat(date, 'yyyy-MM-dd')
      .setZone('Australia/Sydney')
      .startOf('day') <
    DateTime.now().setZone('Australia/Sydney').startOf('day')
  );
};
