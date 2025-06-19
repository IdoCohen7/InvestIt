using InvestItAPI.Models;
using System.Data;
using System.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Hosting;
using System.Text.Json;

namespace InvestItAPI.DAL
{
    public class DBservices
    {
        public SqlDataAdapter da;
        public DataTable dt;

        public DBservices()
        {
        }
        public SqlConnection connect(String conString)
        {

            // read the connection string from the configuration file
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }

        private SqlCommand CreateCommandWithStoredProcedureNoParameters(String spName, SqlConnection con)
        {

            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text


            return cmd;
        }

        private SqlCommand CreateCommandWithStoredProcedure_User(String spName, SqlConnection con, User user)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;          // stored procedure name
            cmd.CommandTimeout = 10;           // Time to wait for execution, default is 30 sec
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // set command type

            // Add parameters to the stored procedure
            cmd.Parameters.AddWithValue("@FirstName", user.FirstName);
            cmd.Parameters.AddWithValue("@LastName", user.LastName);
            cmd.Parameters.AddWithValue("@Email", user.Email);
            cmd.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
            cmd.Parameters.AddWithValue("@ProfilePic", (object?)user.ProfilePic ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@ExperienceLevel", (object?)user.ExperienceLevel ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Bio", (object?)user.Bio ?? DBNull.Value);

            return cmd;
        }

        private SqlCommand CreateCommandWithStoredProcedure_AddComment(string spName, SqlConnection con, int postId, int userId, string content)
        {
            SqlCommand cmd = new SqlCommand
            {
                Connection = con,
                CommandText = spName,
                CommandTimeout = 10,
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@post_id", postId);
            cmd.Parameters.AddWithValue("@user_id", userId);
            cmd.Parameters.AddWithValue("@content", content);

            return cmd;
        }

        private SqlCommand CreateCommandWithStoredProcedure_UserId(String spName, SqlConnection con, int userId)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;          // stored procedure name
            cmd.CommandTimeout = 10;           // Time to wait for execution, default is 30 sec
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // set command type

            // Add parameters to the stored procedure
            cmd.Parameters.AddWithValue("@user_id", userId);
            return cmd;
        }

