import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceMeters,
  isWithinGeofence,
  isWithinProximityAlert,
} from '../geofence.js';

describe('Geofence & Distance Utilities Tests', () => {
  // Maharagama coordinates
  const maharagama = { latitude: 6.8485, longitude: 79.9268 };
  // Nugegoda coordinates (~4.5 km away)
  const nugegoda = { latitude: 6.8649, longitude: 79.8997 };
  // A point 30 meters away from Maharagama gate
  const gateNear = { latitude: 6.8487, longitude: 79.9269 };
  // A point 800 meters away from Maharagama gate
  const gate800m = { latitude: 6.8520, longitude: 79.9320 };

  describe('calculateDistanceMeters()', () => {
    it('returns 0 for identical coordinates', () => {
      const distance = calculateDistanceMeters(maharagama, maharagama);
      assert.equal(Math.round(distance), 0);
    });

    it('calculates short distance correctly within meters', () => {
      const distance = calculateDistanceMeters(maharagama, gateNear);
      // Expected around 20-35 meters
      assert.ok(distance > 15 && distance < 40, `Distance was ${distance}`);
    });

    it('calculates kilometer scale distance between towns correctly', () => {
      const distance = calculateDistanceMeters(maharagama, nugegoda);
      // Expected around 3.5 - 4.5 km (3500 - 4500m)
      assert.ok(distance > 3000 && distance < 5000, `Distance was ${distance}`);
    });
  });

  describe('isWithinGeofence()', () => {
    it('returns true when vehicle is within 40m radius', () => {
      assert.equal(isWithinGeofence(gateNear, maharagama, 40), true);
    });

    it('returns false when vehicle is outside radius', () => {
      assert.equal(isWithinGeofence(gate800m, maharagama, 40), false);
      assert.equal(isWithinGeofence(nugegoda, maharagama, 40), false);
    });
  });

  describe('isWithinProximityAlert()', () => {
    it('returns true when vehicle is within proximity alert threshold (1000m)', () => {
      assert.equal(isWithinProximityAlert(gate800m, maharagama, 1000), true);
      assert.equal(isWithinProximityAlert(gateNear, maharagama, 1000), true);
    });

    it('returns false when vehicle is beyond proximity threshold', () => {
      assert.equal(isWithinProximityAlert(nugegoda, maharagama, 1000), false);
    });
  });
});
