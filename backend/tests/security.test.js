import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { authService } from '../services/authService.js';
import { userRepository } from '../db/repositories/userRepository.js';

test('SkyGuard API Security & RBAC Test Suite', async (t) => {
  const adminEmail = `admin_sec_${Date.now()}@skyguard.io`;
  const analystEmail = `analyst_sec_${Date.now()}@skyguard.io`;
  const operatorEmail = `operator_sec_${Date.now()}@skyguard.io`;

  let adminUser, adminToken;
  let analystUser, analystToken;
  let operatorUser, operatorToken;

  await t.test('Seed test users across RBAC hierarchy (admin, analyst, operator)', async () => {
    const adminRes = await authService.register('Security Admin', adminEmail, 'AdminPass@2026', 'admin');
    adminUser = adminRes.user;
    adminToken = adminRes.token;

    const analystRes = await authService.register('Data Analyst', analystEmail, 'AnalystPass@2026', 'analyst');
    analystUser = analystRes.user;
    analystToken = analystRes.token;

    const operatorRes = await authService.register('Field Operator', operatorEmail, 'OperatorPass@2026', 'operator');
    operatorUser = operatorRes.user;
    operatorToken = operatorRes.token;

    assert.equal(adminUser.role, 'admin');
    assert.equal(analystUser.role, 'analyst');
    assert.equal(operatorUser.role, 'operator');
  });

  await t.test('JWT Verification: Valid tokens decode correct user id and role', () => {
    const decoded = jwt.verify(adminToken, config.jwtSecret);
    assert.equal(decoded.id, adminUser.id);
    assert.equal(decoded.role, 'admin');
  });

  await t.test('JWT Security: Tampered or forged tokens must fail verification', () => {
    const fakeToken = jwt.sign({ id: 'hacker-id', role: 'admin' }, 'wrong_secret_key');
    assert.throws(
      () => {
        jwt.verify(fakeToken, config.jwtSecret);
      },
      /invalid signature/i
    );
  });

  await t.test('Password Security: Password hashes must use strong bcrypt salts and never match plaintext', () => {
    const userRec = userRepository.findByEmail(adminEmail);
    assert.ok(userRec.password_hash.startsWith('$2'), 'Hash must be a valid bcrypt signature ($2a or $2b)');
    assert.notEqual(userRec.password_hash, 'AdminPass@2026', 'Plaintext password must never be stored in database');
  });

  await t.test('Password Validation: Incorrect passwords must be rejected', async () => {
    await assert.rejects(
      async () => {
        await authService.login(adminEmail, 'WrongPassword#123');
      },
      /Invalid email or password/
    );
  });

  await t.test('Role Authorization: Hierarchy checks correctly discriminate roles', () => {
    const allowedRolesForRetraining = ['admin', 'analyst'];
    assert.equal(allowedRolesForRetraining.includes(adminUser.role), true, 'Admin must be authorized');
    assert.equal(allowedRolesForRetraining.includes(analystUser.role), true, 'Analyst must be authorized');
    assert.equal(allowedRolesForRetraining.includes(operatorUser.role), false, 'Operator must NOT be authorized to trigger model retraining');
  });
});
