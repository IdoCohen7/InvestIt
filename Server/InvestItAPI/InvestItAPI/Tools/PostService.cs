using System.Text;
using System.Text.Json;

public class PostService
{
    static public string updatePostVector(string content)
    {
        float[] vector = VectorHelper.ConvertTextToVector(content);

        // ✅ במקום להמיר ל-`byte[]`, שומרים `string`
        string vectorJson = JsonSerializer.Serialize(vector);

        Console.WriteLine($"📢 JSON Vector: {vectorJson}"); // בדיקה

        return vectorJson; // ✅ מחזירים `string` לשמירה ב-DB
    }
}