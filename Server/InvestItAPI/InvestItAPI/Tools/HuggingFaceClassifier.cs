using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace InvestItAPI.Tools
{
    public class HuggingFaceClassifier
    {
        private static readonly string apiUrl = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
        private readonly string _apiKey;
        private readonly HttpClient _client;

        // תוויות מורחבות → קטגוריה
        private static readonly Dictionary<string, string> LabelToCategory = new()
        {
            { "השקעות בשוק ההון", "שוק ההון" },
            { "קנייה ומכירה של מניות", "שוק ההון" },
            { "תעודות סל ומדדים", "שוק ההון" },
            { "ניתוח טכני של מניות", "שוק ההון" },

            { "השקעות בביטקוין ואת'ריום", "קריפטו" },
            { "מסחר במטבעות דיגיטליים", "קריפטו" },
            { "בלוקצ'יין ו-NFT", "קריפטו" },

            { "השקעות בנדל\"ן ודירות", "נדל\"ן" },
            { "קניית נכסים והשכרתם", "נדל\"ן" },
            { "משכנתאות ושוק הדירות", "נדל\"ן" },

            { "איך לחסוך כסף", "חיסכון וניהול תקציב" },
            { "ניהול תקציב אישי", "חיסכון וניהול תקציב" },
            { "מעקב הוצאות ואפליקציות חיסכון", "חיסכון וניהול תקציב" },

            { "קרנות פנסיה וקופות גמל", "פנסיה והשקעות סולידיות" },
            { "אג\"ח ומסלולים סולידיים", "פנסיה והשקעות סולידיות" },
        };

        private const string DefaultCategory = "כללי";

        public HuggingFaceClassifier()
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            _apiKey = configuration["HuggingFace:ApiKey"];
            _client = new HttpClient();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task<string> ClassifyTextAsync(string text)
        {
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

            var response = await _client.PostAsync(apiUrl, content);
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
