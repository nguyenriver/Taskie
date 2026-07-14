using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskieWNC.Models;

namespace TaskieWNC.Controllers
{
    public abstract class BaseController : ControllerBase
    {
        protected readonly UserRepository _userRepository;

        protected BaseController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        protected bool IsUserLoggedIn()
        {
            return User.Identity?.IsAuthenticated ?? false;
        }

        protected bool TryGetUserId(out int userId)
        {
            userId = 0;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return !string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out userId);
        }

        protected string? GetUserEmail()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value;
        }
    }
}