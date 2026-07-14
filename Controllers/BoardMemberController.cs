using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskieWNC.Models;

namespace TaskieWNC.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/boardmember")]
    public class BoardMemberController : BaseController
    {
        private readonly BoardRepository _boardRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        public BoardMemberController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            BoardMemberRepository boardMemberRepository) : base(userRepository)
        {
            _boardRepository = boardRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        [HttpGet("board/{boardId}")]
        public IActionResult GetMembers(int boardId)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            if (!_boardRepository.HasBoardAccess(boardId, userId))
            {
                return Forbid();
            }

            var members = _boardMemberRepository.GetBoardMembers(boardId);

            var board = _boardRepository.GetBoardById(boardId);
            if (board == null)
            {
                return NotFound(new { success = false, message = "Board not found." });
            }

            var ownerInfo = _userRepository.GetUserById(board.UserID);
            if (ownerInfo == null)
            {
                return NotFound(new { success = false, message = "Board owner information not found." });
            }

            return Ok(new
            {
                success = true,
                members = members,
                owner = new
                {
                    userID = ownerInfo.UserID,
                    email = ownerInfo.Email,
                    fullname = ownerInfo.FullName
                }
            });
        }

        [HttpPost("invite")]
        public IActionResult Invite([FromBody] InviteMemberRequest request)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            if (request == null)
            {
                return BadRequest(new { success = false, message = "Invalid request." });
            }

            var board = _boardRepository.GetBoardById(request.BoardId);
            if (board == null || board.UserID != userId)
            {
                return Forbid();
            }

            var userToInvite = _userRepository.GetUserByEmail(request.Email);
            if (userToInvite == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            if (_boardMemberRepository.IsBoardMember(request.BoardId, userToInvite.UserID))
            {
                return BadRequest(new { success = false, message = "User is already a board member." });
            }

            var newMember = new BoardMemberModel
            {
                BoardID = request.BoardId,
                UserID = userToInvite.UserID,
                Role = request.Role ?? "Editor"
            };

            _boardMemberRepository.AddBoardMember(newMember);

            return Ok(new { success = true, message = "User has been invited to the board.", member = newMember });
        }

        [HttpDelete("remove/{boardId}/{userIdToRemove}")]
        public IActionResult Remove(int boardId, int userIdToRemove)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            var board = _boardRepository.GetBoardById(boardId);
            if (board == null || board.UserID != userId)
            {
                return Forbid();
            }

            bool success = _boardMemberRepository.RemoveBoardMember(boardId, userIdToRemove);

            if (success)
            {
                return Ok(new { success = true, message = "Member removed successfully." });
            }
            else
            {
                return BadRequest(new { success = false, message = "Failed to remove member." });
            }
        }

        [HttpPut("update-role")]
        public IActionResult UpdateRole([FromBody] UpdateMemberRoleRequest request)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            if (request == null)
            {
                return BadRequest(new { success = false, message = "Invalid request." });
            }

            var board = _boardRepository.GetBoardById(request.BoardId);
            if (board == null || board.UserID != userId)
            {
                return Forbid();
            }

            bool success = _boardMemberRepository.UpdateBoardMemberRole(request.BoardId, request.UserId, request.Role ?? "Editor");

            if (success)
            {
                return Ok(new { success = true, message = "Member role updated successfully." });
            }
            else
            {
                return BadRequest(new { success = false, message = "Failed to update member role." });
            }
        }

        public class InviteMemberRequest
        {
            public int BoardId { get; set; }
            public required string Email { get; set; }
            public string? Role { get; set; }
        }

        public class UpdateMemberRoleRequest
        {
            public int BoardId { get; set; }
            public int UserId { get; set; }
            public string? Role { get; set; }
        }
    }
}