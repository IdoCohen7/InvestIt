import type { UserType } from '@/types/auth'
import type { ChildrenType } from '@/types/component'
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type AuthContextType = {
  user: UserType | undefined
  isAuthenticated: boolean
  saveSession: (session: UserType, remember: boolean) => void
  removeSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

const authSessionKey = '_SOCIAL_AUTH_KEY_'

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()

  const getSession = (): UserType | undefined => {
    const stored = localStorage.getItem(authSessionKey) || sessionStorage.getItem(authSessionKey)
    if (!stored) return undefined
    return JSON.parse(stored)
  }

  const [user, setUser] = useState<UserType | undefined>(getSession())

  const saveSession = (user: UserType, remember: boolean) => {
    if (remember) {
      localStorage.setItem(authSessionKey, JSON.stringify(user))
    } else {
      sessionStorage.setItem(authSessionKey, JSON.stringify(user))
    }
    setUser(user)
  }

  const removeSession = () => {
    localStorage.removeItem(authSessionKey)
    sessionStorage.removeItem(authSessionKey)
    setUser(undefined)
    navigate('/auth/sign-in')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        saveSession,
        removeSession,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
