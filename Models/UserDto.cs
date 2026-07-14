namespace TaskieWNC.Models
{
    public sealed class UserDto
    {
        public int UserID { get; init; }
        public string Email { get; init; } = string.Empty;
        public string FullName { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public string Role { get; init; } = string.Empty;

        public static UserDto FromModel(UserModel user)
        {
            return new UserDto
            {
                UserID = user.UserID,
                Email = user.Email,
                FullName = user.FullName,
                CreatedAt = user.CreatedAt,
                Role = user.Role
            };
        }
    }
}
