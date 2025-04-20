using InvestItAPI.Controllers;
using InvestItAPI.Tools;
using Microsoft.Extensions.FileProviders;
using System.Net.WebSockets;
using System.Text;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHostedService<FinnhubStreamService>();
var app = builder.Build();

app.UseWebSockets();


app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", "profilePics")),
    RequestPath = "/uploadedFiles/profilePics"
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

app.UseAuthorization();

app.Map("/ws/prices", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("Incoming WebSocket connection!");

        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();

        void SendToClient(string data)
        {
            var buffer = Encoding.UTF8.GetBytes(data);
            if (webSocket.State == WebSocketState.Open)
            {
                webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        FinnhubStreamService.OnPriceUpdate += SendToClient;

        var keepAlive = Encoding.UTF8.GetBytes("{\"type\":\"ping\"}");

        while (webSocket.State == WebSocketState.Open)
        {
            await webSocket.SendAsync(keepAlive, WebSocketMessageType.Text, true, CancellationToken.None);
            await Task.Delay(5000);
        }

        FinnhubStreamService.OnPriceUpdate -= SendToClient;
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});



app.MapControllers();

app.Run();
