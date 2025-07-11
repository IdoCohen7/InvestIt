using InvestItAPI.DAL;
using InvestItAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InvestItAPI.Tools
{
    public class PostMaintenanceTool
    {
        public static async Task RunCategoryClassificationAsync()
        {
            DBservices db = new DBservices();
            List<Post> posts = db.GetPostsWithoutCategory();

            Console.WriteLine($"🔎 Found {posts.Count} posts without category. Starting classification...");

            foreach (var post in posts)
            {
                try
                {
                    HuggingFaceClassifier classifer = new HuggingFaceClassifier();
                    string category = await classifer.ClassifyTextAsync(post.Content);
                    bool updated = db.UpdatePostCategory(post.PostId, category);

                    if (updated)
                        Console.WriteLine($"Post {post.PostId} classified as \"{category}\" and updated successfully.");
                    else
                        Console.WriteLine($"Failed to update post {post.PostId}.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing post {post.PostId}: {ex.Message}");
                }
            }

            Console.WriteLine("Category classification maintenance completed.");
        }
    }
}
