using TaskieWNC.Models;

public class BoardRepository
{
    private readonly MyDbContext _dbContext;

    public BoardRepository(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public BoardModel? GetBoardById(int boardId)
    {
        return _dbContext.Boards.Find(boardId);
    }

    public List<BoardModel> GetAllBoards()
    {
        return _dbContext.Boards.ToList();
    }

    public BoardModel AddBoard(BoardModel board)
    {
        _dbContext.Boards.Add(board);
        _dbContext.SaveChanges();
        return board;
    }

    public BoardModel? UpdateBoard(BoardModel board)
    {
        var existingBoard = _dbContext.Boards.Find(board.BoardID);
        if (existingBoard != null)
        {
            _dbContext.Entry(existingBoard).CurrentValues.SetValues(board);
            _dbContext.SaveChanges();
        }
        return existingBoard;
    }

    public BoardModel? TransferOwnership(int boardId, int newOwnerId)
    {
        using var transaction = _dbContext.Database.BeginTransaction();
        var board = _dbContext.Boards.Find(boardId);
        if (board == null)
        {
            return null;
        }

        if (board.UserID == newOwnerId)
        {
            return board;
        }

        var previousOwnerId = board.UserID;
        var newOwnerMembership = _dbContext.BoardMembers
            .FirstOrDefault(member => member.BoardID == boardId && member.UserID == newOwnerId);
        if (newOwnerMembership != null)
        {
            _dbContext.BoardMembers.Remove(newOwnerMembership);
        }

        board.UserID = newOwnerId;

        var previousOwnerMembership = _dbContext.BoardMembers
            .FirstOrDefault(member => member.BoardID == boardId && member.UserID == previousOwnerId);
        if (previousOwnerMembership == null)
        {
            _dbContext.BoardMembers.Add(new BoardMemberModel
            {
                BoardID = boardId,
                UserID = previousOwnerId,
                Role = BoardRoles.Editor
            });
        }
        else
        {
            previousOwnerMembership.Role = BoardRoles.Editor;
        }

        _dbContext.SaveChanges();
        transaction.Commit();
        return board;
    }

    public bool DeleteBoard(int boardId)
    {
        var board = _dbContext.Boards.Find(boardId);
        if (board != null)
        {
            _dbContext.Boards.Remove(board);
            _dbContext.SaveChanges();
            return true;
        }
        return false;
    }

    public List<BoardModel> GetBoardsByUserId(int userId)
    {
        return _dbContext.Boards.Where(b => b.UserID == userId).ToList();
    }

    public List<BoardModel> GetBoards(int pageNumber, int pageSize)
    {
        return _dbContext.Boards
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
    // Add to BoardRepository.cs
    public bool HasBoardAccess(int boardId, int userId)
    {
        // Check if user is either the board owner or a board member
        var board = _dbContext.Boards.Find(boardId);
        if (board != null && board.UserID == userId)
        {
            return true; // User is the owner
        }

        // Check if user is a board member
        return _dbContext.BoardMembers.Any(bm => bm.BoardID == boardId && bm.UserID == userId);
    }

    public bool CanEditBoardContent(int boardId, int userId)
    {
        var board = _dbContext.Boards.Find(boardId);
        if (board != null && board.UserID == userId)
        {
            return true;
        }

        return _dbContext.BoardMembers.Any(bm =>
            bm.BoardID == boardId &&
            bm.UserID == userId &&
            bm.Role == BoardRoles.Editor);
    }

    public bool IsBoardOwner(int boardId, int userId)
    {
        return _dbContext.Boards.Any(board => board.BoardID == boardId && board.UserID == userId);
    }
    public List<BoardWithOwnerInfo> GetSharedBoardsByUserId(int userId)
    {
        // Find boards where the user is a member and include owner info
        return _dbContext.BoardMembers
            .Where(bm => bm.UserID == userId)
            .Join(_dbContext.Boards,
                bm => bm.BoardID,
                b => b.BoardID,
                (bm, b) => new { BoardMember = bm, Board = b })
            .Join(_dbContext.Users,
                joined => joined.Board.UserID,
                user => user.UserID,
                (joined, user) => new BoardWithOwnerInfo
                {
                    BoardID = joined.Board.BoardID,
                    BoardName = joined.Board.BoardName,
                    UserID = joined.Board.UserID,
                    CreatedAt = joined.Board.CreatedAt,
                    OwnerName = user.FullName,
                    OwnerEmail = user.Email
                })
            .ToList();
    }

    /// <summary>
    /// Gets the role of a user in a specific board
    /// </summary>
    /// <param name="boardId">The ID of the board</param>
    /// <param name="userId">The ID of the user</param>
    /// <returns>Role as a string, or null when the user has no access to the board.</returns>
    public string? GetUserRoleInBoard(int boardId, int userId)
    {
        // Check if the user is the owner of the board
        var board = GetBoardById(boardId);
        if (board != null && board.UserID == userId)
        {
            return BoardRoles.Owner;
        }

        // Check if user is a member with a specific role
        var membership = _dbContext.BoardMembers
            .FirstOrDefault(bm => bm.BoardID == boardId && bm.UserID == userId);

        if (membership != null)
        {
            return membership.Role;
        }

        // User has no role in this board
        return null;
    }

    public class BoardWithOwnerInfo
    {
        public int BoardID { get; set; }
        public string BoardName { get; set; } = string.Empty; // Initialize with empty string
        public int UserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public string OwnerName { get; set; } = string.Empty; // Initialize with empty string
        public string OwnerEmail { get; set; } = string.Empty; // Initialize with empty string
    }
}
