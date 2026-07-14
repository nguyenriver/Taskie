using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskieWNC.Models;
using System.Globalization;

namespace TaskieWNC.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/card")]
    public class CardController : BaseController
    {
        private readonly CardRepository _cardRepository;
        private readonly ListRepository _listRepository;
        private readonly BoardRepository _boardRepository;
        private readonly CommentRepository _commentRepository;

        public CardController(
            UserRepository userRepository,
            CardRepository cardRepository,
            ListRepository listRepository,
            BoardRepository boardRepository,
            CommentRepository commentRepository) : base(userRepository)
        {
            _cardRepository = cardRepository;
            _listRepository = listRepository;
            _boardRepository = boardRepository;
            _commentRepository = commentRepository;
        }

        [HttpPost("add")]
        public IActionResult Add([FromBody] CardModel newCard)
        {
            if (newCard == null || string.IsNullOrEmpty(newCard.CardName))
            {
                return BadRequest(new { success = false, message = "Card name is required." });
            }

            if (newCard.Position <= 0)
            {
                var maxPosition = _cardRepository.GetCardsByListId(newCard.ListID)
                    .Select(c => c.Position)
                    .DefaultIfEmpty(0)
                    .Max();
                newCard.Position = maxPosition + 1;
            }

            _cardRepository.AddCard(newCard);
            return Ok(new { success = true, message = "Card added successfully!", card = newCard });
        }

        [HttpPut("update-status")]
        public IActionResult UpdateStatus([FromBody] UpdateCardStatusRequest request)
        {
            if (request == null || request.CardID <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return NotFound(new { success = false, message = "Card not found." });
                }

                card.Status = request.Status ?? "To Do";
                _cardRepository.UpdateCard(card);

                return Ok(new { success = true, message = "Card status updated successfully.", card = card });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error updating card status: {ex.Message}" });
            }
        }

        [HttpGet("{cardId}")]
        public IActionResult GetDetails(int cardId)
        {
            if (cardId <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                var card = _cardRepository.GetCardById(cardId);
                if (card == null)
                {
                    return NotFound(new { success = false, message = "Card not found." });
                }

                return Ok(new { success = true, card = card });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error fetching card details: {ex.Message}" });
            }
        }

        [HttpPut("update")]
        public IActionResult Update([FromBody] UpdateCardRequest request)
        {
            if (request == null || request.CardID <= 0 || string.IsNullOrEmpty(request.CardName))
            {
                return BadRequest(new { success = false, message = "Invalid card data." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return NotFound(new { success = false, message = "Card not found." });
                }

                card.CardName = request.CardName;
                card.Description = request.Description ?? string.Empty;
                card.Status = request.Status ?? "To Do";

                if (!string.IsNullOrEmpty(request.DueDate))
                {
                    card.DueDate = DateTime.Parse(request.DueDate, CultureInfo.InvariantCulture);
                }
                else
                {
                    card.DueDate = null;
                }

                _cardRepository.UpdateCard(card);
                return Ok(new { success = true, message = "Card updated successfully.", card = card });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error updating card: {ex.Message}" });
            }
        }

        [HttpDelete("delete/{cardId}")]
        public IActionResult Delete(int cardId)
        {
            if (cardId <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Unauthorized(new { success = false, message = "User not logged in." });
                }

                var card = _cardRepository.GetCardById(cardId);
                if (card == null)
                {
                    return NotFound(new { success = false, message = "Card not found." });
                }

                var list = _listRepository.GetListById(card.ListID);
                if (list == null)
                {
                    return NotFound(new { success = false, message = "List not found." });
                }

                var canEdit = _boardRepository.HasBoardAccess(list.BoardID, userId);
                if (!canEdit)
                {
                    return Forbid();
                }

                bool success = _cardRepository.DeleteCard(cardId);
                if (success)
                {
                    return Ok(new { success = true, message = "Card deleted successfully." });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Failed to delete card." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error deleting card: {ex.Message}" });
            }
        }

        [HttpGet("{cardId}/comments")]
        public IActionResult GetComments(int cardId)
        {
            if (cardId <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Unauthorized(new { success = false, message = "User not logged in." });
                }

                var comments = _commentRepository.GetCommentsByTaskId(cardId);

                var commentData = comments.Select(c => new
                {
                    commentID = c.CommentID,
                    content = c.Content,
                    createdAt = c.CreatedAt,
                    userName = c.User?.FullName ?? "Unknown User",
                    userInitial = c.User?.FullName.FirstOrDefault().ToString().ToUpper() ?? "U",
                    isCurrentUser = c.UserID == userId
                }).ToList();

                return Ok(new { success = true, comments = commentData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error fetching comments: {ex.Message}" });
            }
        }

        [HttpPost("{cardId}/comments/add")]
        public IActionResult AddComment(int cardId, [FromBody] AddCommentRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Content))
            {
                return BadRequest(new { success = false, message = "Invalid comment data." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Unauthorized(new { success = false, message = "User not logged in." });
                }

                var card = _cardRepository.GetCardById(cardId);
                if (card == null)
                {
                    return NotFound(new { success = false, message = "Card not found." });
                }

                var list = _listRepository.GetListById(card.ListID);
                if (list == null)
                {
                    return NotFound(new { success = false, message = "List not found." });
                }

                var userRole = _boardRepository.GetUserRoleInBoard(list.BoardID, userId);
                if (userRole != "Owner" && userRole != "Editor")
                {
                    return Forbid();
                }

                var comment = new CommentModel
                {
                    CardID = cardId,
                    UserID = userId,
                    Content = request.Content,
                    CreatedAt = DateTime.Now
                };

                _commentRepository.CreateComment(comment);
                var user = _userRepository.GetUserById(userId);

                return Ok(new
                {
                    success = true,
                    comment = new
                    {
                        commentID = comment.CommentID,
                        content = comment.Content,
                        createdAt = comment.CreatedAt,
                        userName = user?.FullName ?? "Unknown User",
                        userInitial = user?.FullName.FirstOrDefault().ToString().ToUpper() ?? "U",
                        isCurrentUser = true
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error adding comment: {ex.Message}" });
            }
        }

        [HttpDelete("comments/delete/{commentId}")]
        public IActionResult DeleteComment(int commentId)
        {
            if (commentId <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid comment ID." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Unauthorized(new { success = false, message = "User not logged in." });
                }

                var comment = _commentRepository.GetCommentById(commentId);
                if (comment == null)
                {
                    return NotFound(new { success = false, message = "Comment not found." });
                }

                var card = _cardRepository.GetCardById(comment.CardID);
                if (card == null)
                {
                    return NotFound(new { success = false, message = "Associated card not found." });
                }

                var list = _listRepository.GetListById(card.ListID);
                if (list == null)
                {
                    return NotFound(new { success = false, message = "Associated list not found." });
                }

                var userRole = _boardRepository.GetUserRoleInBoard(list.BoardID, userId);
                bool isCommentOwner = comment.UserID == userId;
                bool canEdit = userRole == "Owner" || userRole == "Editor";

                if (!isCommentOwner && !canEdit)
                {
                    return Forbid();
                }

                bool success = _commentRepository.DeleteComment(commentId);
                if (success)
                {
                    return Ok(new { success = true, message = "Comment deleted successfully." });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Failed to delete comment." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error deleting comment: {ex.Message}" });
            }
        }

        [HttpPut("move")]
        public IActionResult MoveToList([FromBody] MoveCardRequest request)
        {
            if (request == null || request.CardID <= 0 || request.ListID <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid request data." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return NotFound(new { success = false, message = "Card not found." });
                }

                var sourceList = _listRepository.GetListById(card.ListID);
                var targetList = _listRepository.GetListById(request.ListID);

                if (sourceList == null || targetList == null)
                {
                    return NotFound(new { success = false, message = "List not found." });
                }

                if (sourceList.BoardID != targetList.BoardID)
                {
                    return BadRequest(new { success = false, message = "Cannot move cards between different boards." });
                }

                if (!UserCanEdit(sourceList.BoardID))
                {
                    return Forbid();
                }

                card.ListID = request.ListID;

                int maxPosition = _cardRepository.GetCardsByListId(request.ListID)
                    .Select(c => c.Position)
                    .DefaultIfEmpty(-1)
                    .Max();

                card.Position = maxPosition + 1;
                _cardRepository.UpdateCard(card);

                return Ok(new { success = true, message = "Card moved successfully.", card = card });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error moving card: {ex.Message}" });
            }
        }

        [HttpPut("update-positions")]
        public IActionResult UpdatePositions([FromBody] List<CardPositionUpdate> updates)
        {
            if (updates == null || !updates.Any())
            {
                return BadRequest(new { success = false, message = "No position updates provided." });
            }

            try
            {
                var firstCardId = updates.First().CardID;
                var firstCard = _cardRepository.GetCardById(firstCardId);

                if (firstCard == null)
                {
                    return NotFound(new { success = false, message = "Card not found." });
                }

                var list = _listRepository.GetListById(firstCard.ListID);
                if (list == null)
                {
                    return NotFound(new { success = false, message = "List not found." });
                }

                if (!UserCanEdit(list.BoardID))
                {
                    return Forbid();
                }

                foreach (var update in updates)
                {
                    var card = _cardRepository.GetCardById(update.CardID);
                    if (card != null)
                    {
                        card.Position = update.Position;
                        _cardRepository.UpdateCard(card);
                    }
                }

                return Ok(new { success = true, message = "Card positions updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error updating card positions: {ex.Message}" });
            }
        }

        private bool UserCanEdit(int boardId)
        {
            if (!TryGetUserId(out int userId))
            {
                return false;
            }
            return _boardRepository.HasBoardAccess(boardId, userId);
        }

        public class CardPositionUpdate
        {
            public int CardID { get; set; }
            public int Position { get; set; }
        }

        public class MoveCardRequest
        {
            public int CardID { get; set; }
            public int ListID { get; set; }
        }

        public class AddCommentRequest
        {
            public string Content { get; set; } = string.Empty;
        }

        public class UpdateCardRequest
        {
            public int CardID { get; set; }
            public string? CardName { get; set; }
            public string? Description { get; set; }
            public string? DueDate { get; set; }
            public string? Status { get; set; }
        }

        public class UpdateCardStatusRequest
        {
            public int CardID { get; set; }
            public string? Status { get; set; }
        }
    }
}