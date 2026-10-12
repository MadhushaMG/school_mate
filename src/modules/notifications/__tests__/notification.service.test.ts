import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NotificationService } from '../notification.service';

describe('NotificationService Unit Tests', () => {
  it('lists notifications for a user', async () => {
    const list = await NotificationService.listForUser('user-parent-1');
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 1);
  });

  it('marks a single notification as read', async () => {
    const read = await NotificationService.markRead('user-parent-1', 'notif-1');
    assert.ok(read);
    assert.equal(read.isRead, true);
  });

  it('marks all notifications as read for a user', async () => {
    const result = await NotificationService.markAllRead('user-parent-1');
    assert.ok(result);
    assert.ok(typeof result.count === 'number');
  });
});
