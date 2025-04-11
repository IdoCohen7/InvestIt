using System.Text.Json;
using System.Data.SqlClient;

public class UserService
{
    private readonly string connectionString = "YourConnectionString";

    public void UpdateUserVector(int userId, string preferences)
    {
        float[] vector = VectorHelper.ConvertTextToVector(preferences);
        string vectorJson = JsonSerializer.Serialize(vector);

        using (var con = new SqlConnection(connectionString))
        {
            con.Open();
            var cmd = new SqlCommand("UPDATE Users SET user_vector = @vector WHERE user_id = @userId", con);
            cmd.Parameters.AddWithValue("@vector", vectorJson);
            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.ExecuteNonQuery();
        }
    }
}
