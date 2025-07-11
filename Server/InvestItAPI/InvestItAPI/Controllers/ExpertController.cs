using Microsoft.AspNetCore.Mvc;
using InvestItAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Data.SqlClient;
using InvestItAPI.DTO;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExpertController : ControllerBase
    {
        // GET: api/<ExpertController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<ExpertController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<ExpertController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        [HttpPut("update-expert")]
        public IActionResult UpdateExpert([FromBody] ExpertUpdateRequest request)
        {
            if (request == null || request.UserId <= 0)
                return BadRequest(new { error = "Invalid expert data" });

            Expert expert = new Expert
            {
                UserId = request.UserId,
                ExpertiseArea = request.ExpertiseArea,
                Price = request.Price,
                AvailableForChat = request.AvailableForChat
            };

            Expert.UpdateExpert(expert);
            return Ok(new { message = "Expert updated successfully" });
        }


        // DELETE api/<ExpertController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
