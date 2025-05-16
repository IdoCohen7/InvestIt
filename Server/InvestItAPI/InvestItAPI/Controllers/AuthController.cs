using Microsoft.AspNetCore.Mvc;
using InvestItAPI.Models;
using InvestItAPI.Tools;

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TokenService _tokenService;

        public AuthController(TokenService tokenService)
        {
            _tokenService = tokenService;
        }

        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = InvestItAPI.Models.User.Login(request.Email, request.Password);

            if (user == null)
                return Unauthorized(new { error = "Invalid email or password" });

            var token = _tokenService.GenerateToken(user);

            return Ok(new
            {
                user,
                token
            });
        }

        [HttpPost("Register")]
        public IActionResult Register([FromBody] User user)
        {
            try
            {
                User? registeredUser = InvestItAPI.Models.User.RegisterUser(user);

                if (registeredUser != null)
                {
                    var token = _tokenService.GenerateToken(registeredUser);

                    return Ok(new
                    {
                        user = registeredUser,
                        token
                    });
                }

                return BadRequest(new { message = "Email already exists or registration failed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
