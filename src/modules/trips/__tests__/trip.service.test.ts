import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TripService } from '../trip.service';

describe('TripService Unit Tests', () => {
  it('retrieves active trip for child', async () => {
    const activeTrip = await TripService.getActiveTripForChild('user-parent-1', 'child-1');
    assert.ok(activeTrip, 'Active trip should exist for Kasun');
    assert.equal(activeTrip?.status, 'IN_PROGRESS');
  });

  it('retrieves active trip for vehicle', async () => {
    const activeTrip = await TripService.getActiveTripForVehicle('user-driver-1', 'veh-1');
    assert.ok(activeTrip);
    assert.equal(activeTrip?.vehicleId, 'veh-1');
  });

  it('updates parent attendance intent', async () => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const attendance = await TripService.setParentAttendance('user-parent-1', {
      childId: 'child-1',
      tripType: 'MORNING_PICKUP',
      date,
      status: 'NOT_COMING',
      parentNotes: 'Doctor appointment today',
    });
    assert.ok(attendance.id);
    assert.equal(attendance.status, 'NOT_COMING');
  });

  it('driver updates child boarding status', async () => {
    const updated = await TripService.updateBoardingStatus('user-driver-1', {
      attendanceId: 'att-1',
      boardingStatus: 'DROPPED',
    });
    assert.ok(updated.id);
    assert.equal(updated.boardingStatus, 'DROPPED');
  });

  it('completes trip successfully', async () => {
    const completed = await TripService.completeTrip('user-driver-1', 'trip-1');
    assert.ok(completed);
    assert.equal(completed.status, 'COMPLETED');
  });

  it('sets boardingStatus to SKIPPED when child attendance is created with NOT_COMING', async () => {
    const attendance = await TripService.setParentAttendance('user-parent-1', {
      childId: 'child-1',
      tripType: 'AFTERNOON_DROP',
      date: '2026-10-20',
      status: 'NOT_COMING',
      parentNotes: 'Doctor appointment',
    });
    assert.equal(attendance.status, 'NOT_COMING');
    assert.equal(attendance.boardingStatus, 'SKIPPED');
  });

  it('updates existing attendance without creating duplicate records on repeated calls', async () => {
    const first = await TripService.setParentAttendance('user-parent-1', {
      childId: 'child-1',
      tripType: 'AFTERNOON_DROP',
      date: '2026-10-21',
      status: 'NOT_COMING',
    });
    const second = await TripService.setParentAttendance('user-parent-1', {
      childId: 'child-1',
      tripType: 'AFTERNOON_DROP',
      date: '2026-10-21',
      status: 'COMING',
    });
    assert.equal(first.id, second.id);
    assert.equal(second.status, 'COMING');
    assert.equal(second.boardingStatus, 'PENDING');
  });
});
