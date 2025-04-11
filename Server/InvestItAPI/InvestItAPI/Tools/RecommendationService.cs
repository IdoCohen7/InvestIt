using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Data.SqlClient;
using InvestItAPI.Models;

public class RecommendationService
{
    private readonly string connectionString = "YourConnectionString";

    public List<Post> GetRecommendedPosts(int userId)
    {
        List<Post> recommendedPosts = new List<Post>();

        using (var con = new SqlConnection(connectionString))
        {
            con.Open();

            // שליפת הווקטור של המשתמש
            var userCmd = new SqlCommand("SELECT user_vector FROM Users WHERE user_id = @userId", con);
            userCmd.Parameters.AddWithValue("@userId", userId);
            string userVectorJson = userCmd.ExecuteScalar()?.ToString();

            if (string.IsNullOrEmpty(userVectorJson))
                return recommendedPosts;

            float[] userVector = JsonSerializer.Deserialize<float[]>(userVectorJson);

            // שליפת כל הפוסטים
            var postCmd = new SqlCommand("SELECT post_id, user_id, content, created_at, post_vector FROM Posts", con);
            using (var reader = postCmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    int postId = reader.GetInt32(0);
                    int postUserId = reader.GetInt32(1);
                    string content = reader.GetString(2);
                    string createdAt = reader.GetDateTime(3).ToString("dd/MM/yyyy"); // ✅ המרה למחרוזת בפורמט הנכון
                    string postVectorJson = reader.IsDBNull(4) ? null : reader.GetString(4);

                    if (string.IsNullOrEmpty(postVectorJson))
                        continue;

                    float[] postVector = JsonSerializer.Deserialize<float[]>(postVectorJson);
                    double similarity = ComputeCosineSimilarity(userVector, postVector);

                    if (similarity > 0.5) // סף רלוונטיות
                    {
                        recommendedPosts.Add(new Post
                        {
                            PostId = postId,
                            UserId = postUserId,
                            Content = content,
                            CreatedAt = createdAt, // ✅ עכשיו זה מחרוזת
                            SimilarityScore = similarity
                        });
                    }
                }
            }
        }

        return recommendedPosts.OrderByDescending(p => p.SimilarityScore).ToList();
    }

    private double ComputeCosineSimilarity(float[] vectorA, float[] vectorB)
    {
        double dotProduct = vectorA.Zip(vectorB, (a, b) => a * b).Sum();
        double magnitudeA = Math.Sqrt(vectorA.Sum(a => a * a));
        double magnitudeB = Math.Sqrt(vectorB.Sum(b => b * b));

        return magnitudeA == 0 || magnitudeB == 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
    }
}
