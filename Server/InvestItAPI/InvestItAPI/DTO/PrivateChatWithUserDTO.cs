namespace InvestItAPI.DTO
{
    public class PrivateChatWithUserDto
    {
        public Guid Id { get; set; }
        public int OtherUserId { get; set; }
        public string OtherUserName { get; set; }
        public string? OtherUserProfilePic { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
