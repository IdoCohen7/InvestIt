namespace InvestItAPI.DTO
{
    public class SendMessageRequest
    {
        public Guid ChatId { get; set; }
        public string Message { get; set; }
    }
}
