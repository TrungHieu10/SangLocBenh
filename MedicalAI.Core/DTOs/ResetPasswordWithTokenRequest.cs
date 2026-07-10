using System.ComponentModel.DataAnnotations;

namespace MedicalAI.Core.DTOs;

public class ResetPasswordWithTokenRequest
{
    [Required]
    public string Token { get; set; } = null!;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới")]
    [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự")]
    public string NewPassword { get; set; } = null!;
}
