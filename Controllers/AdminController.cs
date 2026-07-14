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
        private readonly ListRepository _listRepository;
        private readonly CardRepository _cardRepository;
        private readonly CommentRepository _commentRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        public AdminController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            ListRepository listRepository,
            CardRepository cardRepository,
            CommentRepository commentRepository,
            BoardMemberRepository boardMemberRepository)
        {
            _userRepository = userRepository;
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
            _commentRepository = commentRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        // User CRUD
        [HttpGet("users")]
        public IActionResult GetUsers() => Ok(_userRepository.GetAllUsers().Select(UserDto.FromModel));

        [HttpPost("users/add")]
        public IActionResult AddUser([FromBody] AddUserRequest request)
        {
            if (_userRepository.EmailExists(request.Email))
            {
                return BadRequest(new { success = false, message = "Email already exists." });
            }

            var user = new UserModel
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = AuthService.HashPassword(request.Password),
                Role = request.Role,
                VerifyKey = request.VerifyKey
            };

            _userRepository.Register(user);
            return Ok(new { success = true, message = "User added successfully.", user = UserDto.FromModel(user) });
        }

        [HttpPut("users/update")]
        public IActionResult UpdateUser([FromBody] UpdateUserRequest request)
        {
            var user = _userRepository.GetUserById(request.UserID);
            if (user == null) return NotFound(new { success = false, message = "User not found." });

            if (request.Field == "FullName") user.FullName = request.Value;
            if (request.Field == "Role") user.Role = request.Value;

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

        // List CRUD
        [HttpGet("lists")]
        public IActionResult GetLists() => Ok(_listRepository.GetAllLists());

        [HttpPost("lists/add")]
        public IActionResult AddList([FromBody] AddListRequest request)
        {
            var board = _boardRepository.GetBoardById(request.BoardID);
            if (board == null)
            {
                return NotFound(new { success = false, message = "BoardID does not exist." });
            }

            var list = new ListModel
            {
                ListName = request.ListName,
                BoardID = request.BoardID
            };

            _listRepository.AddList(list);
            return Ok(new { success = true, message = "List added successfully.", list = list });
        }

        [HttpPut("lists/update")]
        public IActionResult UpdateList([FromBody] UpdateListRequest request)
        {
            var list = _listRepository.GetListById(request.ListID);
            if (list == null) return NotFound(new { success = false, message = "List not found." });

            list.ListName = request.ListName;
            _listRepository.UpdateList(list);
            return Ok(new { success = true, message = "List updated successfully.", list = list });
        }

        [HttpDelete("lists/delete/{listId}")]
        public IActionResult DeleteList(int listId)
        {
            var list = _listRepository.GetListById(listId);
            if (list == null) return NotFound(new { success = false, message = "List not found." });

            _listRepository.DeleteList(listId);
            return Ok(new { success = true, message = "List deleted successfully." });
        }

        // Card CRUD
        [HttpGet("cards")]
        public IActionResult GetCards() => Ok(_cardRepository.GetAllCards());

        [HttpPost("cards/add")]
        public IActionResult AddCard([FromBody] AddCardRequest request)
        {
            var list = _listRepository.GetListById(request.ListID);
            if (list == null)
            {
                return NotFound(new { success = false, message = "ListID does not exist." });
            }

            var card = new CardModel
            {
                CardName = request.CardName,
                ListID = request.ListID,
                Status = request.Status
            };

            _cardRepository.AddCard(card);
            return Ok(new { success = true, message = "Card added successfully.", card = card });
        }

        [HttpPut("cards/update")]
        public IActionResult UpdateCard([FromBody] UpdateCardRequest request)
        {
            var card = _cardRepository.GetCardById(request.CardID);
            if (card == null) return NotFound(new { success = false, message = "Card not found." });

            if (request.Field == "CardName") card.CardName = request.Value;
            if (request.Field == "Status") card.Status = request.Value;

            _cardRepository.UpdateCard(card);
            return Ok(new { success = true, message = "Card updated successfully.", card = card });
        }

        [HttpDelete("cards/delete/{cardId}")]
        public IActionResult DeleteCard(int cardId)
        {
            var card = _cardRepository.GetCardById(cardId);
            if (card == null) return NotFound(new { success = false, message = "Card not found." });

            _cardRepository.DeleteCard(cardId);
            return Ok(new { success = true, message = "Card deleted successfully." });
        }

        // Comment CRUD
        [HttpGet("comments")]
        public IActionResult GetComments() => Ok(_commentRepository.GetAllComments());

        [HttpPost("comments/add")]
        public IActionResult AddComment([FromBody] AddCommentRequest request)
        {
            var card = _cardRepository.GetCardById(request.CardID);
            if (card == null)
            {
                return NotFound(new { success = false, message = "CardID does not exist." });
            }

            var user = _userRepository.GetUserById(request.UserID);
            if (user == null)
            {
                return NotFound(new { success = false, message = "UserID does not exist." });
            }

            var comment = new CommentModel
            {
                CardID = request.CardID,
                UserID = request.UserID,
                Content = request.Content
            };

            _commentRepository.CreateComment(comment);
            return Ok(new { success = true, message = "Comment added successfully.", comment = comment });
        }

        [HttpPut("comments/update")]
        public IActionResult UpdateComment([FromBody] UpdateCommentRequest request)
        {
            var comment = _commentRepository.GetCommentById(request.CommentID);
            if (comment == null) return NotFound(new { success = false, message = "Comment not found." });

            comment.Content = request.Content;
            _commentRepository.UpdateComment(comment);
            return Ok(new { success = true, message = "Comment updated successfully.", comment = comment });
        }

        [HttpDelete("comments/delete/{commentId}")]
        public IActionResult DeleteComment(int commentId)
        {
            var comment = _commentRepository.GetCommentById(commentId);
            if (comment == null) return NotFound(new { success = false, message = "Comment not found." });

            _commentRepository.DeleteComment(commentId);
            return Ok(new { success = true, message = "Comment deleted successfully." });
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
