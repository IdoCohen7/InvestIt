using InvestItAPI.Controllers;
using InvestItAPI.Tools;
using Microsoft.Extensions.FileProviders;
using System.Net.WebSockets;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHostedService<FinnhubStreamService>();

var app = builder.Build();

// WebSocket support
app.UseWebSockets();

// Static file hosting for profile pictures
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", "profilePics")),
    RequestPath = "/uploadedFiles/profilePics"
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
app.UseAuthorization();

// WebSocket endpoint for live prices
app.Map("/ws/prices", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("Incoming WebSocket connection!");

        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();

        // Broadcast handler
        async void SendToClient(string data)
        {
            try
            {
                if (webSocket.State == WebSocketState.Open)
                {
                    var buffer = Encoding.UTF8.GetBytes(data);
                    await webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending WebSocket message: " + ex.Message);
            }
        }

        // Register listener
        FinnhubStreamService.OnPriceUpdate += SendToClient;

        var keepAlive = Encoding.UTF8.GetBytes("{\"type\":\"ping\"}");

        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                await webSocket.SendAsync(keepAlive, WebSocketMessageType.Text, true, CancellationToken.None);
                await Task.Delay(5000);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("WebSocket loop error: " + ex.Message);
        }
        finally
        {
            // Cleanup
            FinnhubStreamService.OnPriceUpdate -= SendToClient;
            Console.WriteLine("Client disconnected");
        }
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

app.MapControllers();
app.Run();
