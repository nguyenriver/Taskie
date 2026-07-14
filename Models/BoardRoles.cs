namespace TaskieWNC.Models
{
    public static class BoardRoles
    {
        public const string Owner = "Owner";
        public const string Editor = "Editor";
        public const string Viewer = "Viewer";

        public static bool TryNormalizeMemberRole(string? role, out string normalizedRole)
        {
            if (string.Equals(role?.Trim(), Editor, StringComparison.OrdinalIgnoreCase))
            {
                normalizedRole = Editor;
                return true;
            }

            if (string.Equals(role?.Trim(), Viewer, StringComparison.OrdinalIgnoreCase))
            {
                normalizedRole = Viewer;
                return true;
            }

            normalizedRole = string.Empty;
            return false;
        }
    }
}
