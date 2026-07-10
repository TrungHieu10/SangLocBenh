using System;

namespace MedicalAI.Core.Entities
{
    public class Notification
    {
        public long Id { get; set; }
        
        /// <summary>
        /// ID của người dùng nhận thông báo
        /// </summary>
        public string UserId { get; set; } = null!;
        
        /// <summary>
        /// Tiêu đề thông báo
        /// </summary>
        public string Title { get; set; } = null!;
        
        /// <summary>
        /// Nội dung chi tiết
        /// </summary>
        public string Message { get; set; } = null!;
        
        /// <summary>
        /// ID lượt khám liên quan (nếu có) để điều hướng nhanh
        /// </summary>
        public long? RelatedCheckupId { get; set; }
        
        /// <summary>
        /// Trạng thái đã đọc hay chưa
        /// </summary>
        public bool IsRead { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
