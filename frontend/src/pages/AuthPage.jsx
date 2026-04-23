import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './AuthPage.css'

function AuthPage() {
  const { login, register, isAuthenticated, error: authError } = useAuth()
  const navigate = useNavigate()
  
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    setServerError('')
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов'
    }
    
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Имя обязательно'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setServerError('')
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register(formData.name, formData.email, formData.password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setServerError('')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })  
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">УМК</div>
          <h1 className="auth-title">
            {isLogin ? 'Вход в систему' : 'Регистрация'}
          </h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Войдите, чтобы продолжить обучение' 
              : 'Создайте аккаунт для доступа к материалам'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {serverError && (
            <div className="server-error">
              <span className="error-icon">⚠️</span>
              {serverError}
            </div>
          )}

          {!isLogin && (
            <div className="form-group animate-slide-down">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Имя
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Введите ваше имя"
                autoComplete="name"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📧</span>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="example@gmail.com"
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🔒</span>
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {!isLogin && (
            <div className="form-group animate-slide-down">
              <label className="form-label">
                <span className="label-icon">🔐</span>
                Подтверждение пароля
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="button-loading">
                <span className="spinner"></span>
                {isLogin ? 'Входим...' : 'Регистрируемся...'}
              </span>
            ) : (
              <span>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="switch-text">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          </p>
          <button 
            onClick={switchMode}
            className="switch-button"
            type="button"
            disabled={isSubmitting}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage