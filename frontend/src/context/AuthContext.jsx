import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import AuthAPI from '../api/auth'


export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const decodeToken = useCallback((token) => {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )

            const data = JSON.parse(jsonPayload)

            if (data.exp * 1000 < Date.now()) {
                console.warn('Токен истёк')
                return null
            }

            return data
        } catch (error) {
            console.error('Ошибка декодирования токена:', error)
            return null
        }
    }, [])

    const checkAuth = useCallback(async () => {
        try {
            const token = AuthAPI.getAccessToken()

            if (token) {
                const userData = decodeToken(token)

                if (userData) {
                    setUser(userData)
                } else {
                    AuthAPI.logout()
                }
            }
        } catch (err) {
            console.error('Ошибка проверки авторизации:', err)
            AuthAPI.logout()
        } finally {
            setLoading(false)
        }
    }, [decodeToken])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const login = useCallback(async (email, password) => {
        try {
            const data = await AuthAPI.login({ email, password })

            if (!data?.accessToken) {
                throw new Error('Нет accessToken')
            }

            const userData = decodeToken(data.accessToken)

            if (!userData) {
                throw new Error('Невалидный токен')
            }

            setUser(userData)

            return data
        } catch (err) {
            console.error('Ошибка логина:', err)
            throw err
        }
    }, [decodeToken])

    const register = useCallback(async (name, email, password) => {
        try {
            await AuthAPI.register({ name, email, password })

            const loginData = await AuthAPI.login({ email, password })

            if (!loginData?.accessToken) {
                throw new Error('Нет accessToken после регистрации')
            }

            const userData = decodeToken(loginData.accessToken)

            if (!userData) {
                throw new Error('Невалидный токен')
            }

            setUser(userData)

            return loginData
        } catch (err) {
            console.error('Ошибка регистрации:', err)
            throw err
        }
    }, [decodeToken])

    const logout = useCallback(() => {
        AuthAPI.logout()
        setUser(null)
    }, [])

    const value = useMemo(() => ({
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    }), [user, loading, login, register, logout])

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div>Загрузка...</div> : children}
        </AuthContext.Provider>
    )
}