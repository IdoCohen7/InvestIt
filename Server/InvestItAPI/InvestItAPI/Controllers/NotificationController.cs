using Microsoft.AspNetCore.Mvc;
using InvestItAPI.Models;
using Microsoft.AspNetCore.Authorization;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetNotifications(int userId, int page = 1, int pageSize = 10)
        {
            try
            {
                var result = Notification.GetUserNotifications(userId, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        // GET api/<NotificationController>/5
        [HttpGet("notificationsTotal")]
        public IActionResult GetNumberOfUnreadNotifications(int userId)
        {
            try
            {
                var result = Notification.GetNumberOfUnreadNotifications(userId);
                return Ok(result);
            }

            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST api/<NotificationController>
        [HttpPost]
        public IActionResult CreateNotification([FromBody] Notification notification)
        {
            if (notification == null)
                return BadRequest(new { error = "Invalid notification data" });

            try
            {
                Notification.CreateNotification(notification);
                return Ok(new { message = "Notification created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        // PUT api/<NotificationController>/5
        [HttpPut()]
        public IActionResult MarkAsRead(int userId)
        {
            try
            {
                Notification.MarkNotificationsAsRead(userId);
                return Ok();
            }

            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        // DELETE api/<NotificationController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
