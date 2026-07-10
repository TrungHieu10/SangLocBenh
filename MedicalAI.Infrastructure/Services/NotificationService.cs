using MedicalAI.Core.Entities;
using MedicalAI.Core.Interfaces;
using MedicalAI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalAI.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ISignalRNotificationService _signalRService;

        public NotificationService(ApplicationDbContext context, ISignalRNotificationService signalRService)
        {
            _context = context;
            _signalRService = signalRService;
        }

        public async Task CreateNotificationAsync(string userId, string title, string message, long? relatedCheckupId = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                RelatedCheckupId = relatedCheckupId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            await _signalRService.SendNotificationToUserAsync(userId, notification);
        }

        public async Task CreateNotificationForRoleAsync(string role, string title, string message, long? relatedCheckupId = null)
        {
            var users = await _context.Users.Where(u => u.Role == role).ToListAsync();
            var notifications = users.Select(u => new Notification
            {
                UserId = u.Id,
                Title = title,
                Message = message,
                RelatedCheckupId = relatedCheckupId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            }).ToList();

            if (notifications.Any())
            {
                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();

                // Dùng thông báo đầu tiên làm mẫu để bắn broadcast
                var sample = notifications.First();
                await _signalRService.SendNotificationToRoleAsync(role, new {
                    title = sample.Title,
                    message = sample.Message,
                    relatedCheckupId = sample.RelatedCheckupId,
                    createdAt = sample.CreatedAt,
                    isRead = false
                });
            }
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(string userId, int limit = 20)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task MarkAsReadAsync(long notificationId, string userId)
        {
            var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
            if (notif != null && !notif.IsRead)
            {
                notif.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(string userId)
        {
            var unread = await _context.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
            if (unread.Any())
            {
                foreach (var item in unread)
                {
                    item.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }
        }
    }
}
