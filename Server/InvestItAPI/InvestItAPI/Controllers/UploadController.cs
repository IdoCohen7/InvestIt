using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using InvestItAPI.DAL;

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly string _baseUrl;
        private readonly IWebHostEnvironment _env;

        public UploadController(IConfiguration config, IWebHostEnvironment env)
        {
            _env = env;

            _baseUrl = config["BaseUrl"];
        }

        // POST api/Upload?type=post&id=123
        [HttpPost]
        public async Task<IActionResult> Post(
            [FromForm] List<IFormFile> files,
            [FromQuery] string type,
            [FromQuery] int id)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            if (type != "profile" && type != "post")
                return BadRequest("Invalid type. Must be 'profile' or 'post'.");

            string folderName = type == "profile" ? "profilePics" : "postImages";
            string physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", folderName);

            if (!Directory.Exists(physicalPath))
                Directory.CreateDirectory(physicalPath);

            List<string> urls = new();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                string extension = Path.GetExtension(file.FileName);
                string fileName = $"{id}{extension}";
                string fullPath = Path.Combine(physicalPath, fileName);

                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);

                using (var stream = System.IO.File.Create(fullPath))
                {
                    await file.CopyToAsync(stream);
                }

                string finalUrl = $"/{folderName}/{fileName}";
                urls.Add(finalUrl);

            }

            return Ok(urls);
        }
    }
}
