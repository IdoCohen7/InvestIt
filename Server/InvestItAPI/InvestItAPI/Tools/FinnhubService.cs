using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.IO;

public class FinnhubService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;

    public FinnhubService()
    {
        var configuration = new ConfigurationBuilder()
           .SetBasePath(Directory.GetCurrentDirectory())
           .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
           .Build();

        _apiKey = configuration["FinnHubConfig:API_KEY"];
        _httpClient = new HttpClient();
    }

    public async Task<string> GetMarketNewsAsync()
    {
        string url = $"https://finnhub.io/api/v1/news?category=general&token={_apiKey}";

        HttpResponseMessage response = await _httpClient.GetAsync(url);
        if (response.IsSuccessStatusCode)
        {
            string json = await response.Content.ReadAsStringAsync();
            return json;
        }
        else
        {
            throw new Exception($"❌ Error fetching news: {response.StatusCode}");
        }

    }

    public async Task<string> GetStockQuoteAsync(string symbol)
    {
        string url = $"https://finnhub.io/api/v1/quote?symbol={symbol}&token={_apiKey}";

        HttpResponseMessage response = await _httpClient.GetAsync(url);
        if (response.IsSuccessStatusCode)
        {
            string json = await response.Content.ReadAsStringAsync();
            return json;
        }
        else
        {
            throw new Exception($"❌ Error fetching quote for {symbol}: {response.StatusCode}");
        }
    }
}
