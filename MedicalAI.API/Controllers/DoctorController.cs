using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalAI.Core.DTOs;
using MedicalAI.Core.Entities;
using MedicalAI.Infrastructure.Data;
using System.Security.Claims;
using MedicalAI.Core.Interfaces;

namespace MedicalAI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Doctor,Admin")]
    public class DoctorController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly INotificationService _notificationService;

        public DoctorController(ApplicationDbContext dbContext, INotificationService notificationService)
        {
            _dbContext = dbContext;
            _notificationService = notificationService;
        }

        // GET: api/doctor/checkups
        [HttpGet("checkups")]
        public async Task<IActionResult> GetAllCheckups([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string status = "all", [FromQuery] string search = "")
        {
            var baseQuery = _dbContext.HealthCheckups
                .Include(c => c.User)
                .Include(c => c.PredictionResults)
                .Where(c => !c.IsDeleted);

            // Tinh toan Stats tong quat
            var totalCount = await baseQuery.CountAsync();
            var pendingCount = await baseQuery.CountAsync(c => c.Status == "Pending");
            var reviewedCount = await baseQuery.CountAsync(c => c.Status == "Reviewed");

            var query = baseQuery.AsQueryable();

            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                if (status == "pending") query = query.Where(c => c.Status == "Pending");
                else if (status == "reviewed") query = query.Where(c => c.Status == "Reviewed");
            }

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(c => c.User.FullName.ToLower().Contains(search) || c.User.Email.ToLower().Contains(search));
            }

            query = query.OrderByDescending(c => c.CheckupDate);

            var filteredTotal = await query.CountAsync();
            var checkups = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    c.Id,
                    c.UserId,
                    PatientName = c.User.FullName,
                    PatientEmail = c.User.Email,
                    PatientAge = c.User.DateOfBirth != default ? DateTime.Now.Year - c.User.DateOfBirth.Year : 0,
                    PatientGender = c.User.Gender,
                    c.CheckupDate,
                    c.Status,
                    c.DoctorId,
                    c.Notes,
                    Predictions = c.PredictionResults.Select(p => new {
                        p.DiseaseType,
                        p.Probability,
                        p.RiskLevel
                    })
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = new
                {
                    items = checkups,
                    total = filteredTotal,
                    page,
                    pageSize,
                    stats = new { total = totalCount, pending = pendingCount, reviewed = reviewedCount }
                }
            });
        }

        // PUT: api/doctor/checkups/{id}/review
        [HttpPut("checkups/{id}/review")]
        public async Task<IActionResult> SubmitReview(long id, [FromBody] SubmitReviewRequest req)
        {
            var checkup = await _dbContext.HealthCheckups.FirstOrDefaultAsync(c => c.Id == id);
            if (checkup == null) return NotFound(new { success = false, message = "Không tìm thấy thông tin khám" });

            var doctorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            checkup.Notes = req.Notes;
            checkup.DoctorId = doctorId;
            checkup.Status = "Reviewed";

            // Có thể sau này lưu thêm req.Advice nếu cần tách riêng Advice của bác sĩ khỏi AI
            // Hiện tại ta tạm gộp vào Notes hoặc có entity riêng.

            await _dbContext.SaveChangesAsync();

            // Gửi thông báo cho bệnh nhân
            await _notificationService.CreateNotificationAsync(
                checkup.UserId, 
                "Đã có kết quả khám", 
                "Bác sĩ đã đánh giá và trả kết quả phân tích y khoa cho bạn.", 
                checkup.Id);
                
            // Gửi thông báo cho y tá
            await _notificationService.CreateNotificationForRoleAsync(
                "Nurse",
                "Bác sĩ đã duyệt kết quả",
                "Bác sĩ đã hoàn tất đánh giá và trả kết quả khám cho bệnh nhân.",
                checkup.Id);

            return Ok(new { success = true, message = "Hoàn tất phân tích thành công" });
        }
}
}
