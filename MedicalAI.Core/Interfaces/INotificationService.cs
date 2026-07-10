using MedicalAI.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MedicalAI.Core.Interfaces
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(string userId, string title, string message, long? relatedCheckupId = null);
        Task CreateNotificationForRoleAsync(string role, string title, string message, long? relatedCheckupId = null);
        Task<List<Notification>> GetUserNotificationsAsync(string userId, int limit = 20);
        Task<int> GetUnreadCountAsync(string userId);
        Task MarkAsReadAsync(long notificationId, string userId);
        Task MarkAllAsReadAsync(string userId);
    }
}
