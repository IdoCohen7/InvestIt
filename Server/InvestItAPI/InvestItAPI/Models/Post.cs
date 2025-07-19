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
        public string UpdatedAt { get; set; }
        public string? Img { get; set; }
        public string? Category { get; set; }



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

        public static List<object> GetPersonalizedFeed(int userId, int page, int pageSize)
        {
            DBservices dBservices = new DBservices();
            return dBservices.GetPersonalizedFeed(userId, page, pageSize);
        }


        public static List<object> GetFollowedPosts(int userId, int page, int pageSize)
        {
            DBservices dBservices = new DBservices();
            return dBservices.GetFollowedPosts(userId, page, pageSize);
        }


        static public int AddPost(Post post)
        {
            DBservices dbServices = new DBservices();
            HuggingFaceClassifier classifer = new HuggingFaceClassifier();
            post.Category = classifer.ClassifyTextAsync(post.Content).Result;

            return dbServices.AddPost(post);
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

        public static bool SetImage(int postId, string imgPath)
        {
            DBservices dBservices = new DBservices();
            return dBservices.UpdatePostImage(postId, imgPath);
        }


    }
}