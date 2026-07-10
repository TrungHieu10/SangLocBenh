using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalAI.Core.Entities;
using MedicalAI.Core.DTOs;
using MedicalAI.Infrastructure.Data;

namespace MedicalAI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public AdminController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string role = "")
        {
            try
            {
                var query = _dbContext.Users.AsQueryable();
                if (!string.IsNullOrEmpty(role))
                {
                    query = query.Where(u => u.Role == role);
                }

                var users = await query
                    .Select(u => new
                    {
                        u.Id,
                        u.FullName,
                        u.Email,
                        u.PhoneNumber,
                        u.Gender,
                        u.DateOfBirth,
                        u.Role,
                        u.IsActive,
                        u.CreatedAt
                    })
                    .OrderByDescending(u => u.CreatedAt)
                    .ToListAsync();

                return Ok(new { success = true, data = users });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi tải danh sách người dùng." });
            }
        }

        // GET: api/admin/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var usersStats = await _dbContext.Users
                    .GroupBy(u => 1)
                    .Select(g => new { Total = g.Count(), Patients = g.Count(u => u.Role == "Patient"), Doctors = g.Count(u => u.Role == "Doctor") })
                    .FirstOrDefaultAsync();

                var checkupsStats = await _dbContext.HealthCheckups
                    .Where(c => !c.IsDeleted)
                    .GroupBy(c => 1)
                    .Select(g => new { Total = g.Count() })
                    .FirstOrDefaultAsync();

                var predictionsStats = await _dbContext.PredictionResults
                    .Where(p => !p.HealthCheckup.IsDeleted)
                    .GroupBy(p => 1)
                    .Select(g => new { Total = g.Count(), Low = g.Count(p => p.RiskLevel == "Low"), Medium = g.Count(p => p.RiskLevel == "Medium"), High = g.Count(p => p.RiskLevel == "High" || p.RiskLevel == "Very High") })
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalUsers = usersStats?.Total ?? 0,
                        totalCheckups = checkupsStats?.Total ?? 0,
                        totalPredictions = predictionsStats?.Total ?? 0,
                        patientsCount = usersStats?.Patients ?? 0,
                        doctorsCount = usersStats?.Doctors ?? 0,
                        riskStats = new { low = predictionsStats?.Low ?? 0, medium = predictionsStats?.Medium ?? 0, high = predictionsStats?.High ?? 0 }
                    }
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi tải thống kê." });
            }
        }

        // PUT: api/admin/users/{id}/role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleRequest req)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (id == currentUserId)
                    return BadRequest(new { success = false, message = "Không thể thay đổi vai trò của chính mình." });

                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
                if (user == null) return NotFound(new { success = false, message = "Không tìm thấy người dùng" });

                if (req.Role != "Admin" && req.Role != "Doctor" && req.Role != "Patient" && req.Role != "Nurse")
                {
                    return BadRequest(new { success = false, message = "Vai trò không hợp lệ" });
                }

                user.Role = req.Role;
                await _dbContext.SaveChangesAsync();

                return Ok(new { success = true, message = "Cập nhật vai trò thành công" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi cập nhật vai trò." });
            }
        }

        // POST: api/admin/users
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
        {
            try
            {
                if (await _dbContext.Users.AnyAsync(u => u.Email == req.Email))
                    return BadRequest(new { message = "Email đã tồn tại" });

                if (string.IsNullOrEmpty(req.Password) || req.Password.Length < 6)
                    return BadRequest(new { message = "Mật khẩu phải có ít nhất 6 ký tự" });
                
                var role = string.IsNullOrEmpty(req.Role) ? "Patient" : req.Role;
                if (role != "Admin" && role != "Doctor" && role != "Patient" && role != "Nurse")
                    return BadRequest(new { message = "Vai trò không hợp lệ" });

                var user = new User
                {
                    FullName = req.FullName,
                    Email = req.Email,
                    PhoneNumber = req.PhoneNumber,
                    Gender = req.Gender ?? 0,
                    DateOfBirth = req.DateOfBirth ?? new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    Role = role,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                    IsActive = true
                };

                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();

                return Ok(new { success = true, message = "Tạo người dùng thành công" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi tạo người dùng." });
            }
        }

        // PUT: api/admin/users/{id}
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest req)
        {
            try
            {
                var user = await _dbContext.Users.FindAsync(id);
                if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

                if (!string.IsNullOrEmpty(req.FullName)) user.FullName = req.FullName;
                if (!string.IsNullOrEmpty(req.PhoneNumber)) user.PhoneNumber = req.PhoneNumber;
                if (req.Gender.HasValue) user.Gender = req.Gender.Value;
                if (req.DateOfBirth.HasValue) user.DateOfBirth = req.DateOfBirth.Value;
                if (!string.IsNullOrEmpty(req.Role))
                {
                    if (req.Role != "Admin" && req.Role != "Doctor" && req.Role != "Patient" && req.Role != "Nurse")
                        return BadRequest(new { message = "Vai trò không hợp lệ" });
                    user.Role = req.Role;
                }

                await _dbContext.SaveChangesAsync();
                return Ok(new { success = true, message = "Cập nhật người dùng thành công" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi cập nhật người dùng." });
            }
        }

        // PUT: api/admin/users/{id}/toggle-status
        [HttpPut("users/{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string id)
        {
            try
            {
                var user = await _dbContext.Users.FindAsync(id);
                if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

                user.IsActive = !user.IsActive;
                await _dbContext.SaveChangesAsync();

                return Ok(new { success = true, message = user.IsActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", isActive = user.IsActive });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi khóa/mở khóa tài khoản." });
            }
        }

        // PUT: api/admin/users/{id}/reset-password
        [HttpPut("users/{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordRequest req)
        {
            try
            {
                var user = await _dbContext.Users.FindAsync(id);
                if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

                if (string.IsNullOrEmpty(req.NewPassword) || req.NewPassword.Length < 6)
                    return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự" });

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
                await _dbContext.SaveChangesAsync();

                return Ok(new { success = true, message = "Reset mật khẩu thành công" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi reset mật khẩu." });
            }
        }

        // DELETE: api/admin/users/{id}
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (id == currentUserId)
                    return BadRequest(new { message = "Không thể xóa tài khoản của chính mình." });

                var user = await _dbContext.Users.FindAsync(id);
                if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

                var hasCheckupsAsPatient = await _dbContext.HealthCheckups.AnyAsync(c => c.UserId == id);
                var hasCheckupsAsDoctor = await _dbContext.HealthCheckups.AnyAsync(c => c.DoctorId == id);
                
                if (hasCheckupsAsPatient || hasCheckupsAsDoctor)
                    return BadRequest(new { message = "Không thể xóa tài khoản đang có hồ sơ liên kết. Vui lòng sử dụng tính năng Khóa tài khoản (Deactivate) để đảm bảo toàn vẹn dữ liệu." });

                _dbContext.Users.Remove(user);
                await _dbContext.SaveChangesAsync();

                return Ok(new { success = true, message = "Đã xóa người dùng" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi xóa người dùng." });
            }
        }

        // GET: api/admin/checkups
        [HttpGet("checkups")]
        public async Task<IActionResult> GetAllCheckups([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _dbContext.HealthCheckups
                    .Include(c => c.User)
                    .Include(c => c.PredictionResults)
                    .Where(c => !c.IsDeleted)
                    .OrderByDescending(c => c.CheckupDate);

                var total = await query.CountAsync();
                var checkups = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new
                    {
                        id = c.Id,
                        userId = c.UserId,
                        userFullName = c.User.FullName,
                        userEmail = c.User.Email,
                        checkupDate = c.CheckupDate,
                        status = c.Status,
                        predictions = c.PredictionResults.Select(p => new {
                            diseaseType = p.DiseaseType,
                            probability = p.Probability,
                            riskLevel = p.RiskLevel
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = new { items = checkups, total, page, pageSize } });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi tải danh sách lượt khám." });
            }
        }

        // DELETE: api/admin/checkups/{id}
        [HttpDelete("checkups/{id}")]
        public async Task<IActionResult> DeleteCheckup(long id)
        {
            try
            {
                var checkup = await _dbContext.HealthCheckups.FindAsync(id);
                if (checkup == null || checkup.IsDeleted) return NotFound(new { message = "Không tìm thấy lượt khám" });

                checkup.IsDeleted = true;
                await _dbContext.SaveChangesAsync();

                return Ok(new { success = true, message = "Đã xóa lượt khám" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi xóa lượt khám." });
            }
        }
    }
}
