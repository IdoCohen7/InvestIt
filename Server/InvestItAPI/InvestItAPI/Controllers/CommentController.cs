﻿using Microsoft.AspNetCore.Mvc;
using InvestItAPI.Models;
using Microsoft.AspNetCore.Authorization;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentController : ControllerBase
    {
        // GET: api/<CommentController>
        [HttpGet]
        public IActionResult Get([FromQuery] int postId, [FromQuery] int page = 1, [FromQuery] int pageSize = 5)
        {
            if (postId == 0)
                return BadRequest(new { message = "Post ID is required." });

            var comments = Comment.GetAllComments(postId, page, pageSize);

            if (comments == null || comments.Count == 0)
                return NoContent();

            return Ok(comments);
        }


        // POST api/<CommentController>
        [HttpPost]
        public IActionResult Post([FromBody] Comment comment)
        {
            bool result = Comment.AddComment(comment);
            if (result)
            {
                return Ok();

            }

            return BadRequest();
        }

        // PUT api/<CommentController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<CommentController>/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            bool result = Comment.DeleteComment(id);

            if (result)
            {
                return NoContent();
            }
            return NotFound();
        }
    }
}
