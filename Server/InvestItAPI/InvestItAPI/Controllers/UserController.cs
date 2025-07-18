﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InvestItAPI.Models;
using System.Data.SqlClient;
using InvestItAPI.DTO;

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class UserController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetUsers()
        {
            try
            {
                var users = InvestItAPI.Models.User.GetUsers();

                if (users == null || users.Count == 0)
                    return NotFound("No users found.");

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving users.");
            }
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

        [HttpPost("Consultation")]
        public IActionResult InsertConsultation([FromBody] ConsultationRequest request)
        {
            try
            {
                InvestItAPI.Models.User.InsertConsultation(request.UserId, request.ExpertId);
            }
            catch (SqlException ex) when (ex.Number == 50000)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

            return Ok();
        }


        [HttpGet("Consultation/Valid")]
        public IActionResult IsConsultationValid(int userId, int expertId)
        {
            try
            {
                int status = InvestItAPI.Models.User.IsConsultationValid(userId, expertId);
                return Ok(new { consultationStatus = status });
                // 1 = valid, -1 = expired, 0 = none
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("RateExpert")]
        public IActionResult RateExpert(int userId, int expertId, double rating)
        {
            try
            {
                bool success = InvestItAPI.Models.User.UpdateConsultationRating(userId, expertId, rating);

                if (!success)
                    return NotFound("Consultation not found or rating update failed.");

                return Ok("Rating updated successfully.");
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
                return StatusCode(500, new { error = "An error occurred while retrieving the user.", details = ex.Message });
            }
        }

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

        [HttpPut("{userId}/Interest")]
        public IActionResult SetUserInterest(int userId, [FromBody] string interest)
        {
            try
            {
                bool result = InvestItAPI.Models.User.SetUserInterest(userId, interest);

                if (result)
                    return Ok(new { message = $"Interest category updated to '{interest}' for user {userId}." });

                return NotFound(new { error = "User not found or interest update failed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while updating interest category.", details = ex.Message });
            }
        }


        [HttpPut("ChangePassword")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                bool result = InvestItAPI.Models.User.ChangePassword(request.UserId, request.CurrentPassword, request.NewPassword);

                if (result)
                    return Ok(new { message = "Password updated successfully." });

                return Unauthorized(new { error = "Current password is incorrect." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while changing the password.", details = ex.Message });
            }
        }

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

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                int result = InvestItAPI.Models.User.DeleteUser(id);

                if (result == 1)
                    return Ok(new { message = "User deleted successfully." });

                return NotFound(new { error = "User not found or already deleted." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while deleting the user.", details = ex.Message });
            }
        }
    }
}
