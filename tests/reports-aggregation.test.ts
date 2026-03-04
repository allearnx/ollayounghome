import test from 'node:test';
import assert from 'node:assert/strict';
import { lastNMonthsKeys, monthKeyFromKst, monthRangeKst, finalizeMonthBucket } from '@/lib/reportsAggregation';

test('monthKeyFromKst normalizes to YYYY-MM', () => {
  assert.equal(monthKeyFromKst('2026-02-10T12:00:00+09:00'), '2026-02');
});

test('monthRangeKst returns deterministic month window', () => {
  const range = monthRangeKst('2026-02');
  assert.equal(range.startIso, '2026-01-31T15:00:00.000Z');
  assert.equal(range.endIso, '2026-02-28T15:00:00.000Z');
});

test('lastNMonthsKeys returns chronological list', () => {
  const keys = lastNMonthsKeys(3);
  assert.equal(keys.length, 3);
  assert.ok(keys[0] <= keys[1] && keys[1] <= keys[2]);
});

test('finalizeMonthBucket computes net and profit', () => {
  const bucket = finalizeMonthBucket({
    month: '2026-02',
    gross: 200,
    refunds: 40,
    net: 0,
    expenses: 50,
    profit: 0,
    paidCount: 2,
    cancelledCount: 1,
  });
  assert.equal(bucket.net, 160);
  assert.equal(bucket.profit, 110);
});
