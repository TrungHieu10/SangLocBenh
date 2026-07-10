using MedicalAI.Core.Interfaces;
using MedicalAI.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MedicalAI.API.Services
{
    public class SignalRNotificationService : ISignalRNotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        // Vì SignalR mặc định ánh xạ UserId dựa vào ClaimTypes.NameIdentifier, ta có thể dùng Clients.User(userId)
        // Nhưng đối với gửi cho Role (ví dụ tất cả Doctor), ta có thể duyệt qua danh sách User nếu lưu kết nối,
        // hoặc gửi vào một Group ("Doctor").
        // Để đơn giản, ta sẽ gọi Clients.Group(role) và yêu cầu client join group khi kết nối.
        
        public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationToUserAsync(string userId, object notification)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notification);
        }

        public async Task SendNotificationToRoleAsync(string role, object notification)
        {
            await _hubContext.Clients.Group(role).SendAsync("ReceiveNotification", notification);
        }
    }
}
