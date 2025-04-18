using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        // GET: api/<UploadController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<UploadController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        [HttpPost]
        public async Task<IActionResult> Post(
    [FromForm] List<IFormFile> files,
    [FromQuery] string type,
    [FromQuery] int id // userId or postId
)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            if (type != "profile" && type != "post")
                return BadRequest("Invalid type. Must be 'profile' or 'post'.");

            string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles");
            string folderPath = Path.Combine(rootPath, type == "profile" ? "profilePics" : "postImages");

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            List<string> savedFileNames = new();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    string extension = Path.GetExtension(file.FileName);
                    string fileName = $"{id}{extension}";
                    string fullPath = Path.Combine(folderPath, fileName);

                    // אם כבר קיים קובץ כזה – מחק אותו לפני דריסה
                    if (System.IO.File.Exists(fullPath))
                    {
                        System.IO.File.Delete(fullPath);
                    }

                    using (var stream = System.IO.File.Create(fullPath))
                    {
                        await file.CopyToAsync(stream);
                    }

                    savedFileNames.Add($"{type}/{fileName}");
                }
            }

            return Ok(savedFileNames);
        }



        // PUT api/<UploadController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UploadController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
