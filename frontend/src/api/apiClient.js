import AuthAPI from "./auth.js"

const API_URL = 'https://umk-qu6t.onrender.com'

export const apiFetch = async (url, options = {}) => {
    let accessToken = AuthAPI.getAccessToken()

    // 🔐 добавляем токен
    const headers = {
        ...(options.headers || {}),
        Authorization: accessToken ? `Bearer ${accessToken}` : ""
    }

    let response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers
    })

    // 🔥 если токен умер
    if (response.status === 401) {
        try {
            const newToken = await AuthAPI.refreshToken()

            // повторяем запрос с новым токеном
            const retryHeaders = {
                ...(options.headers || {}),
                Authorization: `Bearer ${newToken}`
            }

            response = await fetch(`${API_URL}${url}`, {
                ...options,
                headers: retryHeaders
            })

        } catch (err) {
            AuthAPI.logout()
            throw new Error("Сессия истекла")
        }
    }

    return response
}