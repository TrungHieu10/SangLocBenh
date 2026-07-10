using System.Threading.Tasks;

namespace MedicalAI.Core.Interfaces
{
    public interface ISignalRNotificationService
    {
        Task SendNotificationToUserAsync(string userId, object notification);
        Task SendNotificationToRoleAsync(string role, object notification);
    }
}
