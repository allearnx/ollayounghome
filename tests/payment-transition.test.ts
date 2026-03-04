import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransitionPaymentStatus, mapTossToPaymentStatus, summarizeCancels } from '@/lib/paymentTransition.server';

test('mapTossToPaymentStatus maps major statuses', () => {
  assert.equal(mapTossToPaymentStatus('DONE'), 'paid');
  assert.equal(mapTossToPaymentStatus('CANCELED'), 'cancelled');
  assert.equal(mapTossToPaymentStatus('EXPIRED'), 'failed');
  assert.equal(mapTossToPaymentStatus('PENDING'), 'pending');
});

test('canTransitionPaymentStatus guards terminal state and regressions', () => {
  assert.equal(canTransitionPaymentStatus('pending', 'paid'), true);
  assert.equal(canTransitionPaymentStatus('paid', 'pending'), false);
  assert.equal(canTransitionPaymentStatus('cancelled', 'paid'), false);
  assert.equal(canTransitionPaymentStatus('failed', 'pending'), false);
});

test('summarizeCancels returns total and latest row', () => {
  const payload = [{ cancelAmount: 1000 }, { cancelAmount: 2000, canceledAt: '2026-01-01T00:00:00Z' }];
  const result = summarizeCancels(payload);
  assert.equal(result.totalCancelledAmount, 3000);
  assert.equal(result.latestCancel?.canceledAt, '2026-01-01T00:00:00Z');
});
