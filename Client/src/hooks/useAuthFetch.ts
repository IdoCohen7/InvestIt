import { useAuthContext } from '@/context/useAuthContext'
import { useNavigate } from 'react-router-dom'

export const useAuthFetch = () => {
  const { user, removeSession } = useAuthContext()
  const navigate = useNavigate()

  const authFetch = async (input: RequestInfo, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {})
    if (user?.token) {
      headers.set('Authorization', `Bearer ${user.token}`)
    }
    const response = await fetch(input, { ...init, headers })

    if (response.status === 401) {
      removeSession()
      // מעבירים פרמטר לשורת הכתובת
      navigate('/auth/sign-in?from=unauthorized')
      throw new Error('Unauthorized')
    }

    if (!response.ok && response.status !== 204) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('Content-Type')
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null
    }

    try {
      return await response.json()
    } catch {
      return null
    }
  }

  return authFetch
}