        private SqlCommand CreateCommandWithStoredProcedure_UpdateUser(string spName, SqlConnection con, User user)
        {
            SqlCommand cmd = new SqlCommand
            {
                Connection = con,
                CommandText = spName,
                CommandTimeout = 10,
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@user_id", user.UserId);
            cmd.Parameters.AddWithValue("@firstName", user.FirstName);
            cmd.Parameters.AddWithValue("@lastName", user.LastName);
            cmd.Parameters.AddWithValue("@bio", (object?)user.Bio ?? DBNull.Value);

            return cmd;
        }

        private SqlCommand CreateCommandWithStoredProcedure_PostContent(String spName, SqlConnection con, String content, int postId, int userId)
        {

            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

            cmd.Parameters.AddWithValue("@post_id", postId);
            cmd.Parameters.AddWithValue("@new_content", content);
            cmd.Parameters.AddWithValue("@user_id", userId);

            return cmd;
        }


        private SqlCommand CreateCommandWithStoredProcedure_Post(string spName, SqlConnection con, Post post)
        {
            SqlCommand cmd = new SqlCommand
            {
                Connection = con,
                CommandText = spName,
                CommandTimeout = 10,
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.AddWithValue("@user_id", post.UserId);
            cmd.Parameters.AddWithValue("@content", post.Content);

            
            cmd.Parameters.Add("@post_vector", SqlDbType.NVarChar, -1).Value =
     (object?)post.Vector ?? DBNull.Value;

            return cmd;
        }


        private SqlCommand CreateCommandWithStoredProcedure_Email(String spName, SqlConnection con, string email)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;          // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

            // Add parameters with values
            cmd.Parameters.AddWithValue("@Email", email);

            return cmd;
        }


        public List<Object> GetUsers()
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = CreateCommandWithStoredProcedureNoParameters("SP_GetAllUsers", con);

                List<Object> users = new List<Object>();
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (dataReader.Read())
                {
                    bool isExpert = dataReader["expertise_area"] != DBNull.Value;

                    int userId = Convert.ToInt32(dataReader["user_id"]);
                    string firstName = dataReader["firstName"].ToString();
                    string lastName = dataReader["lastName"].ToString();
                    string email = dataReader["email"].ToString();
                    string passwordHash = dataReader["password_hash"].ToString();
                    string profilePic = dataReader["profile_pic"] != DBNull.Value ? dataReader["profile_pic"].ToString() : null;
                    string experienceLevel = dataReader["experience_level"] != DBNull.Value ? dataReader["experience_level"].ToString() : null;
                    string bio = dataReader["bio"] != DBNull.Value ? dataReader["bio"].ToString() : null;
                    string createdAt = Convert.ToDateTime(dataReader["created_at"]).ToString("dd/MM/yyyy");
                    bool isActive = Convert.ToBoolean(dataReader["isActive"]);

                    Object u;

                    if (isExpert)
                    {
                        Expert expert = new Expert
                        {
                            UserId = userId,
                            FirstName = firstName,
                            LastName = lastName,
                            Email = email,
                            PasswordHash = passwordHash,
                            ProfilePic = profilePic,
                            ExperienceLevel = experienceLevel,
                            Bio = bio,
                            CreatedAt = createdAt,
                            IsActive = isActive,

                            ExpertiseArea = dataReader["expertise_area"].ToString(),
                            Price = Convert.ToDecimal(dataReader["price"]),
                            AvailableForChat = Convert.ToBoolean(dataReader["available_for_chat"]),
                            Rating = float.Parse(dataReader["rating"].ToString())
                        };

                        u = expert;
                    }
                    else
                    {
                        u = new User
                        {
                            UserId = userId,
                            FirstName = firstName,
                            LastName = lastName,
                            Email = email,
                            PasswordHash = passwordHash,
                            ProfilePic = profilePic,
                            ExperienceLevel = experienceLevel,
                            Bio = bio,
                            CreatedAt = createdAt,
                            IsActive = isActive
                        };
                    }

                    users.Add(u);
                }

                return users;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving users: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public List<object> GetPosts(int userId, int page, int pageSize)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");

                cmd = new SqlCommand("SP_GetAllPosts", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Page", page);
                cmd.Parameters.AddWithValue("@PageSize", pageSize);
                cmd.Parameters.AddWithValue("@UserId", userId);

                List<object> posts = new List<object>();
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (dataReader.Read())
                {
                    var post = new
                    {
                        PostId = Convert.ToInt32(dataReader["post_id"]),
                        UserId = Convert.ToInt32(dataReader["user_id"]),
                        Content = dataReader["content"].ToString(),
                        CreatedAt = Convert.ToDateTime(dataReader["created_at"]).ToString("dd/MM/yyyy"),
                        UpdatedAt = dataReader["updated_at"] != DBNull.Value
                            ? Convert.ToDateTime(dataReader["updated_at"]).ToString("o")
                            : null,
                        Vector = dataReader["post_vector"] != DBNull.Value ? dataReader["post_vector"].ToString() : null,
                        LikesCount = Convert.ToInt32(dataReader["likesCount"]),
                        CommentsCount = Convert.ToInt32(dataReader["commentsCount"]),
                        FullName = dataReader["fullName"].ToString(),
                        UserProfilePic = dataReader["userProfilePic"].ToString(),
                        UserExperienceLevel = dataReader["userExperienceLevel"].ToString(),
                        HasLiked = Convert.ToBoolean(dataReader["hasLiked"]),
                        IsExpert = Convert.ToBoolean(dataReader["isExpert"]) // 🆕 חדש!
                    };

                    posts.Add(post);
                }

                return posts;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while retrieving posts", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        public List<object> GetFollowedPosts(int userId, int page, int pageSize)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");

                cmd = new SqlCommand("SP_GetAllPostsByFollowedUsers", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Page", page);
                cmd.Parameters.AddWithValue("@PageSize", pageSize);
                cmd.Parameters.AddWithValue("@UserId", userId);

                List<object> posts = new List<object>();
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (dataReader.Read())
                {
                    var post = new
                    {
                        PostId = Convert.ToInt32(dataReader["post_id"]),
                        UserId = Convert.ToInt32(dataReader["user_id"]),
                        Content = dataReader["content"].ToString(),
                        CreatedAt = Convert.ToDateTime(dataReader["created_at"]).ToString("dd/MM/yyyy"),
                        UpdatedAt = dataReader["updated_at"] != DBNull.Value
                            ? Convert.ToDateTime(dataReader["updated_at"]).ToString("o")
                            : null,
                        Vector = dataReader["post_vector"] != DBNull.Value ? dataReader["post_vector"].ToString() : null,
                        LikesCount = Convert.ToInt32(dataReader["likesCount"]),
                        CommentsCount = Convert.ToInt32(dataReader["commentsCount"]),
                        FullName = dataReader["fullName"].ToString(),
                        UserProfilePic = dataReader["userProfilePic"].ToString(),
                        UserExperienceLevel = dataReader["userExperienceLevel"].ToString(),
                        HasLiked = Convert.ToBoolean(dataReader["hasLiked"]),
                        IsExpert = Convert.ToBoolean(dataReader["isExpert"])
                    };

                    posts.Add(post);
                }

                return posts;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while retrieving followed posts", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }



        public User? Register(User user)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = CreateCommandWithStoredProcedure_User("SP_Register", con, user);

                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.HasRows && reader.Read())
                {
                    User newUser = new User
                    {
                        UserId = Convert.ToInt32(reader["user_id"]),
                        FirstName = reader["firstName"].ToString(),
                        LastName = reader["lastName"].ToString(),
                        Email = reader["email"].ToString(),
                        PasswordHash = reader["password_hash"].ToString(),
                        ProfilePic = reader["profile_pic"] != DBNull.Value ? reader["profile_pic"].ToString() : null,
                        ExperienceLevel = reader["experience_level"] != DBNull.Value ? reader["experience_level"].ToString() : null,
                        Bio = reader["bio"] != DBNull.Value ? reader["bio"].ToString() : null,
                        CreatedAt = Convert.ToDateTime(reader["created_at"]).ToString("dd/MM/yyyy"),
                        IsActive = true
                    };

                    reader.Close();
                    return newUser;
                }

                reader.Close();
                return null; // אם לא התקבל משתמש – ייתכן שהאימייל כבר קיים
            }
            catch (SqlException ex)
            {
                if (ex.Message.Contains("Email already exists"))
                {
                    return null;
                }

                throw new Exception("SQL error during registration: " + ex.Message);
            }
            catch (Exception ex)
            {
                throw new Exception("Couldn't register user", ex);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }


