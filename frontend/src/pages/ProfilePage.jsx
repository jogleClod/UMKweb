

// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './ProfilePage.css'

function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Состояния для данных профиля
  const [profileData, setProfileData] = useState({
    // Данные из токена (уже есть)
    name: user?.name || 'Пользователь',
    email: user?.email || 'email@example.com',
    role: user?.role || 'student',
    joinDate: user?.createdAt || new Date().toISOString(),
    
    // Данные из localStorage (временное хранение)
    completedMaterials: [],
    testResults: [],
    totalTimeSpent: 0,
    lastActivity: null,
    achievements: [],
    
    // Эти данные будут приходить с бэкенда
    stats: {
      totalMaterials: 0,
      completedCount: 0,
      averageScore: 0,
      certificates: 0
    }
  })

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('progress') // progress | tests | achievements | settings

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = () => {
    setLoading(true)
    
    // ==========================================
    // ВРЕМЕННО: Данные из localStorage
    // В БУДУЩЕМ: Заменить на API запросы
    // ==========================================
    
    // Получаем прогресс из localStorage
    const savedProgress = localStorage.getItem('user_progress')
    const userProgress = savedProgress ? JSON.parse(savedProgress) : {
      completedMaterials: getMockCompletedMaterials(),
      testResults: getMockTestResults(),
      totalTimeSpent: 1240, // минуты
      lastActivity: new Date().toISOString(),
      achievements: getMockAchievements()
    }

    // Получаем сохраненные настройки
    const savedSettings = localStorage.getItem('user_settings')
    const userSettings = savedSettings ? JSON.parse(savedSettings) : {
      notifications: true,
      language: 'ru',
      theme: 'light'
    }

    setProfileData(prev => ({
      ...prev,
      ...userProgress,
      settings: userSettings,
      stats: {
        totalMaterials: 48, // TODO: GET /api/user/stats
        completedCount: userProgress.completedMaterials.length,
        averageScore: calculateAverageScore(userProgress.testResults),
        certificates: 2 // TODO: GET /api/user/certificates
      }
    }))

    setLoading(false)
  }

  // Моковые данные для демонстрации (потом удалить)
  const getMockCompletedMaterials = () => {
    return [
      { 
        id: 1, 
        title: "Введение в технологию сушки", 
        category: "Лекции", 
        completedAt: "2026-01-15",
        timeSpent: 45,
        score: 90
      },
      { 
        id: 2, 
        title: "Основы влажности материалов", 
        category: "Лекции", 
        completedAt: "2026-01-18",
        timeSpent: 60,
        score: 85
      },
      { 
        id: 3, 
        title: "Практическая работа №1", 
        category: "Практика", 
        completedAt: "2026-01-20",
        timeSpent: 90,
        score: 95
      },
      { 
        id: 4, 
        title: "Методы сушки древесины", 
        category: "Лекции", 
        completedAt: "2026-01-25",
        timeSpent: 55,
        score: 88
      },
      { 
        id: 5, 
        title: "Лабораторная работа: измерение влажности", 
        category: "Лабораторные", 
        completedAt: "2026-02-01",
        timeSpent: 120,
        score: 92
      }
    ]
  }

  const getMockTestResults = () => {
    return [
      { id: 1, title: "Контрольный тест по основам сушки", score: 85, maxScore: 100, date: "2026-01-20", passed: true },
      { id: 2, title: "Тест по методам сушки", score: 90, maxScore: 100, date: "2026-01-30", passed: true },
      { id: 3, title: "Итоговый тест по модулю 1", score: 88, maxScore: 100, date: "2026-02-05", passed: true },
      { id: 4, title: "Проверочный тест: Влажность", score: 65, maxScore: 100, date: "2026-02-10", passed: false }
    ]
  }

  const getMockAchievements = () => [
    { id: 1, icon: "🎯", title: "Первый тест", description: "Пройдите первый тест", unlocked: true },
    { id: 2, icon: "📚", title: "Книжный червь", description: "Изучите 10 материалов", unlocked: true },
    { id: 3, icon: "⭐", title: "Отличник", description: "Сдайте тест на 90%", unlocked: true },
    { id: 4, icon: "🔥", title: "Недельный марафон", description: "Занимайтесь 7 дней подряд", unlocked: false },
    { id: 5, icon: "🏆", title: "Мастер сушки", description: "Завершите весь курс", unlocked: false },
    { id: 6, icon: "⚡", title: "Быстрый ученик", description: "Пройдите материал за 30 минут", unlocked: true }
  ]

  const calculateAverageScore = (results) => {
    if (results.length === 0) return 0
    const sum = results.reduce((acc, r) => acc + (r.score / r.maxScore * 100), 0)
    return Math.round(sum / results.length)
  }

  const handleLogout = () => {
    // Очищаем локальные данные
    localStorage.removeItem('user_progress')
    localStorage.removeItem('user_settings')
    logout()
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка профиля...</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      {/* Верхняя панель */}
      <div className="profile-top-bar">
        <button onClick={() => navigate('/')} className="back-button">
          ← На главную
        </button>
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </div>

      {/* Шапка профиля */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <span>{profileData.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="profile-status online"></div>
        </div>
        <h1 className="profile-name">{profileData.name}</h1>
        <p className="profile-email">{profileData.email}</p>
        <span className="profile-role">
          {profileData.role === 'student' && '🎓 Студент'}
          {profileData.role === 'teacher' && '👨‍🏫 Преподаватель'}
          {profileData.role === 'admin' && '👑 Администратор'}
        </span>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📖</span>
          <span className="stat-value">{profileData.stats.completedCount}/{profileData.stats.totalMaterials}</span>
          <span className="stat-label">Материалов пройдено</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <span className="stat-value">{profileData.stats.averageScore}%</span>
          <span className="stat-label">Средний балл</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{formatTime(profileData.totalTimeSpent)}</span>
          <span className="stat-label">Времени обучения</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <span className="stat-value">{profileData.stats.certificates}</span>
          <span className="stat-label">Сертификатов</span>
        </div>
      </div>

      {/* Табы */}
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📚 Прогресс
        </button>
        <button 
          className={`profile-tab ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          📝 Тесты
        </button>
        <button 
          className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 Достижения
        </button>
        <button 
          className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Настройки
        </button>
      </div>

      {/* Контент табов */}
      <div className="profile-content">
        {/* Прогресс обучения */}
        {activeTab === 'progress' && (
          <div className="progress-section">
            <h2>Пройденные материалы</h2>
            {profileData.completedMaterials.length > 0 ? (
              <div className="materials-list">
                {profileData.completedMaterials.map((material) => (
                  <div key={material.id} className="material-card">
                    <div className="material-info">
                      <h3>{material.title}</h3>
                      <div className="material-meta">
                        <span className="material-category">{material.category}</span>
                        <span className="material-time">⏱️ {material.timeSpent} мин</span>
                        {material.score && (
                          <span className="material-score">📊 {material.score}%</span>
                        )}
                      </div>
                    </div>
                    <span className="material-date">
                      {formatDate(material.completedAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Вы еще не прошли ни одного материала</p>
                <button onClick={() => navigate('/')}>
                  Начать обучение
                </button>
              </div>
            )}
          </div>
        )}

        {/* Результаты тестов */}
        {activeTab === 'tests' && (
          <div className="tests-section">
            <h2>Результаты тестов</h2>
            {profileData.testResults.length > 0 ? (
              <div className="tests-list">
                {profileData.testResults.map((test) => (
                  <div key={test.id} className={`test-card ${test.passed ? 'passed' : 'failed'}`}>
                    <div className="test-header">
                      <h3>{test.title}</h3>
                      <span className={`test-status ${test.passed ? 'passed' : 'failed'}`}>
                        {test.passed ? '✅ Сдан' : '❌ Не сдан'}
                      </span>
                    </div>
                    <div className="test-details">
                      <div className="test-score-bar">
                        <div 
                          className="test-score-fill"
                          style={{ width: `${(test.score / test.maxScore) * 100}%` }}
                        />
                      </div>
                      <div className="test-meta">
                        <span>{test.score} из {test.maxScore} баллов</span>
                        <span>{formatDate(test.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Вы еще не прошли ни одного теста</p>
              </div>
            )}
          </div>
        )}

        {/* Достижения */}
        {activeTab === 'achievements' && (
          <div className="achievements-section">
            <h2>Достижения</h2>
            <div className="achievements-grid">
              {profileData.achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <span className="achievement-icon">
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </span>
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="locked-overlay">
                      <span>🔒</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Настройки */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>Настройки профиля</h2>
            
            {/* 
              TODO: GET /api/user/settings - загрузка настроек
              TODO: PUT /api/user/settings - сохранение настроек
            */}
            
            <div className="settings-form">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Уведомления</h3>
                  <p>Получать уведомления о новых материалах</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    defaultChecked={profileData.settings?.notifications}
                    onChange={(e) => {
                      const newSettings = {
                        ...profileData.settings,
                        notifications: e.target.checked
                      }
                      localStorage.setItem('user_settings', JSON.stringify(newSettings))
                    }}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* <div className="setting-item">
                <div className="setting-info">
                  <h3>Язык интерфейса</h3>
                  <p>Выберите язык отображения</p>
                </div>
                <select 
                  defaultValue={profileData.settings?.language}
                  onChange={(e) => {
                    const newSettings = {
                      ...profileData.settings,
                      language: e.target.value
                    }
                    localStorage.setItem('user_settings', JSON.stringify(newSettings))
                  }}
                  className="setting-select"
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div> */}

              {/* <div className="setting-item">
                <div className="setting-info">
                  <h3>Тема оформления</h3>
                  <p>Светлая или темная тема</p>
                </div>
                <select 
                  defaultValue={profileData.settings?.theme}
                  onChange={(e) => {
                    const newSettings = {
                      ...profileData.settings,
                      theme: e.target.value
                    }
                    localStorage.setItem('user_settings', JSON.stringify(newSettings))
                  }}
                  className="setting-select"
                >
                  <option value="light">☀️ Светлая</option>
                  <option value="dark">🌙 Темная</option>
                </select>
              </div> */}

              {/* 
                TODO: Добавить форму изменения пароля
                PUT /api/user/change-password
              */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage