const API_URL = 'https://umk-qu6t.onrender.com'

class AuthAPI {
  static async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка регистрации')
    }

    return data
  }

  static async login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка входа')
    }

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)

    return data
  }

  static async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (!refreshToken) {
      throw new Error('Refresh token не найден')
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      throw new Error('Сессия истекла')
    }

    localStorage.setItem('accessToken', data.accessToken)
    return data.accessToken
  }

  static logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  static getAccessToken() {
    return localStorage.getItem('accessToken')
  }

  static isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  }
}

export default AuthAPI