        public User Login(string email, string password)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = CreateCommandWithStoredProcedure_Email("SP_Login", con, email);
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                User u = null;

                while (dataReader.Read())
                {
                    // אם יש ערכים לעמודות של מומחה, ניצור Expert
                    bool isExpert = !(dataReader.IsDBNull(dataReader.GetOrdinal("expertise_area")));

                    if (isExpert)
                    {
                        var expert = new Expert();
                        expert.ExpertiseArea = dataReader["expertise_area"].ToString();
                        expert.Price = Convert.ToDecimal(dataReader["price"]);
                        expert.AvailableForChat = Convert.ToBoolean(dataReader["available_for_chat"]);
                        expert.Rating = float.Parse(dataReader["rating"].ToString());
                        u = expert;
                    }
                    else
                    {
                        u = new User();
                    }

                    u.UserId = Convert.ToInt32(dataReader["user_id"]);
                    u.FirstName = dataReader["firstName"].ToString();
                    u.LastName = dataReader["lastName"].ToString();
                    u.Email = dataReader["email"].ToString();
                    u.PasswordHash = dataReader["password_hash"].ToString();
                    u.ProfilePic = dataReader["profile_pic"].ToString();
                    u.ExperienceLevel = dataReader["experience_level"].ToString();
                    u.Bio = dataReader["bio"].ToString();
                    u.CreatedAt = Convert.ToDateTime(dataReader["created_at"]).ToString("dd/MM/yyyy");
                    u.IsActive = Convert.ToBoolean(dataReader["isActive"]);
                }

