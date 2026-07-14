using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskieWNC.Models;

namespace TaskieWNC.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/list")]
    public class ListController : BaseController
    {
        private readonly BoardRepository _boardRepository;
        private readonly ListRepository _listRepository;
        private readonly CardRepository _cardRepository;
        private readonly ILogger<ListController> _logger;

        public ListController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            ListRepository listRepository,
            CardRepository cardRepository,
            ILogger<ListController> logger) : base(userRepository)
        {
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
            _logger = logger;
        }

        [HttpGet("board/{boardID}")]
        public IActionResult GetLists(int boardID)
        {
            if (!TryGetUserId(out int userId))
            {
                return Unauthorized(new { success = false, message = "User not logged in." });
            }

            if (!_boardRepository.HasBoardAccess(boardID, userId))
            {
                return Forbid();
            }

            var lists = _listRepository.GetListsByBoardId(boardID)
                                      .OrderBy(l => l.Position)
                                      .ToList();

            var listsWithCards = lists.Select(list => new
            {
                list.ListID,
                list.ListName,
                list.Position,
                Cards = _cardRepository.GetCardsByListId(list.ListID)
            }).ToList();

            return Ok(new { success = true, lists = listsWithCards });
        }

        [HttpPost("add")]
        public IActionResult Add([FromBody] AddListRequest request)
        {
            try
            {
                if (!UserCanEdit(request.BoardId))
                {
                    return Forbid();
                }

                var list = new ListModel
                {
                    ListName = request.ListName ?? "Unknown Listname",
                    BoardID = request.BoardId,
                    Position = request.Position
                };

                _listRepository.AddList(list);

                return Ok(new { success = true, message = "List added successfully!", list = list });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add a list to board {BoardId}", request.BoardId);
                return StatusCode(500, new { success = false, message = "Unable to add the list right now." });
            }
        }

        [HttpDelete("delete/{listId}")]
        public IActionResult Delete(int listId)
        {
            try
            {
                var list = _listRepository.GetListById(listId);
                if (list == null)
                    return NotFound(new { success = false, message = "List not found." });

                if (!UserCanEdit(list.BoardID))
                    return Forbid();

                _listRepository.DeleteList(listId);
                return Ok(new { success = true, message = "List deleted successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete list {ListId}", listId);
                return StatusCode(500, new { success = false, message = "Unable to delete the list right now." });
            }
        }

        [HttpPut("update-name")]
        public IActionResult UpdateName([FromBody] UpdateListNameRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.ListName))
            {
                return BadRequest(new { success = false, message = "List name cannot be empty." });
            }

            try
            {
                var list = _listRepository.GetListById(request.ListID);
                if (list == null)
                {
                    return NotFound(new { success = false, message = "List not found." });
                }

                if (!UserCanEdit(list.BoardID))
                {
                    return Forbid();
                }

                list.ListName = request.ListName;
                _listRepository.UpdateList(list);

                return Ok(new { success = true, message = "List name updated successfully.", list = list });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update list {ListId} name", request.ListID);
                return StatusCode(500, new { success = false, message = "Unable to update the list right now." });
            }
        }

        [HttpPut("update-positions")]
        public IActionResult UpdatePositions([FromBody] List<ListPositionUpdate> updates)
        {
            if (updates == null || !updates.Any())
            {
                return BadRequest(new { success = false, message = "No position updates provided." });
            }

            try
            {
                var firstListId = updates.First().ListID;
                var firstList = _listRepository.GetListById(firstListId);

                if (firstList == null)
                {
                    return NotFound(new { success = false, message = "List not found." });
                }

                if (!UserCanEdit(firstList.BoardID))
                {
                    return Forbid();
                }

                var listsToUpdate = new List<ListModel>();
                foreach (var update in updates)
                {
                    var list = _listRepository.GetListById(update.ListID);
                    if (list == null)
                    {
                        return NotFound(new { success = false, message = $"List {update.ListID} was not found." });
                    }

                    if (list.BoardID != firstList.BoardID)
                    {
                        return BadRequest(new { success = false, message = "All lists must belong to the same board." });
                    }

                    listsToUpdate.Add(list);
                }

                _listRepository.UpdatePositions(
                    listsToUpdate.Zip(updates, (list, update) => (list, update.Position)));

                return Ok(new { success = true, message = "List positions updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update list positions");
                return StatusCode(500, new { success = false, message = "Unable to reorder lists right now." });
            }
        }

        private bool UserCanEdit(int boardId)
        {
            if (!TryGetUserId(out int userId))
            {
                return false;
            }

            return _boardRepository.CanEditBoardContent(boardId, userId);
        }

        public class AddListRequest
        {
            public string? ListName { get; set; }
            public int BoardId { get; set; }
            public int Position { get; set; }
        }

        public class ListPositionUpdate
        {
            public int ListID { get; set; }
            public int Position { get; set; }
        }

        public class UpdateListNameRequest
        {
            public int ListID { get; set; }
            public string? ListName { get; set; }
        }
    }
}
