// data.ts (API function)
import { API_URL } from '@/utils/env'

export const getAllFeeds = async (
  page = 1,
  pageSize = 10,
  userId?: number,
  fetchFn?: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
): Promise<SocialPostType[]> => {
  const fetcher = fetchFn || fetch
  const res = await fetcher(`${API_URL}/Post?userId=${userId ?? ''}&page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    // אם statusText לא קיים, נשתמש ב־status במקום
    const statusText = res.statusText || `status code ${res.status}`
    throw new Error(`Failed to fetch posts: ${statusText}`)
  }

  return res.json()
}
