using InvestItAPI.DAL;
using InvestItAPI.Tools;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json.Serialization;

namespace InvestItAPI.Models
{
    public class Post
    {
        public int PostId { get; set; } 
        public int UserId { get; set; } 
        public string Content { get; set; } 
        public string CreatedAt { get; set; }
        public double SimilarityScore { get; set; } // runtime variable, not saved in DB
        public string Vector { get; set; } // nullable
        public string UpdatedAt { get; set; }

        public Post(int postId, int userId, string content, string createdAt, string updatedAt)
        {
            PostId = postId;
            UserId = userId;
            Content = content;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
        }

        public Post() { }

        public static List<object> GetPosts(int userId, int page, int pageSize)
        {
            DBservices dBservices = new DBservices();
            return dBservices.GetPosts(userId, page, pageSize);
        }



        static public int AddPost(Post post)
        {
            DBservices dbServices = new DBservices();

            //  מחשבים את הווקטור מהתוכן לפני השמירה
            post.Vector = PostService.updatePostVector(post.Content);

            return dbServices.AddPost(post); //  שמירת הפוסט עם הווקטור במסד הנתונים
        }

        static public float[] GetVector(string text)
        {
            return VectorHelper.ConvertTextToVector(text);
        }

        static public bool UpdatePostContent(int postId, int userId, string content)
        {
            DBservices dBservices = new DBservices();
            return dBservices.UpdatePostContent(postId, userId, content);
        }

        static public bool DeletePost(int postId, int userId)
        {
            DBservices dBservices = new DBservices();
            return dBservices.DeletePost(postId, userId);
        }

        static public string TogglePostLike(int postId, int userId)
        {
            DBservices dBservices = new DBservices();
            return dBservices.TogglePostLike(postId, userId);
        }

        public static List<object> GetPostsOfUser(int page, int pageSize, int userId, int profileUserId)
        {
            DBservices dBservices = new DBservices();
            return dBservices.GetPostsOfUser(page, pageSize, userId, profileUserId);
        }

    }
}