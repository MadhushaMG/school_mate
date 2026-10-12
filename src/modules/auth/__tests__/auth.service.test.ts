import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../auth.service';

describe('AuthService Unit Tests', () => {
  describe('login()', () => {
    it('authenticates Driver with phone number and valid password', async () => {
      const result = await AuthService.login({
        identifier: '0771234567',
        password: 'password123',
      });
      assert.ok(result.token, 'Token should be returned');
      assert.equal(result.user.role, 'DRIVER');
      assert.equal(result.user.fullName, 'Nimal Fernando');
      assert.ok(result.user.driverProfileId, 'Driver profile ID should be present');
    });

    it('authenticates Driver with email and valid password', async () => {
      const result = await AuthService.login({
        identifier: 'nimal.driver@schoolmate.lk',
        password: 'password123',
      });
      assert.ok(result.token);
      assert.equal(result.user.role, 'DRIVER');
    });

    it('authenticates Parent with phone number and valid password', async () => {
      const result = await AuthService.login({
        identifier: '0774456677',
        password: 'password123',
      });
      assert.ok(result.token);
      assert.equal(result.user.role, 'PARENT');
      assert.equal(result.user.fullName, 'Saman Perera');
    });

    it('rejects invalid password', async () => {
      await assert.rejects(
        async () => {
          await AuthService.login({
            identifier: '0771234567',
            password: 'wrong_password',
          });
        },
        /Invalid phone number\/email or password/
      );
    });

    it('rejects unregistered identifier', async () => {
      await assert.rejects(
        async () => {
          await AuthService.login({
            identifier: '0779999999',
            password: 'password123',
          });
        },
        /Invalid phone number\/email or password/
      );
    });
  });

  describe('register()', () => {
    it('registers a new parent user and returns valid token', async () => {
      const testPhone = `078${Math.floor(1000000 + Math.random() * 9000000)}`;
      const result = await AuthService.register({
        fullName: 'Test Parent User',
        phoneNumber: testPhone,
        email: `parent_${Date.now()}@test.lk`,
        password: 'securepassword123',
        role: 'PARENT',
      });
      assert.ok(result.token);
      assert.equal(result.user.fullName, 'Test Parent User');
      assert.equal(result.user.role, 'PARENT');
    });

    it('rejects registration with already registered phone number', async () => {
      await assert.rejects(
        async () => {
          await AuthService.register({
            fullName: 'Duplicate Parent',
            phoneNumber: '0771234567',
            password: 'password123',
            role: 'PARENT',
          });
        },
        /already exists/
      );
    });
  });

  describe('getProfile() and updateProfile()', () => {
    it('retrieves user profile by ID', async () => {
      const profile = await AuthService.getProfile('user-parent-1');
      assert.equal(profile.id, 'user-parent-1');
      assert.equal(profile.fullName, 'Saman Perera');
      assert.equal(profile.role, 'PARENT');
    });

    it('updates user profile information', async () => {
      const updated = await AuthService.updateProfile('user-parent-1', {
        homeAddress: 'Updated Address, Maharagama',
      });
      assert.equal(updated.homeAddress, 'Updated Address, Maharagama');
    });
  });
});
