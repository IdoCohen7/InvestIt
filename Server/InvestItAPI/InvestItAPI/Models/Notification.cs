using InvestItAPI.DAL;

namespace InvestItAPI.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }     
        public int UserId { get; set; }             
        public int ActorId { get; set; }            
        public string ActorName { get; set; }        
        public int ObjectId { get; set; }            
        public string Type { get; set; }           
        public bool IsRead { get; set; }         
        public string CreatedAt { get; set; }
        public string ActorProfilePic { get; set; }

        public Notification()
        {
        }

        static public List<Notification> GetUserNotifications(int userId, int page, int pageSize)
        {
            DBservices dBservices = new DBservices();
            return dBservices.GetUserNotifications(userId, page, pageSize);
        }

        static public int GetNumberOfUnreadNotifications(int userId)
        {
            DBservices dBServices = new DBservices();
            return dBServices.GetNumberOfUnreadNotifications(userId);   
        }

        static public void MarkNotificationsAsRead(int userId)
        {
            DBservices dBservices = new DBservices();    
            dBservices.MarkNotificationsAsRead(userId);

        }
    }

   
}
