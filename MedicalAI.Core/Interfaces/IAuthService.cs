using MedicalAI.Core.DTOs;

namespace MedicalAI.Core.Interfaces;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RefreshTokenAsync(TokenRequest request);
    Task<AuthResponse?> GoogleLoginAsync(GoogleLoginRequest request);
}