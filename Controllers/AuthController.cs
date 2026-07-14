using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using TaskieWNC.Models;
using TaskieWNC.Services;

namespace TaskieWNC.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(UserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new { success = false, message = "Passwords do not match." });
            }

            if (!PasswordPolicy.TryValidate(request.Password, out string passwordError))
            {
                return BadRequest(new { success = false, message = passwordError });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            if (_userRepository.EmailExists(normalizedEmail))
            {
                return BadRequest(new { success = false, message = "Email already exists." });
            }

            var user = new UserModel
            {
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                PasswordHash = AuthService.HashPassword(request.Password),
                Role = SystemRoles.User
            };

            _userRepository.Register(user);

            return Ok(new { success = true, message = "Registration successful! Please log in." });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { success = false, message = "Email and password are required." });
            }

            var user = _userRepository.GetUserByEmail(request.Email.Trim().ToLowerInvariant());
            if (user == null || !AuthService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { success = false, message = "Invalid email or password." });
            }

            var token = AuthService.GenerateToken(user, _configuration);

            return Ok(new
            {
                success = true,
                message = "Login successful.",
                token = token,
                user = new
                {
                    userID = user.UserID,
                    email = user.Email,
                    fullName = user.FullName,
                    role = user.Role
                }
            });
        }
    }

    public class RegisterRequest
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
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
