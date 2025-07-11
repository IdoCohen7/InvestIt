using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace InvestItAPI.Tools
{
    public class HuggingFaceClassifier
    {
        private static readonly string apiUrl = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
        private static readonly string apiKey = "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"; // טוקן אישי שלך

        // תוויות מורחבות → קטגוריה
        private static readonly Dictionary<string, string> LabelToCategory = new()
        {
              // שוק ההון
            { "השקעות בשוק ההון", "שוק ההון" },
            { "קנייה ומכירה של מניות", "שוק ההון" },
            { "תעודות סל ומדדים", "שוק ההון" },
            { "ניתוח טכני של מניות", "שוק ההון" },

            // קריפטו
            { "השקעות בביטקוין ואת'ריום", "קריפטו" },
            { "מסחר במטבעות דיגיטליים", "קריפטו" },
            { "בלוקצ'יין ו-NFT", "קריפטו" },

            // נדל״ן
            { "השקעות בנדל\"ן ודירות", "נדל\"ן" },
            { "קניית נכסים והשכרתם", "נדל\"ן" },
            { "משכנתאות ושוק הדירות", "נדל\"ן" },

            // חיסכון וניהול תקציב
            { "איך לחסוך כסף", "חיסכון וניהול תקציב" },
            { "ניהול תקציב אישי", "חיסכון וניהול תקציב" },
            { "מעקב הוצאות ואפליקציות חיסכון", "חיסכון וניהול תקציב" },

            // פנסיה והשקעות סולידיות
            { "קרנות פנסיה וקופות גמל", "פנסיה והשקעות סולידיות" },
            { "אג\"ח ומסלולים סולידיים", "פנסיה והשקעות סולידיות" },
        };

        // קטגוריית ברירת מחדל
        private const string DefaultCategory = "כללי";

        public static async Task<string> ClassifyTextAsync(string text)
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            string[] labels = GetLabels();

            var requestPayload = new
            {
                inputs = text,
                parameters = new
                {
                    candidate_labels = labels
                }
            };

            string json = JsonSerializer.Serialize(requestPayload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(apiUrl, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Hugging Face API error: {response.StatusCode}\n{responseString}");

            var result = JsonSerializer.Deserialize<ClassificationResponse>(responseString);

            int maxIndex = 0;
            for (int i = 1; i < result.scores.Length; i++)
            {
                if (result.scores[i] > result.scores[maxIndex])
                    maxIndex = i;
            }

            string bestLabel = result.labels[maxIndex];

            return LabelToCategory.TryGetValue(bestLabel, out string category)
                ? category
                : DefaultCategory;
        }

        private static string[] GetLabels()
        {
            return new List<string>(LabelToCategory.Keys).ToArray();
        }

        private class ClassificationResponse
        {
            public string[] labels { get; set; }
            public float[] scores { get; set; }
        }
    }
}
