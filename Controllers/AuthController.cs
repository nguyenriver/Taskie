using Microsoft.AspNetCore.Mvc;
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

            if (_userRepository.EmailExists(request.Email))
            {
                return BadRequest(new { success = false, message = "Email already exists." });
            }

            var user = new UserModel
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = AuthService.HashPassword(request.Password),
                Role = "User"
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

            var user = _userRepository.GetUserByEmail(request.Email);
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
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
