using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalAI.Core.Entities;

[Table("RefreshTokens", Schema = "Identity")]
public class RefreshToken
{
    [Key]
    public long Id { get; set; }

    [Required]
    public string Token { get; set; } = null!;

    [Required]
    public string JwtId { get; set; } = null!; // ID của Access Token đi kèm

    public bool IsUsed { get; set; } = false;
    public bool IsRevoked { get; set; } = false;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ExpiryDate { get; set; }

    [Required]
    [MaxLength(450)]
    public string UserId { get; set; } = null!;

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}