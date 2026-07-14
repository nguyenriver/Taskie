using System.ComponentModel.DataAnnotations;

namespace TaskieWNC.Models.Requests
{
    // User Requests
    public class AddUserRequest
    {
        [Required]
        [StringLength(255, MinimumLength = 1)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(128, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "User";
        public string? VerifyKey { get; set; }
    }

    public class UpdateUserRequest
    {
        public int UserID { get; set; }
        public string Field { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class DeleteUserRequest
    {
        public int UserID { get; set; }
    }

    // Board Requests
    public class AddBoardRequest
    {
        public string BoardName { get; set; } = string.Empty;
        public int UserID { get; set; }
    }

    public class UpdateBoardRequest
    {
        public int BoardID { get; set; }
        public string BoardName { get; set; } = string.Empty;
    }

    public class TransferBoardOwnershipRequest
    {
        [Range(1, int.MaxValue)]
        public int BoardID { get; set; }

        [Range(1, int.MaxValue)]
        public int NewOwnerUserID { get; set; }
    }

    public class DeleteBoardRequest
    {
        public int BoardID { get; set; }
    }

    public class AddBoardMemberRequest
    {
        public int BoardID { get; set; }
        public int UserID { get; set; }
        public string Role { get; set; } = "Viewer";
    }

    public class UpdateBoardMemberRoleRequest
    {
        public int BoardID { get; set; }
        public int UserID { get; set; }
        public string Role { get; set; } = "Viewer";
    }

    public class DeleteBoardMemberRequest
    {
        public int BoardID { get; set; }
        public int UserID { get; set; }
    }
}
