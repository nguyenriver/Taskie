namespace TaskieWNC.Models
{
    public static class SystemRoles
    {
        public const string User = "User";
        public const string Admin = "Admin";

        public static bool TryNormalize(string? role, out string normalizedRole)
        {
            if (string.Equals(role?.Trim(), User, StringComparison.OrdinalIgnoreCase))
            {
                normalizedRole = User;
                return true;
            }

            if (string.Equals(role?.Trim(), Admin, StringComparison.OrdinalIgnoreCase))
            {
                normalizedRole = Admin;
                return true;
            }

            normalizedRole = string.Empty;
            return false;
        }
    }
}
