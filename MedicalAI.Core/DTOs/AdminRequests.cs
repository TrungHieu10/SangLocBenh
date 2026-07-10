using System;

namespace MedicalAI.Core.DTOs
{
    public class UpdateRoleRequest
    {
        public string Role { get; set; } = "";
    }

    public class CreateUserRequest
    {
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public byte? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Password { get; set; } = "";
        public string Role { get; set; } = "";
    }

    public class UpdateUserRequest
    {
        public string FullName { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public byte? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Role { get; set; } = "";
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; } = "";
    }
}
