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

        public ListController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            ListRepository listRepository,
            CardRepository cardRepository) : base(userRepository)
        {
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
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
                return StatusCode(500, new { success = false, message = $"Failed to add list: {ex.Message}" });
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
                return StatusCode(500, new { success = false, message = $"Failed to delete list: {ex.Message}" });
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
                return StatusCode(500, new { success = false, message = $"Error updating list name: {ex.Message}" });
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
                return StatusCode(500, new { success = false, message = $"Error updating list positions: {ex.Message}" });
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
