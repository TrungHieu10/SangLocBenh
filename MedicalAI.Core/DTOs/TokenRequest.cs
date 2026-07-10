using System.ComponentModel.DataAnnotations;

namespace MedicalAI.Core.DTOs;

public class TokenRequest
{
    [Required]
    public string AccessToken { get; set; } = null!;
    
    [Required]
    public string RefreshToken { get; set; } = null!;
}