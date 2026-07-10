using System.ComponentModel.DataAnnotations;

namespace MedicalAI.Core.DTOs
{
    public class GoogleLoginRequest
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }
}
