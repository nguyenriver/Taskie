using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
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
        private readonly IWebHostEnvironment _environment;

        public AuthController(
            UserRepository userRepository,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _environment = environment;
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
            Response.Cookies.Append(AuthService.AuthCookieName, token, CreateAuthCookieOptions());

            return Ok(new
            {
                success = true,
                message = "Login successful.",
                user = CreateUserResponse(user)
            });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out int userId))
            {
                return Unauthorized(new { success = false, message = "Your session is invalid." });
            }

            var user = _userRepository.GetUserById(userId);
            if (user == null)
            {
                return Unauthorized(new { success = false, message = "Your account is no longer available." });
            }

            return Ok(new { success = true, user = CreateUserResponse(user) });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete(AuthService.AuthCookieName, CreateAuthCookieOptions());
            return Ok(new { success = true, message = "Logged out successfully." });
        }

        private CookieOptions CreateAuthCookieOptions()
        {
            return new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Path = "/",
                MaxAge = AuthService.TokenLifetime,
                IsEssential = true
            };
        }

        private static object CreateUserResponse(UserModel user) => new
        {
            userID = user.UserID,
            email = user.Email,
            fullName = user.FullName,
            role = user.Role
        };
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
