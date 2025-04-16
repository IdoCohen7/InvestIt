using Microsoft.AspNetCore.Mvc;
using InvestItAPI.Models;
using InvestItAPI.DAL;
using System.Linq.Expressions;
using System.Data.SqlClient;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        // GET: api/<UserController>
        [HttpGet]
        public IActionResult GetUsers()
        {
            try
            {
                var users = InvestItAPI.Models.User.GetUsers();

                if (users == null || users.Count == 0)
                {
                    return NotFound("No users found.");

                }

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An errr occured while retrieving users.");
            } 
        }

        [HttpGet("Login")]
        public IActionResult Login(string email, string password)
        {
            var user = InvestItAPI.Models.User.Login(email, password);

            if (user == null)
            {
                return Unauthorized(new { error = "Invalid email or password" });
            }

            return Ok(user);
        }

        [HttpPost("{expertId}/follow")]
        public IActionResult ToggleFollow(int expertId, [FromQuery] int userId)
        {
            try
            {
                string result = InvestItAPI.Models.User.ToggleFollow(userId, expertId);

                if (result == "Followed" || result == "Unfollowed")
                    return Ok(new { status = result });

                return StatusCode(500, "Unexpected result from follow action.");
            }
            catch (SqlException ex) when (ex.Number == 50000)
            {
                // נתפסה שגיאה מה-RAISERROR ב-SP (למשל ניסיון לעקוב אחרי לא-מומחה)
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }


        [HttpGet("{expertId}/is-following")]
        public IActionResult IsFollowing(int expertId, [FromQuery] int userId)
        {
            try
            {
                bool isFollowing = InvestItAPI.Models.User.IsFollowing(userId, expertId);
                return Ok(new { isFollowing });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }



        // GET api/<UserController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<UserController>
        [HttpPost]
        public IActionResult Post([FromBody] User user)
        {
            try
            {
                User? registeredUser = InvestItAPI.Models.User.RegisterUser(user);

                if (registeredUser != null)
                {
                    return Ok(registeredUser);
                }

                return BadRequest(new { message = "Email already exists or registration failed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        // PUT api/<UserController>/5
        [HttpPut("update")]
        public IActionResult UpdateUser([FromBody] User user)
        {
            if (user == null || user.UserId <= 0)
                return BadRequest(new { error = "Invalid user data" });

            int result = InvestItAPI.Models.User.EditUser(user);

            if (result == 1)
                return Ok(new { message = "User updated successfully" });
            else if (result == -1)
                return NotFound(new { error = "User not found or not updated" });
            else
                return StatusCode(500, new { error = "Something went wrong" });
        }


        // DELETE api/<UserController>/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                int result = InvestItAPI.Models.User.DeleteUser(id);

                if (result == 1)
                {
                    return Ok(new { message = "User deleted successfully." });
                }
                else
                {
                    return NotFound(new { error = "User not found or already deleted." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while deleting the user.", details = ex.Message });
            }
        }

    }
}
