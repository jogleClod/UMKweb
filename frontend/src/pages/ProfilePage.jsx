

// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './ProfilePage.css'
import { translations } from "../constants/translations"

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
    }
  })

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('progress') // progress | tests | achievements | settings
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("language") || "ru"
    })

    useEffect(() => {
        localStorage.setItem(
            "language",
            language
        )
    }, [language])



    const loadUserData = async () => {
        try {
            setLoading(true)

            const token = localStorage.getItem("accessToken")

            const [userRes, testRes, statsRes] = await Promise.all([
                fetch("https://umk-qu6t.onrender.com/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),

                fetch("https://umk-qu6t.onrender.com/test/my-results", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),

                fetch("https://umk-qu6t.onrender.com/materials/profile/stats", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            ])
            const userData = await userRes.json()
            const testData = await testRes.json()
            const statsData = await statsRes.json()

            // if (userData.role === "ADMIN") {
            //     navigate("/admin")
            //     return
            // }

            // настройки пока оставляем localStorage
            const savedSettings = localStorage.getItem("user_settings")

            const globalLanguage =
                localStorage.getItem("language") || "ru"

            const userSettings = savedSettings
                ? JSON.parse(savedSettings)
                : {
                    notifications: true,
                    theme: "light"
                }

            const formattedTests = testData.map(test => ({
                id: test.id,
                subjectTitle: test.subject?.title || "Предмет",
                title: test.testTitle || "Без названия теста",
                score: test.score,
                maxScore: test.total,
                date: test.createdAt,
                passed: test.percent >= 70
            }))

            setProfileData(prev => ({
                ...prev,

                name: userData.name,
                email: userData.email,
                role: userData.role,
                joinDate: userData.createdAt,

                testResults: formattedTests,

                completedMaterials: (
                    statsData?.recentMaterials || []
                ).map(item => ({
                    id: item.id,
                    title: item.material?.title,
                    category: item.material?.subcategory,
                    completedAt: item.updatedAt,
                    timeSpent: item.timeSpent,
                    score: item.progress
                })),

                totalTimeSpent: statsData?.totalTime || 0,

                settings: userSettings,
                stats: {
                    totalMaterials: statsData?.totalMaterials || 0,
                    completedCount: statsData?.completedMaterials || 0,
                    averageScore: statsData?.avgScore || 0,
                }
            }))

        } catch (error) {
            console.log("Ошибка загрузки профиля:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUserData()
    }, [])

    const t = translations[language]

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
            {t.main}
        </button>
        <button onClick={handleLogout} className="logout-button">
            {language === "kg"
                ? "Чыгуу"
                : "Выйти"}
        </button>

          <div className="language-switcher">
              <button
                  className={
                      language === "ru"
                          ? "active-lang"
                          : ""
                  }
                  onClick={() =>
                      setLanguage("ru")
                  }
              >
                  RU
              </button>

              <button
                  className={
                      language === "kg"
                          ? "active-lang"
                          : ""
                  }
                  onClick={() =>
                      setLanguage("kg")
                  }
              >
                  KG
              </button>
          </div>
      </div>

      {/* Шапка профиля */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <span>{profileData.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="profile-status online"></div>
        </div>
        <h1 className="profile-name">{profileData.name }</h1>
        <p className="profile-email">{profileData.email}</p>
        <span className="profile-role">
          {profileData.role === 'student' && '🎓 Студент'}
          {profileData.role === 'admin' && '👑 Администратор'}
        </span>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📖</span>
          <span className="stat-value">{profileData.stats.completedCount}/{profileData.stats.totalMaterials}</span>
          <span className="stat-label">{t.completedMaterialsLabel}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <span className="stat-value">{profileData.stats.averageScore}%</span>
          <span className="stat-label"> {t.averageScoreLabel}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{formatTime(profileData.totalTimeSpent)}</span>
          <span className="stat-label">{t.studyTimeLabel}</span>
        </div>
        
      </div>

      {/* Табы */}
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📚 {language === "kg"
            ? "Прогресс"
            : "Прогресс"}
        </button>
        <button 
          className={`profile-tab ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          📝 {language === "kg"
            ? "Тесттер"
            : "Тесты"}
        </button>
        
        <button 
          className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ {language === "kg"
            ? "Орнотуулар"
            : "Настройки"}
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
                    <div
                        key={test.id}
                        className={`test-card ${
                            test.passed ? "passed" : "failed"
                        }`}
                    >
                        <div className="test-header">
                            <div className="test-title-block">
                                <h3>{test.subjectTitle}</h3>
                                <p className="test-subtitle">
                                    {test.title}
                                </p>

                                <div className="modern-test-meta">
                                    <span>📋 Тест</span>
                                    <span>• {test.maxScore} вопросов</span>
                                </div>
                            </div>

                            <span
                                className={`test-status ${
                                    test.passed
                                        ? "passed"
                                        : "failed"
                                }`}
                            >
            {test.passed
                ? "✅ Сдан"
                : "❌ Не сдан"}
        </span>
                        </div>

                        <div className="test-footer">
                            <div className="test-info-left">
            <span className="test-score">
                📊 {test.score} из {test.maxScore}
            </span>

                                <span className="test-date">
                📅 {formatDate(test.date)}
            </span>
                            </div>

                            <div className="test-progress-wrapper">
                                <div className="test-score-bar">
                                    <div
                                        className="test-score-fill"
                                        style={{
                                            width: `${
                                                (test.score /
                                                    test.maxScore) *
                                                100
                                            }%`
                                        }}
                                    />
                                </div>

                                <span className="test-percent">
                {Math.round(
                    (test.score /
                        test.maxScore) *
                    100
                )}
                                    %
            </span>
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