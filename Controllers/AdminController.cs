using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskieWNC.Models;
using TaskieWNC.Models.Requests;
using TaskieWNC.Services;

namespace TaskieWNC.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly BoardRepository _boardRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        public AdminController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            BoardMemberRepository boardMemberRepository)
        {
            _userRepository = userRepository;
            _boardRepository = boardRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        // User CRUD
        [HttpGet("users")]
        public IActionResult GetUsers() => Ok(_userRepository.GetAllUsers().Select(UserDto.FromModel));

        [HttpPost("users/add")]
        public IActionResult AddUser([FromBody] AddUserRequest request)
        {
            if (!PasswordPolicy.TryValidate(request.Password, out string passwordError))
            {
                return BadRequest(new { success = false, message = passwordError });
            }

            if (!SystemRoles.TryNormalize(request.Role, out string normalizedRole))
            {
                return BadRequest(new { success = false, message = "System role must be User or Admin." });
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
                Role = normalizedRole,
                VerifyKey = string.IsNullOrWhiteSpace(request.VerifyKey) ? null : request.VerifyKey.Trim()
            };

            _userRepository.Register(user);
            return Ok(new { success = true, message = "User added successfully.", user = UserDto.FromModel(user) });
        }

        [HttpPut("users/update")]
        public IActionResult UpdateUser([FromBody] UpdateUserRequest request)
        {
            var user = _userRepository.GetUserById(request.UserID);
            if (user == null) return NotFound(new { success = false, message = "User not found." });

            if (request.Field == "FullName")
            {
                if (string.IsNullOrWhiteSpace(request.Value))
                {
                    return BadRequest(new { success = false, message = "Full name cannot be empty." });
                }

                user.FullName = request.Value.Trim();
            }
            else if (request.Field == "Role")
            {
                if (!SystemRoles.TryNormalize(request.Value, out string normalizedRole))
                {
                    return BadRequest(new { success = false, message = "System role must be User or Admin." });
                }

                user.Role = normalizedRole;
            }
            else
            {
                return BadRequest(new { success = false, message = "Field must be FullName or Role." });
            }

            _userRepository.UpdateUser(user);
            return Ok(new { success = true, message = "User updated successfully.", user = UserDto.FromModel(user) });
        }

        [HttpDelete("users/delete/{userId}")]
        public IActionResult DeleteUser(int userId)
        {
            var user = _userRepository.GetUserById(userId);
            if (user == null) return NotFound(new { success = false, message = "User not found." });

            _userRepository.DeleteUser(userId);
            return Ok(new { success = true, message = "User deleted successfully." });
        }

        // Board CRUD
        [HttpGet("boards")]
        public IActionResult GetBoards() => Ok(_boardRepository.GetAllBoards());

        [HttpPost("boards/add")]
        public IActionResult AddBoard([FromBody] AddBoardRequest request)
        {
            var user = _userRepository.GetUserById(request.UserID);
            if (user == null)
            {
                return NotFound(new { success = false, message = "UserID does not exist." });
            }

            var board = new BoardModel
            {
                BoardName = request.BoardName,
                UserID = request.UserID
            };

            _boardRepository.AddBoard(board);
            return Ok(new { success = true, message = "Board added successfully.", board = board });
        }

        [HttpPut("boards/update")]
        public IActionResult UpdateBoard([FromBody] UpdateBoardRequest request)
        {
            var board = _boardRepository.GetBoardById(request.BoardID);
            if (board == null) return NotFound(new { success = false, message = "Board not found." });

            board.BoardName = request.BoardName;
            _boardRepository.UpdateBoard(board);
            return Ok(new { success = true, message = "Board updated successfully.", board = board });
        }

        [HttpDelete("boards/delete/{boardId}")]
        public IActionResult DeleteBoard(int boardId)
        {
            var board = _boardRepository.GetBoardById(boardId);
            if (board == null) return NotFound(new { success = false, message = "Board not found." });

            _boardRepository.DeleteBoard(boardId);
            return Ok(new { success = true, message = "Board deleted successfully." });
        }

        [HttpPut("boards/transfer-owner")]
        public IActionResult TransferBoardOwnership([FromBody] TransferBoardOwnershipRequest request)
        {
            var board = _boardRepository.GetBoardById(request.BoardID);
            if (board == null)
            {
                return NotFound(new { success = false, message = "Board not found." });
            }

            var newOwner = _userRepository.GetUserById(request.NewOwnerUserID);
            if (newOwner == null)
            {
                return NotFound(new { success = false, message = "New owner was not found." });
            }

            if (board.UserID == request.NewOwnerUserID)
            {
                return BadRequest(new { success = false, message = "This user already owns the board." });
            }

            var updatedBoard = _boardRepository.TransferOwnership(request.BoardID, request.NewOwnerUserID);
            if (updatedBoard == null)
            {
                return NotFound(new { success = false, message = "Board no longer exists." });
            }

            return Ok(new
            {
                success = true,
                message = "Board ownership transferred. The previous owner is now an Editor.",
                board = updatedBoard
            });
        }

        [HttpGet("boardmembers/{boardId}")]
        public IActionResult GetBoardMembers(int boardId)
        {
            var boardMembers = _boardMemberRepository.GetBoardMembers(boardId);
            return Ok(boardMembers);
        }

        [HttpGet("boardmembers")]
        public IActionResult GetAllBoardMembers()
        {
            var allBoardMembers = _boardMemberRepository.GetAllBoardMembers();
            return Ok(allBoardMembers);
        }

        [HttpPost("boardmembers/add")]
        public IActionResult AddBoardMember([FromBody] AddBoardMemberRequest request)
        {
            if (!BoardRoles.TryNormalizeMemberRole(request.Role, out string normalizedRole))
            {
                return BadRequest(new { success = false, message = "Role must be Editor or Viewer." });
            }

            var board = _boardRepository.GetBoardById(request.BoardID);
            if (board == null)
            {
                return NotFound(new { success = false, message = "Board not found." });
            }

            var user = _userRepository.GetUserById(request.UserID);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            if (board.UserID == request.UserID)
            {
                return BadRequest(new { success = false, message = "The board owner cannot also be added as a member." });
            }

            if (_boardMemberRepository.IsBoardMember(request.BoardID, request.UserID))
            {
                return BadRequest(new { success = false, message = "User is already a member of this board." });
            }

            var boardMember = new BoardMemberModel
            {
                BoardID = request.BoardID,
                UserID = request.UserID,
                Role = normalizedRole
            };

            _boardMemberRepository.AddBoardMember(boardMember);
            return Ok(new { success = true, message = "Board member added successfully.", boardMember = boardMember });
        }

        [HttpPut("boardmembers/update-role")]
        public IActionResult UpdateBoardMemberRole([FromBody] UpdateBoardMemberRoleRequest request)
        {
            if (!BoardRoles.TryNormalizeMemberRole(request.Role, out string normalizedRole))
            {
                return BadRequest(new { success = false, message = "Role must be Editor or Viewer." });
            }

            var success = _boardMemberRepository.UpdateBoardMemberRole(request.BoardID, request.UserID, normalizedRole);
            if (!success)
            {
                return BadRequest(new { success = false, message = "Failed to update board member role." });
            }

            return Ok(new { success = true, message = "Board member role updated successfully." });
        }

        [HttpDelete("boardmembers/delete/{boardId}/{userId}")]
        public IActionResult DeleteBoardMember(int boardId, int userId)
        {
            var success = _boardMemberRepository.RemoveBoardMember(boardId, userId);
            if (!success)
            {
                return BadRequest(new { success = false, message = "Failed to delete board member." });
            }

            return Ok(new { success = true, message = "Board member deleted successfully." });
        }
    }
}
