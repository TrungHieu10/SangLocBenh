using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MedicalAI.Core.DTOs;
using MedicalAI.Core.Entities;
using MedicalAI.Core.Interfaces;
using MedicalAI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;

namespace MedicalAI.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;
    // Cấu hình parameters để Verify Token đã hết hạn
    private readonly TokenValidationParameters _tokenValidationParams;

    public AuthService(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
        
        var secretKey = _config["JwtSettings:SecretKey"];
        if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 16)
        {
            throw new InvalidOperationException("JwtSettings:SecretKey is missing or too short. It must be at least 16 characters long.");
        }

        // Khởi tạo quy tắc kiểm tra Token
        _tokenValidationParams = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = _config["JwtSettings:Issuer"] ?? "MedicalAIApp",
            ValidAudience = _config["JwtSettings:Audience"] ?? "MedicalAIAppUsers",
            ValidateLifetime = false 
        };
    }

    public async Task<bool> RegisterAsync(RegisterRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password)) return false;
        
        if (await _context.Users.AnyAsync(u => u.Email == request.Email)) 
            throw new InvalidOperationException("Email đã tồn tại!");
            
        User? dummyUserToMerge = null;
        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
            if (existingUser != null)
            {
                if (existingUser.Email.EndsWith("@clinic.local"))
                {
                    dummyUserToMerge = existingUser;
                }
                else
                {
                    throw new InvalidOperationException("Số điện thoại đã được đăng ký cho tài khoản khác!");
                }
            }
        }

        if (dummyUserToMerge != null)
        {
            dummyUserToMerge.FullName = request.FullName;
            dummyUserToMerge.Email = request.Email;
            dummyUserToMerge.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            dummyUserToMerge.Gender = request.Gender;
            dummyUserToMerge.DateOfBirth = request.DateOfBirth;
            dummyUserToMerge.IsActive = true;
            _context.Users.Update(dummyUserToMerge);
        }
        else
        {
            var user = new User
            {
                FullName = request.FullName, Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Gender = request.Gender, DateOfBirth = request.DateOfBirth,
                PhoneNumber = request.PhoneNumber,
                PatientCode = request.PatientCode
            };
            _context.Users.Add(user);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Identifier) || string.IsNullOrEmpty(request.Password)) return null;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Identifier || u.PhoneNumber == request.Identifier);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Tài khoản của bạn đã bị khóa.");

        return await GenerateAuthResponseAsync(user);
    }

    // --- HÀM MỚI: XỬ LÝ REFRESH TOKEN ---
    public async Task<AuthResponse?> RefreshTokenAsync(TokenRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.AccessToken) || string.IsNullOrEmpty(request.RefreshToken)) return null;

        var jwtTokenHandler = new JwtSecurityTokenHandler();

        try
        {
            // 1. Kiểm tra cấu trúc của Access Token cũ
            var tokenInVerification = jwtTokenHandler.ValidateToken(request.AccessToken, _tokenValidationParams, out var validatedToken);
            if (validatedToken is JwtSecurityToken jwtSecurityToken)
            {
                var result = jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase);
                if (!result) return null; // Sai thuật toán mã hóa
            }

            // 2. Kiểm tra Refresh Token trong Database
            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == request.RefreshToken);
            if (storedToken == null) return null;
            if (storedToken.IsUsed || storedToken.IsRevoked) return null; // Bị xài rồi hoặc bị khóa
            if (storedToken.ExpiryDate < DateTimeOffset.UtcNow) return null; // Hết hạn

            var jti = tokenInVerification.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)?.Value;
            if (storedToken.JwtId != jti) return null; // Không khớp với Access Token gốc

            // 3. Hợp lệ -> Đánh dấu token cũ là đã sử dụng
            storedToken.IsUsed = true;
            _context.RefreshTokens.Update(storedToken);
            await _context.SaveChangesAsync();

            // 4. Tìm User và tạo cặp Token mới
            var user = await _context.Users.FindAsync(storedToken.UserId);
            if (user == null) return null;

            if (!user.IsActive)
                return null;

            return await GenerateAuthResponseAsync(user);
        }
        catch (Exception)
        {
            return null;
        }
    }

    // --- HÀM MỚI: XỬ LÝ GOOGLE LOGIN ---
    public async Task<AuthResponse?> GoogleLoginAsync(GoogleLoginRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.IdToken)) return null;

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                // Thay thế bằng Client ID thực tế mà user đã cung cấp
                Audience = new[] { "163287024254-lesff9837dcjjlltq7l06ul760c3r0m0.apps.googleusercontent.com" }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            if (payload == null) return null;

            // Tìm user trong Database
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == payload.Email);
            
            // Nếu chưa có, tạo user mới
            if (user == null)
            {
                user = new User
                {
                    FullName = payload.Name,
                    Email = payload.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Random password
                    Role = "Patient", // Mặc định là Patient
                    DateOfBirth = new DateTime(2000, 1, 1) // Mặc định
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Tài khoản của bạn đã bị khóa.");

            return await GenerateAuthResponseAsync(user);
        }
        catch (UnauthorizedAccessException)
        {
            throw; // Re-throw so the controller can handle locked accounts
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Google Login Error: {ex.Message}");
            return null;
        }
    }

    // --- HÀM HỖ TRỢ: TẠO CẶP TOKEN ---
    private async Task<AuthResponse> GenerateAuthResponseAsync(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = _config["JwtSettings:SecretKey"];
        if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 16)
        {
            throw new InvalidOperationException("JwtSettings:SecretKey is missing or too short. It must be at least 16 characters long.");
        }
        var key = Encoding.ASCII.GetBytes(secretKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Thêm ID độc nhất cho JWT
            }),
            Expires = DateTime.UtcNow.AddMinutes(30), // Access Token sống 30 phút
            Issuer = _config["JwtSettings:Issuer"] ?? "MedicalAIApp",
            Audience = _config["JwtSettings:Audience"] ?? "MedicalAIAppUsers",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwtToken = tokenHandler.WriteToken(token);

        // Tạo Refresh Token an toàn
        var refreshToken = new RefreshToken
        {
            JwtId = token.Id,
            IsUsed = false,
            IsRevoked = false,
            UserId = user.Id,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiryDate = DateTimeOffset.UtcNow.AddDays(7), // Refresh Token sống 7 ngày
            Token = RandomString(35) + Guid.NewGuid()
        };

        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            Token = jwtToken,
            RefreshToken = refreshToken.Token,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            AvatarUrl = user.AvatarUrl
        };
    }

    private static string RandomString(int length)
    {
        var random = new byte[length];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(random);
            return Convert.ToBase64String(random);
        }
    }

}