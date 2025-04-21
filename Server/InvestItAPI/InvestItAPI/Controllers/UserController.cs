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

        [HttpPost("Follow")]
        public IActionResult ToggleFollow(int followedId, [FromQuery] int followerId)
        {
            try
            {
                string result = InvestItAPI.Models.User.ToggleFollow(followerId, followedId);

                if (result == "Followed" || result == "Unfollowed")
                    return Ok(new { status = result });

                return StatusCode(500, "Unexpected result from follow action.");
            }
            catch (SqlException ex) when (ex.Number == 50000)
            {
    
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }



        [HttpGet("{userId}")]
        public IActionResult GetUserById(int userId, [FromQuery] int viewerId)
        {
            try
            {
                var user = InvestItAPI.Models.User.GetUserById(userId, viewerId);
                if (user == null)
                    return NotFound(new { message = "User not found." });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "An error occurred while retrieving the user.",
                    details = ex.Message
                });
            }
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
        // PUT api/User/ProfilePic/12
        [HttpPut("ProfilePic/{userId}")]
        public IActionResult UpdateProfilePic(int userId, [FromBody] string profilePic)
        {
            try
            {
                bool result = InvestItAPI.Models.User.UploadProfilePic(profilePic, userId);

                if (result)
                    return Ok(new { message = "Profile picture updated successfully." });

                return NotFound(new { error = "User not found or update failed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("ChangePassword")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                bool result = InvestItAPI.Models.User.ChangePassword(
                    request.UserId,
                    request.CurrentPassword,
                    request.NewPassword
                );

                if (result)
                    return Ok(new { message = "Password updated successfully." });

                return Unauthorized(new { error = "Current password is incorrect." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while changing the password.", details = ex.Message });
            }
        }

        // GET api/User/Search
        [HttpGet("Search")]
        public IActionResult SearchUsers([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (users, totalCount) = InvestItAPI.Models.User.Search(query, page, pageSize);

                return Ok(new
                {
                    users,
                    totalCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while searching for users.", details = ex.Message });
            }
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
