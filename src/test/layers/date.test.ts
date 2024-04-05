import { DateTime } from 'luxon';
import {
  isFutureDate,
  isPastDate,
} from '../../layers/dependencyLayer/opt/dates';
import { describe, expect, it } from 'vitest';

describe('Date functions', () => {
  const pastDate = '2023-12-31';
  const presentDate = DateTime.now()
    .setZone('Australia/Sydney')
    .toFormat('yyyy-MM-dd');
  const futureDate = '2125-01-01';

  it('isFutureDate should return true for future dates', () => {
    expect(isFutureDate(futureDate)).toBe(true);
  });

  it('isFutureDate should return false for present and past dates', () => {
    expect(isFutureDate(presentDate)).toBe(false);
    expect(isFutureDate(pastDate)).toBe(false);
  });

  it('isPastDate should return true for past dates', () => {
    expect(isPastDate(pastDate)).toBe(true);
  });

  it('isPastDate should return false for present and future dates', () => {
    expect(isPastDate(presentDate)).toBe(false);
    expect(isPastDate(futureDate)).toBe(false);
  });
});
