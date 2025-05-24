using InvestItAPI.DTO;
using InvestItAPI.Models;
using InvestItAPI.Tools;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InvestItAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupabaseController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public SupabaseController(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        [HttpGet("GetUserPrivateChats")]
        public async Task<IActionResult> GetUserPrivateChats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("Missing or invalid user ID in token.");

            var chats1 = await _supabase
                .From<PrivateChat>()
                .Where(x => x.User1Id == userId)
                .Get();

            var chats2 = await _supabase
                .From<PrivateChat>()
                .Where(x => x.User2Id == userId)
                .Get();

            var allChats = chats1.Models
                .Concat(chats2.Models)
                .GroupBy(c => c.Id)
                .Select(g => g.First())
                .ToList();

            var dto = allChats.Select(c => new PrivateChatDto
            {
                Id = c.Id,
                User1Id = c.User1Id,
                User2Id = c.User2Id,
                CreatedAt = c.CreatedAt
            });

            return Ok(dto);
        }

        [HttpGet("GetPrivateMessages")]
        public async Task<IActionResult> GetPrivateMessages([FromQuery] Guid chatId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("Missing or invalid user ID in token.");

            var chatResult = await _supabase
                .From<PrivateChat>()
                .Where(x => x.Id == chatId)
                .Get();

            if (chatResult.Models.Count == 0)
                return NotFound("Chat not found.");

            var chat = chatResult.Models[0];

            if (chat.User1Id != userId && chat.User2Id != userId)
                return Forbid("User is not part of this chat.");

            var messages = await _supabase
                .From<PrivateMessage>()
                .Order(m => m.SentAt, Supabase.Postgrest.Constants.Ordering.Ascending)
                .Where(m => m.ChatId == chatId)
                .Get();

            var dto = messages.Models.Select(m => new PrivateMessageDTO
            {
                Id = m.Id,
                ChatId = m.ChatId,
                SenderId = m.SenderId,
                Content = m.Content,
                SentAt = m.SentAt
            });

            return Ok(dto);
        }

        [HttpPost("SendPrivateMessage")]
        public async Task<IActionResult> SendPrivateMessage([FromBody] SendMessageRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("Missing or invalid user ID in token.");

            var chatResult = await _supabase
                .From<PrivateChat>()
                .Where(x => x.Id == request.ChatId)
                .Get();

            if (chatResult.Models.Count == 0)
                return NotFound("Chat not found.");

            var chat = chatResult.Models[0];

            if (chat.User1Id != userId && chat.User2Id != userId)
                return Forbid("User is not part of this chat.");

            var newMessage = new PrivateMessage
            {
                ChatId = request.ChatId,
                SenderId = userId,
                Content = request.Message,
                SentAt = DateTime.UtcNow
            };

            var insertResult = await _supabase
                .From<PrivateMessage>()
                .Insert(newMessage);

            return Ok(new { messageId = insertResult.Models[0].Id });
        }

        [HttpPost("CreatePrivateChat")]
        public async Task<IActionResult> CreatePrivateChat([FromBody] CreateChatRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("Missing or invalid user ID in token.");

            if (userId == request.UserIdToChatWith)
                return BadRequest("Cannot start a chat with yourself.");

            var chat1 = await _supabase
                .From<PrivateChat>()
                .Where(x => x.User1Id == userId && x.User2Id == request.UserIdToChatWith)
                .Get();

            var chat2 = await _supabase
                .From<PrivateChat>()
                .Where(x => x.User1Id == request.UserIdToChatWith && x.User2Id == userId)
                .Get();

            if (chat1.Models.Count > 0)
                return Ok(new { chatId = chat1.Models[0].Id });

            if (chat2.Models.Count > 0)
                return Ok(new { chatId = chat2.Models[0].Id });

            var newChat = new PrivateChat
            {
                User1Id = Math.Min(userId, request.UserIdToChatWith),
                User2Id = Math.Max(userId, request.UserIdToChatWith),
            };

            var created = await _supabase
                .From<PrivateChat>()
                .Insert(newChat);

            return Ok(new { chatId = created.Models[0].Id });
        }

    }
}
