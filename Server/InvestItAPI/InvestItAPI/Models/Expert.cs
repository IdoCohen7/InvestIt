namespace InvestItAPI.Models
{
    public class Expert : User
    {
        public string ExpertiseArea { get; set; }
        public decimal Price { get; set; }
        public bool AvailableForChat { get; set; }
        public float Rating { get; set; }

        public Expert(string expertiseArea, decimal price, bool availableForChat, float rating)
        {
            ExpertiseArea = expertiseArea;
            Price = price;
            AvailableForChat = availableForChat;
            Rating = rating;
        }

        public Expert() { }
    }
}
