IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Comments_UserID'
      AND object_id = OBJECT_ID(N'dbo.Comments')
)
BEGIN
    CREATE INDEX IX_Comments_UserID ON dbo.Comments(UserID);
END
