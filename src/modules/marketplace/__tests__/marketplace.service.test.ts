import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MarketplaceService } from '../marketplace.service';

describe('MarketplaceService Unit Tests', () => {
  it('searches vehicles without filters and returns listings', async () => {
    const results = await MarketplaceService.searchVehicles({});
    assert.ok(Array.isArray(results));
    assert.ok(results.length >= 3);
  });

  it('searches vehicles with available seats only', async () => {
    const results = await MarketplaceService.searchVehicles({ onlyWithSeats: true });
    assert.ok(results.every((v: any) => v.availableSeats > 0));
  });

  it('allows parent to request vehicle enrollment for child', async () => {
    const result = await MarketplaceService.requestEnrollment('user-parent-1', {
      childId: 'child-1',
      vehicleId: 'veh-2',
      parentNotes: 'Requesting seat on Route 2',
    });
    assert.ok(result.id);
    assert.equal(result.status, 'PENDING');
  });

  it('retrieves driver pending enrollment requests', async () => {
    const requests = await MarketplaceService.getDriverRequests('user-driver-1');
    assert.ok(Array.isArray(requests));
  });

  it('filters vehicles by school in search', async () => {
    const results = await MarketplaceService.searchVehicles({ school: 'Ananda College' });
    assert.ok(results.length > 0);
    assert.ok(results.every((v: any) => v.routes.some((r: any) => r.schoolsCovered.includes('Ananda College'))));
  });

  it('filters vehicles by town in search', async () => {
    const results = await MarketplaceService.searchVehicles({ town: 'Maharagama' });
    assert.ok(results.length > 0);
    assert.ok(results.every((v: any) => v.routes.some((r: any) => r.startTown.includes('Maharagama') || r.endTown.includes('Maharagama'))));
  });
});
