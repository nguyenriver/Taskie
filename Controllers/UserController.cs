using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskieWNC.Models;
using TaskieWNC.Services;
using System.Linq;

namespace TaskieWNC.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/user")]
    public class UserController : BaseController
    {
        public UserController(UserRepository userRepository) : base(userRepository)
        {
        }

        // Get user profile data
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            var user = _userRepository.GetUserById(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            return Ok(new
            {
                success = true,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role,
                createdAt = user.CreatedAt
            });
        }

        // Update user profile (fullName)
        [HttpPost("profile/update")]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new { success = false, message = "Full name cannot be empty." });
            }

            var user = _userRepository.GetUserById(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            user.FullName = request.FullName;
            _userRepository.UpdateUser(user);

            return Ok(new { success = true, message = "Profile updated successfully.", fullName = user.FullName });
        }

        // Change password
        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            var user = _userRepository.GetUserById(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            // Verify current password
            if (!AuthService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { success = false, message = "Current password is incorrect." });
            }

            // Validate new password
            if (!IsPasswordValid(request.NewPassword, out string errorMessage))
            {
                return BadRequest(new { success = false, message = errorMessage });
            }

            // Update to new password
            user.PasswordHash = AuthService.HashPassword(request.NewPassword);
            _userRepository.UpdateUser(user);

            return Ok(new { success = true, message = "Password changed successfully." });
        }

        private bool IsPasswordValid(string password, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (password.Length < 8)
            {
                errorMessage = "Password must be at least 8 characters long.";
                return false;
            }

            if (!password.Any(char.IsUpper))
            {
                errorMessage = "Password must contain at least one uppercase letter.";
                return false;
            }

            if (!password.Any(char.IsLower))
            {
                errorMessage = "Password must contain at least one lowercase letter.";
                return false;
            }

            if (!password.Any(char.IsDigit))
            {
                errorMessage = "Password must contain at least one number.";
                return false;
            }

            if (!password.Any(c => !char.IsLetterOrDigit(c)))
            {
                errorMessage = "Password must contain at least one special character.";
                return false;
            }

            return true;
        }
    }

    public class UpdateProfileRequest
    {
        public string FullName { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}