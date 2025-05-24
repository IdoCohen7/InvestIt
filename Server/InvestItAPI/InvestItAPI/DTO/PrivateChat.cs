using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace InvestItAPI.Models
{
    [Table("PrivateChats")]
    public class PrivateChat : BaseModel
    {
        [PrimaryKey("id")]
        public Guid Id { get; set; }

        [Column("user1_id")]
        public int User1Id { get; set; }

        [Column("user2_id")]
        public int User2Id { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}
