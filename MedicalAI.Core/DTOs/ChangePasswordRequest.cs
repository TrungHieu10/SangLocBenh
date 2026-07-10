using System.ComponentModel.DataAnnotations;

namespace MedicalAI.Core.DTOs;

public class ChangePasswordRequest
{
    [Required]
    public string OldPassword { get; set; } = null!;

    [Required]
    [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự")]
    public string NewPassword { get; set; } = null!;
}
