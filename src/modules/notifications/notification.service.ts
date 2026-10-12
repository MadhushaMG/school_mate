import { prisma } from '../../config/prisma';

export class NotificationService {
  static listForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  static async markRead(userId: string, notificationId: string) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId, isRead: false },
      data: { isRead: true },
    });

    if (result.count === 0) {
      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId },
        select: { id: true },
      });
      if (!notification) throw new Error('Notification not found.');
    }

    return prisma.notification.findFirstOrThrow({
      where: { id: notificationId, userId },
    });
  }

  static markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}