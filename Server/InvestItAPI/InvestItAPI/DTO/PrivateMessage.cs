
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace InvestItAPI.DTO;

[Table("PrivateMessages")]
public class PrivateMessage : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; } // ← changed from long to Guid

    [Column("chat_id")]
    public Guid ChatId { get; set; }

    [Column("sender_id")]
    public int SenderId { get; set; }

    [Column("content")]
    public string Content { get; set; }

    [Column("sent_at")]
    public DateTime SentAt { get; set; }
}
