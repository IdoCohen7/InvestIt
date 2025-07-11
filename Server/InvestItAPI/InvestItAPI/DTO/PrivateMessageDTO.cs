namespace InvestItAPI.DTO
{
    public class PrivateMessageDTO
    {
        public Guid Id { get; set; }
        public Guid ChatId { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
    }

}
