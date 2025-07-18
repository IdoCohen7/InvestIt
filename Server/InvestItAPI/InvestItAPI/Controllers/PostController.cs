﻿using Microsoft.AspNetCore.Mvc;
using InvestItAPI.Models;
using InvestItAPI.DAL;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PostController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get([FromQuery] int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var posts = InvestItAPI.Models.Post.GetPosts(userId, page, pageSize);

                if (posts == null || posts.Count == 0)
                {
                    return NotFound(new { message = "No posts found." });
                }

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "An error occurred while retrieving posts.",
                    details = ex.Message
                });
            }
        }

        [HttpGet("Personalized")]
        public IActionResult GetPersonalizedFeed([FromQuery] int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var posts = InvestItAPI.Models.Post.GetPersonalizedFeed(userId, page, pageSize);

                if (posts == null || posts.Count == 0)
                {
                    return NotFound(new { message = "No personalized posts found." });
                }

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "An error occurred while retrieving personalized feed.",
                    details = ex.Message,
                    inner = ex.InnerException?.Message 
                });
            }
        }




        [HttpGet("Followed")]
        public IActionResult GetFollowedPosts([FromQuery] int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var posts = InvestItAPI.Models.Post.GetFollowedPosts(userId, page, pageSize);

                if (posts == null || posts.Count == 0)
                {
                    return NotFound(new { message = "No posts found." });
                }

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "An error occurred while retrieving posts.",
                    details = ex.Message
                });
            }
        }

        [HttpGet("UserPage")]
        public IActionResult GetPostOfUser([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] int userId = 0, [FromQuery] int profileUserId = 0)
        {
            try
            {
                var posts = InvestItAPI.Models.Post.GetPostsOfUser(page, pageSize, userId, profileUserId);

                if (posts == null || posts.Count == 0)
                {
                    return NoContent();
                }

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "An error occurred while retrieving posts.",
                    details = ex.Message
                });
            }
        }





        // GET api/<PostController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }


        [HttpPost("add")]
        public IActionResult AddPost([FromBody] Post post)
        {
            if (post == null || string.IsNullOrEmpty(post.Content))
                return BadRequest("Post content is required.");

            int postId = Post.AddPost(post); // ✅ חישוב וקטור מתבצע בשרת
            return Ok(new { postId });
        }


        // PUT api/<PostController>/5
        [HttpPut("edit")]
        public IActionResult Put(int postId, int userId, [FromBody] string content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                return BadRequest("Post content is required");
            }

            bool result = InvestItAPI.Models.Post.UpdatePostContent(postId, userId, content);

            if (result)
            {
                return Ok();
            }

            return StatusCode(500, "Failed to update the post");
        }

        [HttpPut("{postId}/image")]
        public IActionResult SetPostImage(int postId, [FromBody] string imgPath)
        {

            if (string.IsNullOrWhiteSpace(imgPath))
                return BadRequest("Image path is required.");

            try
            {
                bool success = InvestItAPI.Models.Post.SetImage(postId, imgPath);

                if (success)
                    return Ok(new { message = "Image updated successfully." });

                return StatusCode(404, $"Post with id {postId} not found or update failed.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal error: {ex.Message}");
            }
        }


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

        [HttpDelete("delete")]
        public IActionResult Delete(int postId, int userId)
        {
            bool result = InvestItAPI.Models.Post.DeletePost(postId, userId);

            if (result)
            {
                return NoContent();
            }
            return NotFound();
        }
    }
}