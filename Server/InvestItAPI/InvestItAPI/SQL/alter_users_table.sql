ALTER TABLE Users
ADD connections INT NULL DEFAULT 0,
    location NVARCHAR(100) NULL;

-- עדכון הפרוצדורות המאוחסנות
ALTER PROCEDURE SP_GetUsers
AS
BEGIN
    SELECT user_id, firstName, lastName, email, password_hash, profile_pic, experience_level, bio, created_at, isActive, connections, location
    FROM Users
END

ALTER PROCEDURE SP_Login
    @email NVARCHAR(100)
AS
BEGIN
    SELECT user_id, firstName, lastName, email, password_hash, profile_pic, experience_level, bio, created_at, isActive, connections, location
    FROM Users
    WHERE email = @email
END

ALTER PROCEDURE SP_GetExpert
    @expert_id INT
AS
BEGIN
    SELECT u.user_id, u.firstName, u.lastName, u.email, u.password_hash, u.profile_pic, u.experience_level, u.bio, u.created_at, u.isActive, u.connections, u.location,
           e.expertise_area, e.price, e.available_for_chat, e.rating
    FROM Users u
    JOIN Experts e ON u.user_id = e.expert_id
    WHERE u.user_id = @expert_id
END 