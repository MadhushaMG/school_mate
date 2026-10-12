import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VehicleService } from '../vehicle.service';

describe('VehicleService Unit Tests', () => {
  it('retrieves vehicles registered to driver', async () => {
    const vehicles = await VehicleService.getDriverVehicles('user-driver-1');
    assert.ok(Array.isArray(vehicles));
    assert.ok(vehicles.length >= 1);
    const primary = vehicles[0];
    assert.equal(primary.vehicleNumber, 'WP NB-4821');
    assert.ok(primary.routes && primary.routes.length > 0);
  });

  it('creates a new vehicle for driver with route', async () => {
    const uniquePlate = `WP TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = await VehicleService.createVehicle('user-driver-1', {
      vehicleNumber: uniquePlate,
      model: 'Toyota Coaster Luxury',
      vehicleType: 'BUS',
      totalSeats: 30,
      hasAC: true,
      route: {
        title: 'Kottawa to Bambalapitiya',
        startTown: 'Kottawa',
        endTown: 'Bambalapitiya',
        schoolsCovered: ['St. Peters College', 'Holy Family Convent'],
        morningStartTime: '06:15 AM',
        afternoonReturnTime: '02:00 PM',
        minMonthlyFee: 8500,
        maxMonthlyFee: 11000,
      },
    });

    assert.ok(created.id);
    assert.equal(created.vehicleNumber, uniquePlate);
    assert.equal(created.availableSeats, 30);
  });

  it('adds a new route to an existing vehicle', async () => {
    const route = await VehicleService.addRoute('user-driver-1', {
      vehicleId: 'veh-1',
      title: 'Afternoon Extra Route',
      startTown: 'Colombo 07',
      endTown: 'Maharagama',
      schoolsCovered: ['Ananda College', 'Nalanda College'],
      morningStartTime: '01:30 PM',
      afternoonReturnTime: '03:30 PM',
      minMonthlyFee: 4000,
      maxMonthlyFee: 6000,
    });

    assert.ok(route.id);
    assert.equal(route.vehicleId, 'veh-1');
  });
});
