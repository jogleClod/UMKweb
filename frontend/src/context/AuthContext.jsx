import { createContext, useState, useEffect, useCallback } from 'react'
import AuthAPI from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = AuthAPI.getAccessToken()
      if (token) {
        const userData = decodeToken(token)
        if (userData) {
          setUser(userData)
        }
      }
    } catch (err) {
      console.error('Ошибка проверки авторизации:', err)
      AuthAPI.logout()
    } finally {
      setLoading(false)
    }
  }

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Ошибка декодирования токена:', error)
      return null
    }
  }

  const login = useCallback(async (email, password) => {
    try {
      const data = await AuthAPI.login({ email, password })
      const userData = decodeToken(data.accessToken)
      setUser(userData)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    try {
      await AuthAPI.register({ name, email, password })
      const loginData = await AuthAPI.login({ email, password })
      const userData = decodeToken(loginData.accessToken)
      setUser(userData)
      return loginData
    } catch (err) {
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    AuthAPI.logout()
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

 return (
  <AuthContext.Provider value={value}>
    {loading ? null : children}  {/* или <Spinner /> вместо null */}
  </AuthContext.Provider>
)
}