                return u;
            }
            catch (Exception ex)
            {
                throw new Exception("Couldn't retrieve any user", ex);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }


        public int AddPost(Post post)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת חיבור
                cmd = CreateCommandWithStoredProcedure_Post("SP_AddPost", con, post); // יצירת פקודה

                Console.WriteLine($"📢 Adding post: UserId={post.UserId}, Content={post.Content}");

                object result = cmd.ExecuteScalar(); // מחזיר את ה-`post_id`

                if (result == null || result == DBNull.Value)
                {
                    throw new Exception("❌ Failed to retrieve post ID.");
                }

                int postId = Convert.ToInt32(result);
                Console.WriteLine($"✅ Post added successfully! ID: {postId}");

                return postId; // ✅ מחזיר את ה-`post_id`
            }
            catch (SqlException ex)
            {
                Console.WriteLine($"❌ SQL Exception: {ex.Message}");
                return -1;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ General Exception: {ex.Message}");
                throw new Exception("Couldn't add post", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        public int UpdateUser(User user)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת חיבור
                cmd = CreateCommandWithStoredProcedure_UpdateUser("SP_UpdateUser", con, user); // הכנת הפקודה

                object result = cmd.ExecuteScalar(); // מחזיר את מספר השורות שהושפעו

                if (result == null || Convert.ToInt32(result) == 0)
                {
                    return -1; // לא בוצע עדכון (אולי המשתמש לא קיים)
                }

                return 1; // הצלחה
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating user: {ex.Message}");
                return -1;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }
        public int DeleteUser(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = CreateCommandWithStoredProcedure_UserId("SP_DeleteUser", con, userId);

                object result = cmd.ExecuteScalar(); 

                if (result == null || Convert.ToInt32(result) == 0)
                {
                    return -1;
                }

                return 1; 
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Error deleting user: " + ex.Message);
                return -1;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        public bool UpdatePostContent(int postId, int userId, string newContent)
        {
            SqlConnection con = null;
            try
            {
                con = connect("myProjDB"); 
                SqlCommand cmd = CreateCommandWithStoredProcedure_PostContent("SP_UpdatePostContent", con, newContent, postId, userId);
                int affectedRows = cmd.ExecuteNonQuery();
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error updating post content: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public bool DeletePost(int postId, int userId)
        {
            SqlConnection con = null;
            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("SP_DeletePost", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@post_id", postId);
                cmd.Parameters.AddWithValue("@user_id", userId);

                int affectedRows = cmd.ExecuteNonQuery();
                return affectedRows > 0;
            }
            catch (SqlException ex)
            {
                if (ex.Number == 50000) 
                {
                   
                    return false; 
                }

                throw new Exception("SQL error deleting post: " + ex.Message);
            }
            catch (Exception ex)
            {
                throw new Exception("Error deleting post: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }


        public bool AddComment(int postId, int userId, string content)
        {
            SqlConnection con = null;

            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = CreateCommandWithStoredProcedure_AddComment("SP_AddComment", con, postId, userId, content);
                int affectedRows = cmd.ExecuteNonQuery();
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
       
                throw new Exception("Error adding comment: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public List<object> GetAllComments(int postId, int page, int pageSize)
        {
            SqlConnection con = null;
            List<object> comments = new List<object>();

            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("SP_GetAllComments", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@postId", postId);
                cmd.Parameters.AddWithValue("@Page", page);
                cmd.Parameters.AddWithValue("@PageSize", pageSize);

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    var comment = new
                    {
                        CommentId = (int)reader["comment_id"],
                        PostId = (int)reader["post_id"],
                        UserId = (int)reader["user_id"],
                        Content = reader["content"].ToString(),
                        CreatedAt = Convert.ToDateTime(reader["created_at"]).ToString("dd/MM/yyyy HH:mm"),
                        FirstName = reader["firstName"].ToString(),
                        LastName = reader["lastName"].ToString(),
                        ProfilePic = reader["profile_pic"] != DBNull.Value ? reader["profile_pic"].ToString() : null
                    };

                    comments.Add(comment);
                }

                reader.Close();
                return comments;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving comments: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }


        public bool DeleteComment(int commentId)
        {
            SqlConnection con = null;
            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("SP_DeleteComment", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@comment_id", commentId);

                int affectedRows = cmd.ExecuteNonQuery();
                return affectedRows > 0;
            }
            catch (Exception ex)
            {

                throw new Exception("Error deleting comment: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public bool IsExpert(int userId)
        {
            SqlConnection con = null;
            try
            {
                con = connect("myProjDB"); // שנה לפי הצורך
                SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM Experts WHERE user_id = @userId", con);
                cmd.Parameters.AddWithValue("@userId", userId);

                int count = (int)cmd.ExecuteScalar();
                return count > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error checking if user is expert: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public Expert GetExpertByUserId(int userId)
        {
            SqlConnection con = null;

            try
            {
                con = connect("myProjDB"); // זה שם ה-Connection String שלך
                SqlCommand cmd = new SqlCommand("SP_GetExpert", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@expert_id", userId);

                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    Expert expert = new Expert
                    {
                        UserId = (int)reader["user_id"],
                        FirstName = reader["firstName"].ToString(),
                        LastName = reader["lastName"].ToString(),
                        Email = reader["email"].ToString(),
                        PasswordHash = reader["password_hash"].ToString(),
                        ProfilePic = reader["profile_pic"] != DBNull.Value ? reader["profile_pic"].ToString() : null,
                        ExperienceLevel = reader["experience_level"] != DBNull.Value ? reader["experience_level"].ToString() : null,
                        Bio = reader["bio"] != DBNull.Value ? reader["bio"].ToString() : null,
                        CreatedAt = Convert.ToDateTime(reader["created_at"]).ToString("dd/MM/yyyy"),

                        ExpertiseArea = reader["expertise_area"].ToString(),
                        Price = (decimal)reader["price"],
                        AvailableForChat = (bool)reader["available_for_chat"],
                        Rating = float.Parse(reader["rating"].ToString())
                    };

                    reader.Close();
                    return expert;
                }

                reader.Close();
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving expert: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public string TogglePostLike(int postId, int userId)
        {
            SqlConnection con = null;

            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("SP_TogglePostLike", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@post_id", postId);
                cmd.Parameters.AddWithValue("@user_id", userId);

                object result = cmd.ExecuteScalar();

                return result != null ? result.ToString() : "unknown";
            }
            catch (Exception ex)
            {
                throw new Exception("Error toggling post like: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public string ToggleFollow(int followerId, int followingId)
        {
            SqlConnection con = null;

            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("SP_ToggleFollow", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@follower_id", followerId);
                cmd.Parameters.AddWithValue("@following_id", followingId);

                object result = cmd.ExecuteScalar();

                return result != null ? result.ToString() : "unknown";
            }
            catch (Exception ex)
            {
                throw new Exception("Error toggling follow: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        
        public bool UpdateProfilePic(int userId, string profilePicFileName)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = new SqlCommand("SP_UpdateProfilePic", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@user_id", userId);
                cmd.Parameters.AddWithValue("@profile_pic", profilePicFileName);

                int affected = cmd.ExecuteNonQuery();
                return affected > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error updating profile picture", ex);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public bool ChangePassword(int userId, string newPasswordHash)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); 
                cmd = new SqlCommand("SP_ChangePassword", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@user_id", userId);
                cmd.Parameters.AddWithValue("@new_password_hash", newPasswordHash);

                int affectedRows = cmd.ExecuteNonQuery();
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Error updating password", ex);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public string? GetPasswordHashByUserId(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = new SqlCommand("SELECT password_hash FROM Users WHERE user_id = @user_id", con);
                cmd.Parameters.AddWithValue("@user_id", userId);

                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    return reader["password_hash"].ToString();
                }

                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving password hash", ex);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public (List<User> users, int totalCount) SearchUsers(string query, int page, int pageSize)
        {
            List<User> users = new List<User>();
            int totalCount = 0;

            using SqlConnection con = connect("myProjDB");
            using SqlCommand cmd = new SqlCommand("SP_SearchUsersByName", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@query", query);
            cmd.Parameters.AddWithValue("@page", page);
            cmd.Parameters.AddWithValue("@pageSize", pageSize);

            using SqlDataReader reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                users.Add(new User
                {
                    UserId = Convert.ToInt32(reader["user_id"]),
                    FirstName = reader["firstName"].ToString(),
                    LastName = reader["lastName"].ToString(),
                    Email = reader["email"].ToString(),
                    PasswordHash = reader["password_hash"].ToString(),
                    ProfilePic = reader["profile_pic"]?.ToString(),
                    ExperienceLevel = reader["experience_level"]?.ToString(),
                    Bio = reader["bio"]?.ToString(),
                    CreatedAt = Convert.ToDateTime(reader["created_at"]).ToString("dd/MM/yyyy"),
                    IsActive = Convert.ToBoolean(reader["isActive"])
                });
            }

            if (reader.NextResult() && reader.Read())
            {
                totalCount = Convert.ToInt32(reader["totalCount"]);
            }

            return (users, totalCount);
        }

        public object GetUserById(int userId, int viewerId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = new SqlCommand("SP_GetUserById", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@userId", userId);
                cmd.Parameters.AddWithValue("@viewerId", viewerId);

                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return new
                    {
                        userId = Convert.ToInt32(reader["user_id"]),
                        firstName = reader["firstName"].ToString(),
                        lastName = reader["lastName"].ToString(),
                        email = reader["email"].ToString(),
                        profilePic = reader["profile_pic"].ToString(),
                        bio = reader["bio"].ToString(),
                        experienceLevel = reader["experience_level"].ToString(),
                        createdAt = Convert.ToDateTime(reader["created_at"]).ToString("yyyy-MM-dd"),
                        isActive = Convert.ToBoolean(reader["isActive"]),
                        expertiseArea = reader["expertise_area"]?.ToString(),
                        price = reader["price"] != DBNull.Value ? Convert.ToDecimal(reader["price"]) : (decimal?)null,
                        availableForChat = reader["available_for_chat"] != DBNull.Value ? Convert.ToBoolean(reader["available_for_chat"]) : (bool?)null,
                        rating = reader["rating"] != DBNull.Value ? Convert.ToDecimal(reader["rating"]) : (decimal?)null,
                        followersCount = Convert.ToInt32(reader["followersCount"]),
                        followingCount = Convert.ToInt32(reader["followingCount"]),
                        postsCount = Convert.ToInt32(reader["postsCount"]),
                        isFollowed = Convert.ToBoolean(reader["isFollowed"])
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving user details", ex);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public List<object> GetPostsOfUser(int page, int pageSize, int userId, int profileUserId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = new SqlCommand("SP_GetAllPostsOfUser", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Page", page);
                cmd.Parameters.AddWithValue("@PageSize", pageSize);
                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@ProfileUserId", profileUserId);

                List<object> posts = new List<object>();
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (reader.Read())
                {
                    var post = new
                    {
                        PostId = Convert.ToInt32(reader["post_id"]),
                        UserId = Convert.ToInt32(reader["user_id"]),
                        Content = reader["content"].ToString(),
                        CreatedAt = Convert.ToDateTime(reader["created_at"]).ToString("dd/MM/yyyy"),
                        UpdatedAt = reader["updated_at"] != DBNull.Value ? Convert.ToDateTime(reader["updated_at"]).ToString("o") : null,
                        Vector = reader["post_vector"] != DBNull.Value ? reader["post_vector"].ToString() : null,
                        LikesCount = Convert.ToInt32(reader["likesCount"]),
                        CommentsCount = Convert.ToInt32(reader["commentsCount"]),
                        FullName = reader["fullName"].ToString(),
                        UserProfilePic = reader["userProfilePic"].ToString(),
                        UserExperienceLevel = reader["userExperienceLevel"].ToString(),
                        HasLiked = Convert.ToBoolean(reader["hasLiked"])
                    };

                    posts.Add(post);
                }

                return posts;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving posts", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        public List<Notification> GetUserNotifications(int userId, int page, int pageSize)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = new SqlCommand("SP_GetUserNotifications", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@user_id", userId);
                cmd.Parameters.AddWithValue("@Page", page);
                cmd.Parameters.AddWithValue("@PageSize", pageSize);

                List<Notification> notifications = new List<Notification>();
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (reader.Read())
                {
                    Notification notification = new Notification
                    {
                        NotificationId = Convert.ToInt32(reader["notification_id"]),
                        UserId = Convert.ToInt32(reader["user_id"]),
                        ActorId = Convert.ToInt32(reader["actor_id"]),
                        ActorName = reader["actor_name"].ToString(),
                        ObjectId = Convert.ToInt32(reader["object_id"]),
                        Type = reader["type"].ToString(),
                        IsRead = Convert.ToBoolean(reader["is_read"]),
                        CreatedAt = Convert.ToDateTime(reader["created_at"]).ToString("yyyy-MM-dd HH:mm:ss"),
                        ActorProfilePic = reader["actor_profile_pic"]?.ToString()
                    };

                    notifications.Add(notification);
                }

                return notifications;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving notifications", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }
        public int GetNumberOfUnreadNotifications(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); 
                cmd = new SqlCommand("SP_GetNumberOfUnreadNotifications", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@user_id", userId);

                int count = (int)cmd.ExecuteScalar();
                return count;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving unread notifications count", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        public void MarkNotificationsAsRead(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = new SqlCommand("SP_ReadNotifications", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@user_id", userId);

                cmd.ExecuteNonQuery(); 
            }
            catch (Exception ex)
            {
                throw new Exception("Error marking notifications as read", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }
        public void UpdateExpert(int userId, string expertiseArea, decimal price, bool availableForChat)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
                cmd = new SqlCommand("SP_UpdateExpert", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@ExpertiseArea", expertiseArea);
                cmd.Parameters.AddWithValue("@Price", price);
                cmd.Parameters.AddWithValue("@AvailableForChat", availableForChat);
                cmd.ExecuteNonQuery(); 
            }
            catch (Exception ex)
            {
                throw new Exception("Error while updating expert details", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        public void CreateNotification(Notification notification)
        {
            SqlConnection con = null;

            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("SP_CreateNotification", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserId", notification.UserId);
                cmd.Parameters.AddWithValue("@IsRead", notification.IsRead);
                cmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                cmd.Parameters.AddWithValue("@ActorId", notification.ActorId);
                cmd.Parameters.AddWithValue("@ActorName", notification.ActorName);
                cmd.Parameters.AddWithValue("@ObjectId", notification.ObjectId);
                cmd.Parameters.AddWithValue("@Type", notification.Type);

                cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to insert notification", ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        public void InsertConsultation(int userId, int expertId)
        {
            SqlConnection con = null;

            try
            {
                con = connect("myProjDB"); // שם קונקשן סטרינג
                SqlCommand cmd = new SqlCommand("InsertConsultation", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@user_id", userId);
                cmd.Parameters.AddWithValue("@expert_id", expertId);

                cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                throw new Exception("Error inserting consultation: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        public int IsConsultationValid(int userId, int expertId)
        {
            SqlConnection con = null;

            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("CheckConsultationValidity", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@user_id", userId);
                cmd.Parameters.AddWithValue("@expert_id", expertId);

                object result = cmd.ExecuteScalar();

                if (result != null && result != DBNull.Value)
                {
                    return Convert.ToInt32(result); // נחזיר את הערך כפי שהוא (1 / -1 / 0)
                }

                return 0; // ברירת מחדל: אין ייעוץ כלל
            }
            catch (Exception ex)
            {
                throw new Exception("Error checking consultation validity: " + ex.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }







    }
}