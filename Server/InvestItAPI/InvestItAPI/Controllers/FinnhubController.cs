using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinnhubController : ControllerBase
    {
        // GET: api/<FinnhubController>
        [HttpGet("market-news")]
        public async Task<IActionResult> GetNews()
        {
            var service = new FinnhubService();
            var newsJson = await service.GetMarketNewsAsync();

            return Content(newsJson, "application/json");
        }


        // GET api/<FinnhubController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<FinnhubController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<FinnhubController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<FinnhubController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
