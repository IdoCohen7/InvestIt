using InvestItAPI.DAL;
using InvestItAPI.Tools;


namespace InvestItAPI.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? ProfilePic { get; set; }
        public string? ExperienceLevel { get; set; }
        public string? Bio { get; set; }
        public string CreatedAt { get; set; }
        public Boolean IsActive { get; set; }
        public int? Connections { get; set; }
        public string? Location { get; set; }

        public User(int userId, string firstName, string lastName, string email, string passwordHash, string? profilePic, string? experienceLevel, string? bio, string createdAt)
        {
            UserId = userId;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            PasswordHash = passwordHash;
            ProfilePic = profilePic;
            ExperienceLevel = experienceLevel;
            Bio = bio;
            CreatedAt = createdAt;
            IsActive = true;
            Connections = 0;
            Location = null;
        }

        public User() { }

        static public List<Object> GetUsers()
        {
            DBservices dBservices = new DBservices();
            return dBservices.GetUsers();
        }

        static public User? RegisterUser(User user)
        {
            DBservices dBservices = new DBservices();
            user.PasswordHash = PasswordHasher.HashPassword(user.PasswordHash);

            string body = @"
    <html dir='rtl'>
    <head>
     <meta charset='UTF-8'>
    <style>
    body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    padding: 20px;
    direction: rtl;
    }
   .container {
    max-width: 600px;
    margin: auto;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    text-align: right;
      }
    h2 {
    color: #4CAF50;
     }
       p {
    font-size: 16px;
    color: #333;
    }
.btn {
    display: inline-block;
    background: #4CAF50;
    color: white;
    text-decoration: none;
    padding: 12px 20px;
    border-radius: 5px;
    font-weight: bold;
    margin-top: 10px;
      }
.btn:hover {
    background: #388E3C;
       }
.footer {
    font-size: 12px;
    text-align: center;
    margin-top: 20px;
    color: #666;
    }
 </style>
  </head>
<body>
 <div class='container'>
    <h2>!InvestIt ברוך הבא לפלטפורמת</h2>
    <p>.תודה שנרשמת! אנחנו שמחים לראות אותך בפלטפורמה שלנו</p>
     
  <p class='footer'> .2024 InvestIt, כל הזכויות שמורות ©</p>
</div>
</body>
    </html>";

            User? registeredUser = dBservices.Register(user);

            if (registeredUser != null)
            {
                
                EmailService emailService = new EmailService();
                emailService.SendEmail(user.Email, "InvestIt Registration Complete!", body);
                
                return registeredUser;
            }

            return null;
        }


        static public User Login(string email, string password)
        {
            DBservices dBservices = new DBservices();
            User user = dBservices.Login(email, password);

            if (user != null && PasswordHasher.VerifyPassword(password, user.PasswordHash))
            {
                if (dBservices.IsExpert(user.UserId))
                {
                    user = dBservices.GetExpertByUserId(user.UserId);
                }

                return user;
            }
            return null;
        }



        static public int EditUser(User user)
        {
            DBservices dBservices = new DBservices();
            return dBservices.UpdateUser(user);
        }

        static public int DeleteUser(int userId)
        {
            DBservices dBservices = new DBservices();   
            return dBservices.DeleteUser(userId);
        }

        static public string ToggleFollow(int  followerId, int followingId) { 
            DBservices dBservices = new DBservices();
            return dBservices.ToggleFollow(followerId, followingId);
        }


        static public bool UploadProfilePic(string profilePic, int userId)
        {
            DBservices dbServices = new DBservices();
            return dbServices.UpdateProfilePic(userId, profilePic);
        }

        static public bool ChangePassword(int userId, string currentPassword, string newPassword)
        {
            DBservices dbServices = new DBservices();
            string currentHashedPassword = dbServices.GetPasswordHashByUserId(userId);
            if (currentHashedPassword != null && PasswordHasher.VerifyPassword(currentPassword, currentHashedPassword))
            {
                string newHashedPassword = PasswordHasher.HashPassword(newPassword);
                return dbServices.ChangePassword(userId, newHashedPassword);
            }
            return false;
        }

        public static (List<User> users, int totalCount) Search(string query, int page, int pageSize)
        {
            DBservices dBservices = new DBservices();
            return dBservices.SearchUsers(query, page, pageSize);
        }

        static public Object GetUserById(int userId, int viewerId)
        {
            DBservices dBservices = new DBservices ();
            return dBservices.GetUserById(userId, viewerId);
        }
    }
}
