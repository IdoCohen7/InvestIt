export type UserType = {
  userId: number
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  profilePic: string
  experienceLevel: string
  bio: string
  createdAt: string
  isActive: boolean
  connections?: number
  location?: string
}
