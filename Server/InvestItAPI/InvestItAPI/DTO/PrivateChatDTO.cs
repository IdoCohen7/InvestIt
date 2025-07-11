namespace InvestItAPI.DTO
{
    public class PrivateChatDto
    {
        public Guid Id { get; set; }
        public int User1Id { get; set; }
        public int User2Id { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
