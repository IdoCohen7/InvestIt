namespace InvestItAPI.DTO
{
    public class ExpertUpdateRequest
    {
        public int UserId { get; set; }
        public string ExpertiseArea { get; set; }
        public decimal Price { get; set; }
        public bool AvailableForChat { get; set; }
    }
}
