import type { BootstrapVariantType } from './component'
import type { ReactNode } from 'react'

type IdType = string

export type ProfilePanelLink = {
  image: string
  name: string
  link: string
}

export type UserType = {
  id: IdType
  name: string
  avatar: string
  isStory?: boolean
  mutualCount: number
  hasRequested?: boolean
  role: string
  status: 'online' | 'offline'
  lastMessage: string
  lastActivity: Date
}

export type CommentType = {
  commentId: number
  postId: number
  userId: number
  comment: string
  createdAt: string
  profilePic: string
  firstName: string
  lastName: string
}

export type SocialPostType = {
  postId: number
  userId: number
  content: string
  createdAt: string // כי אתה מקבל תאריך מומר למחרוזת מהשרת
  updatedAt: string | null
  vector: string | null
  likesCount: number
  commentsCount: number
  fullName: string
  userProfilePic: string
  userExperienceLevel: string
  showComments?: boolean
}

export type NewsItem = {
  id: number
  category: string
  datetime: number
  headline: string
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export type ChatMessageType = {
  id: IdType
  from: UserType
  to: UserType
  message: string
  sentOn: Date
  image?: string
  isRead?: boolean
  isSend?: boolean
}

export type NotificationType = {
  id: IdType
  title: string
  description?: ReactNode
  avatar?: string
  textAvatar?: {
    text: string
    variant: BootstrapVariantType
  }
  time: Date
  isFriendRequest?: boolean
  isRead?: boolean
}
