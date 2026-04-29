using AfterHoursServer;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var options = builder.Configuration.GetSection("AfterHours").Get<AfterHoursOptions>() ?? new AfterHoursOptions();

builder.Services.AddSingleton(options);
builder.Services.AddCors(cors =>
{
    cors.AddPolicy("AfterHoursCors", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return false;
                }

                return uri.Host is "127.0.0.1" or "localhost";
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services
    .AddSignalR()
    .AddJsonProtocol(protocol =>
    {
        protocol.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddSingleton<RoomManager>();

var app = builder.Build();

var siteRoot = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", ".."));
var siteProvider = new PhysicalFileProvider(siteRoot);

app.UseCors("AfterHoursCors");

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = siteProvider
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = siteProvider
});

app.MapGet("/health", () => Results.Ok(new { ok = true, service = "after-hours-server" }));
app.MapHub<AfterHoursHub>("/after-hours-hub");

app.MapFallback(async (context) =>
{
    var path = context.Request.Path.Value ?? "/";
    if (path == "/" || string.IsNullOrWhiteSpace(Path.GetExtension(path)))
    {
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync(Path.Combine(siteRoot, "index.html"));
        return;
    }

    context.Response.StatusCode = StatusCodes.Status404NotFound;
});

app.Run();
