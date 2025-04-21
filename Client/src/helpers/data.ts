import { notificationData } from '@/assets/data/notification'
import type { NotificationType, SocialPostType } from '@/types/data'
import { sleep } from '@/utils/promise'
import { API_URL } from '@/utils/env'

export const getAllNotifications = async (): Promise<NotificationType[]> => {
  await sleep()
  return notificationData
}

export const getAllFeeds = async (page = 1, pageSize = 10, userId?: number): Promise<SocialPostType[]> => {
  try {
    const res = await fetch(`${API_URL}/Post?userId=${userId ?? ''}&page=${page}&pageSize=${pageSize}`, {
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
