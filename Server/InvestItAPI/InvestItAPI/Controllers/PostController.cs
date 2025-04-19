using Microsoft.AspNetCore.Mvc;
using InvestItAPI.Models;
using InvestItAPI.DAL;

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        // GET: api/Post/paged?page=1&pageSize=10
        [HttpGet("paged")]
        public IActionResult GetPagedPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var db = new DBservices();
                var posts = db.GetPosts(page, pageSize);

                if (posts == null || posts.Count == 0)
                {
                    return NotFound(new { message = "No posts found." });
                }

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving posts.", details = ex.Message });
            }
        }

        // GET: api/Post
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var posts = Post.GetPosts();

                if (posts == null || posts.Count == 0)
                {
                    return NotFound(new { message = "No posts found." });
                }

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving posts.", details = ex.Message });
            }
        }

        // GET api/Post/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/Post/Vector
        [HttpPost("Vector")]
        public float[] GetVector(string text)
        {
            return Post.GetVector(text);
        }

        // POST api/Post/add
        [HttpPost("add")]
        public IActionResult AddPost([FromBody] Post post)
        {
            if (post == null || string.IsNullOrEmpty(post.Content))
                return BadRequest("Post content is required.");

            int postId = Post.AddPost(post);
            return Ok(new { postId });
        }

        // PUT api/Post/edit
        [HttpPut("edit")]
        public IActionResult Put(int postId, int userId, [FromBody] string content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                return BadRequest("Post content is required");
            }

            bool result = Post.UpdatePostContent(postId, userId, content);

            if (result)
            {
                return Ok();
            }

            return StatusCode(500, "Failed to update the post");
        }

        // POST api/Post/{postId}/like?userId=123
        [HttpPost("{postId}/like")]
        public IActionResult ToggleLike(int postId, [FromQuery] int userId)
        {
            try
            {
                string result = Post.TogglePostLike(postId, userId);

                if (result == "Liked" || result == "Unliked")
                    return Ok(new { status = result });

                return StatusCode(500, "Unexpected result from toggle like.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // DELETE api/Post/delete
        [HttpDelete("delete")]
        public IActionResult Delete(int postId, int userId)
        {
            bool result = Post.DeletePost(postId, userId);

            if (result)
            {
                return NoContent();
            }
            return NotFound();
        }
    }
}