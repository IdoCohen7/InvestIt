using InvestItAPI.Controllers;
using InvestItAPI.Tools;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);

//  JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "InvestItAPI", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter 'Bearer {token}'",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});
builder.Services.AddHostedService<FinnhubStreamService>();

// TokenService Injection
builder.Services.AddScoped<TokenService>();

//  JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// Supabase Client registration
builder.Services.AddSingleton(provider =>
{
    var supabaseUrl = builder.Configuration["Supabase:Url"];
    var supabaseKey = builder.Configuration["Supabase:Key"];

    var options = new Supabase.SupabaseOptions
    {
        AutoConnectRealtime = false
    };

    var client = new Supabase.Client(supabaseUrl, supabaseKey, options);
    client.InitializeAsync().Wait(); 

    return client;
});


var app = builder.Build();

//  WebSocket support
app.UseWebSockets();

//  Static file hosting for profile pictures and post images
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles")),
    RequestPath = "/uploadedFiles"
});


//  Swagger (dev only, but enabled here)
app.UseSwagger();
app.UseSwaggerUI();

//  Middleware pipeline
app.UseHttpsRedirection();
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

app.UseAuthentication(); // ?? חובה לפני Authorization
app.UseAuthorization();

//  WebSocket endpoint for live prices
app.Map("/ws/prices", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("Incoming WebSocket connection!");

        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();

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
