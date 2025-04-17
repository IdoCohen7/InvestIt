import { notificationData } from '@/assets/data/notification'
import type { NotificationType, SocialPostType } from '@/types/data'
import { sleep } from '@/utils/promise'

export const getAllNotifications = async (): Promise<NotificationType[]> => {
  await sleep()
  return notificationData
}

export const getAllFeeds = async (): Promise<SocialPostType[]> => {
  try {
    const res = await fetch('https://localhost:7204/api/Post', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.statusText}`)
    }
    const data = await res.json()
    return data
  } catch (err) {
    console.error('getAllFeeds error:', err)
    throw err
  }
}
