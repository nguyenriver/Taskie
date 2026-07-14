using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskieWNC.Models;

namespace TaskieWNC.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/board")]
    public class BoardController : BaseController
    {
        private readonly BoardRepository _boardRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        public BoardController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            BoardMemberRepository boardMemberRepository) : base(userRepository)
        {
            _boardRepository = boardRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        [HttpGet("{boardId}")]
        public IActionResult GetBoardDetail(int boardId)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            // Check if user has access to the board
            if (!_boardRepository.HasBoardAccess(boardId, userId))
            {
                return Forbid();
            }

            var board = _boardRepository.GetBoardById(boardId);
            if (board == null)
            {
                return NotFound(new { success = false, message = "Board not found." });
            }

            // Determine user's role
            bool isOwner = (board.UserID == userId);
            string userRole = "Viewer";
            if (isOwner)
            {
                userRole = "Owner";
            }
            else
            {
                var membership = _boardMemberRepository.GetBoardMembership(boardId, userId);
                if (membership != null)
                {
                    userRole = membership.Role;
                }
            }

            return Ok(new
            {
                success = true,
                boardId = boardId,
                boardName = board.BoardName,
                isOwner = isOwner,
                userRole = userRole,
                boardDetails = board
            });
        }

        [HttpGet("list")]
        public IActionResult GetBoards()
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            var ownedBoards = _boardRepository.GetBoardsByUserId(userId);
            var sharedBoards = _boardRepository.GetSharedBoardsByUserId(userId);

            return Ok(new
            {
                success = true,
                ownedBoards = ownedBoards,
                sharedBoards = sharedBoards
            });
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] BoardModel newBoard)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            newBoard.UserID = userId;
            _boardRepository.AddBoard(newBoard);

            return Ok(new { success = true, message = "Board created successfully!", board = newBoard });
        }

        [HttpDelete("delete/{boardId}")]
        public IActionResult Delete(int boardId)
        {
            if (boardId <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid board ID." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Unauthorized(new { success = false, message = "User not logged in." });
                }

                var board = _boardRepository.GetBoardById(boardId);
                if (board == null)
                {
                    return NotFound(new { success = false, message = "Board not found." });
                }

                if (board.UserID != userId)
                {
                    return Forbid();
                }

                _boardRepository.DeleteBoard(boardId);
                return Ok(new { success = true, message = "Board deleted successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error deleting board: {ex.Message}" });
            }
        }

        [HttpPut("update-name")]
        public IActionResult UpdateName([FromBody] UpdateBoardNameRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.BoardName))
            {
                return BadRequest(new { success = false, message = "Board name cannot be empty." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Unauthorized(new { success = false, message = "User not logged in." });
                }

                var board = _boardRepository.GetBoardById(request.BoardId);
                if (board == null)
                {
                    return NotFound(new { success = false, message = "Board not found." });
                }

                if (board.UserID != userId)
                {
                    return Forbid();
                }

                board.BoardName = request.BoardName;
                _boardRepository.UpdateBoard(board);

                return Ok(new { success = true, message = "Board name updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error updating board name: {ex.Message}" });
            }
        }
    }

    public class UpdateBoardNameRequest
    {
        public int BoardId { get; set; }
        public string? BoardName { get; set; }
    }
}