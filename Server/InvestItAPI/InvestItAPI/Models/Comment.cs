using InvestItAPI.DAL;
using System.Diagnostics.Eventing.Reader;

namespace InvestItAPI.Models
{
    public class Comment
    {

        public int CommentId { get; set; }
        public int PostId { get; set; }
        public int UserId { get; set; }

        public string Content { get; set; }
        public string CreatedAt { get; set; }

        public Comment(int commentId, int postId, int userId, string content, string createdAt)
        {
            CommentId = commentId;
            PostId = postId;
            UserId = userId;
            Content = content;
            CreatedAt = createdAt;
        }

        public Comment() { }

        public static bool AddComment(Comment comment)
        {
            DBservices dBservices = new DBservices();
            return dBservices.AddComment(comment.PostId, comment.UserId, comment.Content);
        }

        public static List<object> GetAllComments(int postId, int page, int pageSize)
        {
            DBservices dBservices = new DBservices();
            return dBservices.GetAllComments(postId, page, pageSize);
        }

        public static bool DeleteComment(int commentId)
        {
            DBservices dBservices = new DBservices();
            return dBservices.DeleteComment(commentId);
        }

    }
}
