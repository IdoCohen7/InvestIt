using System.Net.WebSockets;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace InvestItAPI.Tools
{
    public class FinnhubStreamService : BackgroundService
    {
        private readonly ClientWebSocket _ws = new();
        private readonly string _apiKey;
        private readonly string[] _symbols = {
    "BINANCE:BTCUSDT", 
    "AAPL", "MSFT", "AMZN", "GOOG", "META", "NVDA", "TSLA", "BRK.B", "JPM" 
};

        public static event Action<string>? OnPriceUpdate;

        public FinnhubStreamService()
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            _apiKey = configuration["FinnHubConfig:API_KEY"];
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var uri = new Uri($"wss://ws.finnhub.io?token={_apiKey}");
            Console.WriteLine("📡 Connecting to Finnhub...");

            await _ws.ConnectAsync(uri, stoppingToken);
            Console.WriteLine("✅ Connected to Finnhub WebSocket");

            foreach (var symbol in _symbols)
            {
                var message = $"{{\"type\":\"subscribe\",\"symbol\":\"{symbol}\"}}";
                var bytes = Encoding.UTF8.GetBytes(message);
                await _ws.SendAsync(bytes, WebSocketMessageType.Text, true, stoppingToken);
                Console.WriteLine($"📤 Subscribed to {symbol}");
            }

            var buffer = new byte[4096];
            while (!stoppingToken.IsCancellationRequested && _ws.State == WebSocketState.Open)
            {
                var result = await _ws.ReceiveAsync(buffer, stoppingToken);
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var json = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine("📩 Finnhub → " + json);
                    OnPriceUpdate?.Invoke(json);
                }
                else
                {
                    Console.WriteLine($"⚠️ WebSocket message type: {result.MessageType}");
                }
            }

            Console.WriteLine("⛔ Finnhub WebSocket disconnected.");
        }
    }
}
