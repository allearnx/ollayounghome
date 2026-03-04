import test from 'node:test';
import assert from 'node:assert/strict';
import { hasRequiredRole } from '@/lib/adminAuth.server';

test('admin satisfies admin and staff requirements', () => {
  assert.equal(hasRequiredRole('admin', 'admin'), true);
  assert.equal(hasRequiredRole('admin', 'staff'), true);
});

test('staff satisfies only staff requirement', () => {
  assert.equal(hasRequiredRole('staff', 'staff'), true);
  assert.equal(hasRequiredRole('staff', 'admin'), false);
});
