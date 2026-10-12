import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ChildService } from '../child.service';

describe('ChildService Unit Tests', () => {
  it('creates a new child for parent', async () => {
    const child = await ChildService.createChild('user-parent-1', {
      fullName: 'Test Child A',
      schoolName: 'Royal College',
      grade: 'Grade 3-C',
      pickupAddress: 'Flower Road, Colombo 07',
      pickupLat: 6.905,
      pickupLng: 79.865,
    });
    assert.ok(child.id);
    assert.equal(child.fullName, 'Test Child A');
    assert.equal(child.parentId, 'user-parent-1');
  });

  it('lists children for a parent with enrollments', async () => {
    const children = await ChildService.getParentChildren('user-parent-1');
    assert.ok(Array.isArray(children));
    assert.ok(children.length >= 2, 'Should have at least seeded children');
    const kasun = children.find((c) => c.fullName.includes('Kasun'));
    assert.ok(kasun);
    assert.ok(Array.isArray(kasun.enrollments));
  });

  it('retrieves child by id', async () => {
    const child = await ChildService.getChildById('user-parent-1', 'child-1');
    assert.equal(child.id, 'child-1');
    assert.equal(child.fullName, 'Kasun Perera');
  });

  it('throws error when child does not belong to parent', async () => {
    await assert.rejects(
      async () => {
        await ChildService.getChildById('unknown-parent', 'child-1');
      },
      /Child not found or access denied/
    );
  });
});
