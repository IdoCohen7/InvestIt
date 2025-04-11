using Microsoft.AspNetCore.Mvc;
using InvestItAPI.Models;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        // GET: api/<CommentController>
        [HttpGet]
        public IActionResult Get(int postId)
        {
            if (postId == 0)
            {
                return BadRequest();
            }

            var comments = Comment.GetAllComments(postId);

            if (comments == null || comments.Count==0) {
                return NoContent();
            }

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
