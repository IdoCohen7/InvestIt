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
            cmd.Parameters.AddWithValue("@profile_pic", (object?)user.ProfilePic ?? DBNull.Value);
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





        public List<object> GetPosts()
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת חיבור
                cmd = CreateCommandWithStoredProcedureNoParameters("SP_GetAllPosts", con); // קריאה ל-SP

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
    ? Convert.ToDateTime(dataReader["updated_at"]).ToString("o") // ISO 8601 format
    : null,

                        Vector = dataReader["post_vector"] != DBNull.Value
                            ? dataReader["post_vector"].ToString()
                            : null,
                        LikesCount = Convert.ToInt32(dataReader["likesCount"]),
                        CommentsCount = Convert.ToInt32(dataReader["commentsCount"]),
                        FullName = dataReader["fullName"].ToString(),
                        UserProfilePic = dataReader["userProfilePic"].ToString(),
                        UserExperienceLevel = dataReader["userExperienceLevel"].ToString()
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
                con = connect("myProjDB"); // create the connection
                cmd = CreateCommandWithStoredProcedure_Email("SP_Login", con, email); // create the command

                User u = new User();

                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (dataReader.Read())
                {
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
                // write to log
                throw new Exception("Couldn't retrieve any user", ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
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

        public List<object> GetAllComments(int postId)
        {
            SqlConnection con = null;
            List<object> comments = new List<object>();

            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("SP_GetAllComments", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@postId", postId);

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

        public bool IsFollowing(int followerId, int followingId)
        {
            SqlConnection con = null;

            try
            {
                con = connect("myProjDB");
                SqlCommand cmd = new SqlCommand("SP_IsFollowing", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@follower_id", followerId);
                cmd.Parameters.AddWithValue("@following_id", followingId);

                object result = cmd.ExecuteScalar();

                return result != null && Convert.ToBoolean(result);
            }
            catch (Exception ex)
            {
                throw new Exception("Error checking follow status: " + ex.Message);
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




    }
}
