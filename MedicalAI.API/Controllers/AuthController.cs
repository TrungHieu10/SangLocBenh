using MedicalAI.Core.DTOs;
using MedicalAI.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace MedicalAI.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly MedicalAI.Infrastructure.Data.ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService authService, MedicalAI.Infrastructure.Data.ApplicationDbContext context, IConfiguration configuration, IEmailService emailService, IWebHostEnvironment env)
    {
        _authService = authService;
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _env = env;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            if (!result) return BadRequest(new { message = "Email đã tồn tại!" });
            return Ok(new { message = "Đăng ký thành công!" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi đăng ký. Vui lòng thử lại sau." });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            if (response == null) return Unauthorized(new { message = "Email hoặc mật khẩu không đúng!" });
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Login Error: " + ex.ToString());
            return StatusCode(500, new { message = "Lỗi hệ thống khi đăng nhập. Vui lòng thử lại sau." });
        }
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            var response = await _authService.GoogleLoginAsync(request);
            if (response == null) return Unauthorized(new { message = "Đăng nhập Google thất bại!" });
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi đăng nhập Google. Vui lòng thử lại sau." });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] TokenRequest request)
    {
        try
        {
            if (ModelState.IsValid)
            {
                var result = await _authService.RefreshTokenAsync(request);
                if (result == null) 
                    return BadRequest(new { message = "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại." });
                
                return Ok(result);
            }
            return BadRequest(new { message = "Dữ liệu gửi lên không hợp lệ." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi làm mới token. Vui lòng thử lại sau." });
        }
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value;
                     
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound("Không tìm thấy người dùng");

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            fullName = user.FullName,
            role = user.Role,
            gender = user.Gender,
            dateOfBirth = user.DateOfBirth,
            phoneNumber = user.PhoneNumber,
            patientCode = user.PatientCode,
            avatarUrl = user.AvatarUrl
        });
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value;
                     
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest("Vui lòng chọn một tệp hợp lệ.");

        // Check if it's an image
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest("Chỉ chấp nhận các tệp hình ảnh (.jpg, .jpeg, .png, .gif, .webp)");
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound("Không tìm thấy người dùng");

        var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "avatars");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{userId}_{Guid.NewGuid().ToString().Substring(0, 8)}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        // Delete old avatar if it exists and is local
        if (!string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("/avatars/"))
        {
            var oldFileName = Path.GetFileName(user.AvatarUrl);
            var oldFilePath = Path.Combine(uploadsFolder, oldFileName);
            if (System.IO.File.Exists(oldFilePath))
            {
                System.IO.File.Delete(oldFilePath);
            }
        }

        user.AvatarUrl = $"/avatars/{uniqueFileName}";
        await _context.SaveChangesAsync();

        return Ok(new { avatarUrl = user.AvatarUrl });
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value;
                     
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound("Không tìm thấy người dùng");

        if (request.FullName != null) user.FullName = request.FullName;
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
        if (request.Gender.HasValue) user.Gender = request.Gender.Value;
        if (request.DateOfBirth.HasValue) user.DateOfBirth = request.DateOfBirth.Value;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Cập nhật hồ sơ thành công" });
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value;
                     
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

        // Validate old password
        if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Mật khẩu cũ không chính xác!" });
        }

        // Validate new password
        if (string.IsNullOrEmpty(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự!" });
        }

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công!" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) 
        {
            // Tránh lỗi Enumeration bằng cách luôn báo thành công ngay cả khi email không tồn tại
            return Ok(new { message = "Nếu email tồn tại trong hệ thống, một liên kết khôi phục đã được gửi tới hộp thư của bạn." });
        }

        // Generate a 15-minute JWT token for password reset containing user ID
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]!);
        
        // Tạo chuỗi signature nhỏ từ PasswordHash để token thành single-use
        string pwdHashPrefix = string.IsNullOrEmpty(user.PasswordHash) ? "none" : user.PasswordHash.Substring(0, 10);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim("purpose", "password_reset"),
                new Claim("pwd_hash", pwdHashPrefix)
            }),
            Expires = DateTime.UtcNow.AddMinutes(15),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var resetToken = tokenHandler.WriteToken(token);

        // Build reset link
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        string resetLink = $"{frontendUrl}/reset-password?token={resetToken}";

        // Send email
        string subject = "[Medical AI] Yêu cầu đặt lại mật khẩu";
        string body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #0d9488; text-align: center;'>Medical AI - Đặt lại mật khẩu</h2>
                <p>Chào <strong>{user.FullName}</strong>,</p>
                <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng bấm vào liên kết dưới đây để đặt mật khẩu mới (Liên kết này có hiệu lực trong vòng 15 phút):</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{resetLink}' style='background: linear-gradient(135deg, #06b6d4, #0d9488); color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Đặt lại mật khẩu</a>
                </div>
                <p>Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
                <p style='word-break: break-all; color: #0891b2;'>{resetLink}</p>
                <hr style='border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;' />
                <p style='font-size: 12px; color: #777777;'>Nếu bạn không yêu cầu việc này, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
            </div>";

        await _emailService.SendEmailAsync(user.Email, subject, body);

        return Ok(new { message = "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hòm thư." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPasswordWithToken([FromBody] ResetPasswordWithTokenRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]!);

        try
        {
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(request.Token, validationParameters, out var validatedToken);
            
            // Check purpose claim
            var purpose = principal.FindFirst("purpose")?.Value;
            if (purpose != "password_reset")
            {
                return BadRequest(new { message = "Mã token không hợp lệ." });
            }

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "Mã token không chứa thông tin người dùng." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Người dùng không tồn tại trong hệ thống." });
            }

            // Check single-use token logic
            var tokenPwdHash = principal.FindFirst("pwd_hash")?.Value;
            string currentPwdHashPrefix = string.IsNullOrEmpty(user.PasswordHash) ? "none" : user.PasswordHash.Substring(0, 10);
            if (tokenPwdHash != currentPwdHashPrefix)
            {
                return BadRequest(new { message = "Mã token đã được sử dụng hoặc không còn hợp lệ!" });
            }

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
        }
        catch (SecurityTokenExpiredException)
        {
            return BadRequest(new { message = "Liên kết khôi phục mật khẩu đã hết hạn. Vui lòng gửi lại yêu cầu." });
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Liên kết khôi phục mật khẩu không hợp lệ hoặc đã bị thay đổi." });
        }
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("link-patient-code")]
    public async Task<IActionResult> LinkPatientCode([FromBody] LinkPatientCodeRequest request)
    {
        if (string.IsNullOrEmpty(request.PatientCode))
        {
            return BadRequest(new { message = "Mã y tế không được để trống!" });
        }

        string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value;
                     
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var currentUser = await _context.Users.FindAsync(userId);
        if (currentUser == null) return NotFound(new { message = "Không tìm thấy người dùng" });

        // Tìm kiếm dummy user có PatientCode này
        var dummyUser = await _context.Users.FirstOrDefaultAsync(u => u.PatientCode == request.PatientCode && u.Id != userId);

        if (dummyUser != null)
        {
            // Chuyển toàn bộ hồ sơ khám bệnh từ dummyUser sang currentUser
            var checkups = await _context.HealthCheckups.Where(c => c.UserId == dummyUser.Id).ToListAsync();
            foreach(var checkup in checkups)
            {
                checkup.UserId = currentUser.Id;
            }
            // Không xóa dummyUser nếu Y tá vẫn cần dùng nó để tham chiếu (Hoặc có thể xóa nếu muốn gộp)
            // Tốt nhất là xóa dummy user (nếu email của nó là dummy) để tránh rác DB, nhưng cần cân nhắc các related data.
            // Để an toàn, chúng ta chỉ lấy PatientCode và vô hiệu hóa dummyUser
            dummyUser.IsActive = false;
        }

        currentUser.PatientCode = request.PatientCode;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Liên kết Mã y tế thành công!", patientCode = currentUser.PatientCode });
    }
}

public class LinkPatientCodeRequest
{
    public string PatientCode { get; set; } = string.Empty;
}