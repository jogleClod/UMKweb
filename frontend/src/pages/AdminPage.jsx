// src/pages/AdminPage.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import SubjectAPI from "../api/subject"
import MaterialAPI from "../api/material"
import "./AdminPage.css"

// ==========================================
// НОВЫЙ API для аналитики пользователей
// ==========================================
const UserAnalyticsAPI = {
  BASE_URL: 'https://umk-qu6t.onrender.com',

  // Получить всех пользователей и их результаты тестов
  async getUsersAnalytics() {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${this.BASE_URL}/tests/analytics/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Ошибка загрузки аналитики')
    return response.json()
  },

  // Получить историю тестов конкретного пользователя
  async getUserTestHistory(userId) {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${this.BASE_URL}/tests/user/${userId}/results`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Ошибка загрузки истории тестов')
    return response.json()
  },

  // Получить статистику просмотров материалов
  async getMaterialsProgress() {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${this.BASE_URL}/materials/progress/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Ошибка загрузки прогресса')
    return response.json()
  }
}

const sections = [
  {
    title: "УМК",
    category: "SYLLABUS",
    icon: "📚",
    subcategories: [
      "Модуль",
      "Пояснительная записка"
    ]
  },
  {
    title: "Лекционные материалы",
    category: "LECTURE",
    icon: "📖",
    subcategories: [
      "Лекции",
      "Презентации",
      "Видео лекции"
    ]
  },
  {
    title: "Практические и лабораторные работы",
    category: "LAB",
    icon: "🔬",
    subcategories: [
      "Учебные материалы",
      "Методические материалы",
      "Видео материалы"
    ]
  },
  {
    title: "СРС",
    category: "SRS",
    icon: "✍️",
    subcategories: [
      "Методические указания",
      "Задания",
      "Семинары / Форум / Обратная связь"
    ]
  },
  {
    title: "Контрольные задания",
    category: "TEST",
    icon: "✅",
    subcategories: [
      "Контрольные вопросы",
      "Контрольные задания"
    ]
  },
  {
    title: "Литература",
    category: "LITERATURE",
    icon: "📕",
    subcategories: [
      "Рекомендуемые источники"
    ]
  }
]

function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [materials, setMaterials] = useState([])

  const [activeSection, setActiveSection] = useState(null)
  const [activeSubcategory, setActiveSubcategory] = useState(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState("")

  const [activeTab, setActiveTab] = useState('content') // 'content' | 'users'
  const [usersAnalytics, setUsersAnalytics] = useState([])
  const [materialsProgress, setMaterialsProgress] = useState([])
  const [selectedUserHistory, setSelectedUserHistory] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    if (!selectedSubject) return
    loadMaterials()
  }, [selectedSubject])

  const loadSubjects = async () => {
    try {
      const data = await SubjectAPI.getSubjects()
      setSubjects(data)
      if (data.length > 0) {
        setSelectedSubject(data[0])
      }
    } catch (err) {
      console.log(err)
    }
  }

  const loadMaterials = async () => {
    try {
      const data = await MaterialAPI.getBySubject(selectedSubject.id)
      setMaterials(data)
    } catch (err) {
      console.log(err)
    }
  }

  
  // ТУТА АНАЛИТИКА СЮДА БЕКЕНД НАДА

  const loadUsersAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const data = await UserAnalyticsAPI.getUsersAnalytics()
      setUsersAnalytics(data.users || data || [])
    } catch (err) {
      console.log('Ошибка загрузки аналитики:', err)
      // Если API недоступен, показываю моковые данные для демонстрации
      // тут выдает 404 посмотри что в беке
      setUsersAnalytics([
        {
          id: 1,
          name: "Иван ТЕСТ",
          email: "ivan@example.com",
          testsCompleted: 5,
          averageScore: 85,
          materialsViewed: 12,
          lastActive: "2026-02-15"
        },
        {
          id: 2,
          name: "Мария ТЕСТ",
          email: "maria@example.com",
          testsCompleted: 3,
          averageScore: 92,
          materialsViewed: 8,
          lastActive: "2026-02-14"
        }
      ])
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const loadMaterialsProgress = async () => {
    try {
      const data = await UserAnalyticsAPI.getMaterialsProgress()
      setMaterialsProgress(data.progress || data || [])
    } catch (err) {
      console.log('Ошибка загрузки прогресса:', err)
      // Моковые данные
      setMaterialsProgress([
        { materialId: 1, title: "Введение в сушку", views: 25, uniqueUsers: 18 },
        { materialId: 2, title: "Методы сушки", views: 20, uniqueUsers: 15 }
      ])
    }
  }

  const loadUserTestHistory = async (userId) => {
    try {
      const data = await UserAnalyticsAPI.getUserTestHistory(userId)
      setSelectedUserHistory(data)
    } catch (err) {
      console.log('Ошибка загрузки истории:', err)
      // Моковые данные
      setSelectedUserHistory([
        { id: 1, title: "Тест по основам", score: 85, maxScore: 100, date: "2024-02-10" },
        { id: 2, title: "Итоговый тест", score: 92, maxScore: 100, date: "2024-02-15" }
      ])
    }
  }

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsersAnalytics()
      loadMaterialsProgress()
    }
  }, [activeTab])

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }


  const currentSection = sections.find(s => s.category === activeSection)

  const filteredMaterials = materials.filter(
    item =>
      item.category === activeSection &&
      item.subcategory === activeSubcategory
  )

  const handleCreateMaterial = async () => {
    try {
      if (!title) {
        alert("Введите название")
        return
      }

      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", activeSection)
      formData.append("subcategory", activeSubcategory)
      formData.append("subjectId", selectedSubject.id)

      let finalType = "PDF"

      if (activeSubcategory.includes("Видео")) {
        finalType = videoUrl ? "LINK" : "VIDEO"
      } else if (file) {
        const fileName = file.name.toLowerCase()
        if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
          finalType = "DOC"
        } else if (fileName.endsWith(".ppt") || fileName.endsWith(".pptx")) {
          finalType = "PRESENTATION"
        } else if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
          finalType = "XLS"
        } else if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
          finalType = "IMAGE"
        }
      }

      formData.append("type", finalType)

      if (videoUrl) {
        formData.append("url", videoUrl)
      }
      if (file) {
        formData.append("file", file)
      }

      await MaterialAPI.createMaterial(formData)
      alert("Материал успешно добавлен")
      loadMaterials()
      setTitle("")
      setDescription("")
      setFile(null)
      setVideoUrl("")
    } catch (err) {
      console.log(err)
      alert("Ошибка загрузки материала")
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>📚 Панель администратора</h1>
          <p>{user?.name}</p>
        </div>

        <div className="header-actions">
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              📖 Контент
            </button>
            <button
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Пользователи
            </button>
          </div>

          <button onClick={handleLogout} className="logout-admin-btn">
            🚪 Выйти
          </button>
        </div>
      </header>

      {activeTab === 'content' ? (
        <div className="admin-content">
  <aside className="admin-sidebar">
    <h3>Управление</h3>
    
    <div className="subject-actions">
      <select
        value={selectedSubject?.id || ""}
        onChange={(e) => {
          const subject = subjects.find(
            s => s.id === Number(e.target.value)
          )
          setSelectedSubject(subject)
        }}
      >
        {subjects.map(subject => (
          <option key={subject.id} value={subject.id}>
            {subject.title}
          </option>
        ))}
      </select>

      <button
        className="add-subject-btn"
        onClick={async () => {
          try {
            const subjectTitle = prompt("Введите название предмета")
            if (!subjectTitle) return
            await SubjectAPI.createSubject(subjectTitle, "")
            await loadSubjects()
            alert("Предмет добавлен")
          } catch (err) {
            console.log(err)
            alert("Ошибка создания предмета")
          }
        }}
      >
        + Добавить предмет
      </button>

      <button
        className="delete-subject-btn"
        onClick={async () => {
          try {
            if (!selectedSubject) return
            const confirmDelete = window.confirm(
              `Удалить предмет "${selectedSubject.title}"?`
            )
            if (!confirmDelete) return
            await SubjectAPI.deleteSubject(selectedSubject.id)
            await loadSubjects()
            alert("Предмет удален")
          } catch (err) {
            console.log(err)
            alert("Ошибка удаления предмета")
          }
        }}
      >
        🗑️ Удалить предмет
      </button>
    </div>

    <h3>Категории</h3>
    
    <div className="sections-nav">
      {sections.map(section => (
        <button
          key={section.category}
          className={`admin-section-btn ${
            activeSection === section.category ? "active" : ""
          }`}
          onClick={() => {
            setActiveSection(section.category)
            setActiveSubcategory(null)
          }}
        >
          {section.icon} {section.title}
        </button>
      ))}
    </div>
  </aside>
  

          <main className="admin-main">
            {!activeSection ? (
              <div className="admin-empty">Выберите категорию</div>
            ) : (
              <>
                <h2>{currentSection.title}</h2>

                <div className="subcategory-list">
                  {currentSection.subcategories.map(sub => (
                    <button
                      key={sub}
                      className={`subcategory-btn ${
                        activeSubcategory === sub ? "active-sub" : ""
                      }`}
                      onClick={() => setActiveSubcategory(sub)}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {activeSubcategory && (
                  <>
                    <div className="upload-box">
                      <h3>Добавить материал</h3>
                      <input
                        type="text"
                        placeholder="Название материала"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <textarea
                        placeholder="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      {activeSubcategory.includes("Видео") && (
                        <input
                          type="text"
                          placeholder="YouTube ссылка (необязательно)"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                        />
                      )}
                      <label className="custom-file-upload">
                        <input
                          type="file"
                          onChange={(e) => setFile(e.target.files[0])}
                        />
                        {file ? file.name : "📁 Выберите файл"}
                      </label>
                      <button onClick={handleCreateMaterial}>
                        Добавить материал
                      </button>
                    </div>

                    <div className="materials-list">
                      {filteredMaterials.map((material) => (
                        <div key={material.id} className="material-card">
                          <div className="material-info">
                            <h4>{material.title}</h4>
                            <p>{material.description}</p>
                          </div>
                          <div className="material-actions">
                            {(material.type === "VIDEO" || material.type === "LINK") ? (
                              <button
                                className="watch-btn"
                                onClick={() => window.open(material.url, "_blank")}
                              >
                                Смотреть
                              </button>
                            ) : (
                              <button
                                className="download-btn"
                                onClick={() => MaterialAPI.downloadMaterial(material.id)}
                              >
                                Скачать
                              </button>
                            )}
                            <button
                              className="edit-btn"
                              onClick={async () => {
                                try {
                                  const newTitle = prompt(
                                    "Введите новое название",
                                    material.title
                                  )
                                  if (!newTitle) return
                                  const newDescription = prompt(
                                    "Введите новое описание",
                                    material.description
                                  )
                                  const formData = new FormData()
                                  formData.append("title", newTitle)
                                  formData.append("description", newDescription)
                                  await MaterialAPI.updateMaterial(material.id, formData)
                                  await loadMaterials()
                                  alert("Материал обновлен")
                                } catch (err) {
                                  console.log(err)
                                  alert("Ошибка обновления")
                                }
                              }}
                            >
                              Изменить
                            </button>
                            <button
                              className="delete-btn"
                              onClick={async () => {
                                try {
                                  await MaterialAPI.deleteMaterial(material.id)
                                  loadMaterials()
                                  alert("Материал удален")
                                } catch (err) {
                                  console.log(err)
                                  alert("Ошибка удаления")
                                }
                              }}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </main>
        </div>
      ) : (
        <div className="admin-content users-content">
          <aside className="users-sidebar">
            <h3>👥 Пользователи</h3>
            
            {loadingAnalytics ? (
              <div className="loading-text">Загрузка...</div>
            ) : (
              <div className="users-list">
                {usersAnalytics.map((userData) => (
                  <div
                    key={userData.id}
                    className={`user-card ${
                      selectedUserHistory?.userId === userData.id ? 'active' : ''
                    }`}
                    onClick={() => loadUserTestHistory(userData.id)}
                  >
                    <div className="user-card-header">
                      <div className="user-avatar-small">
                        {userData.name?.charAt(0) || '?'}
                      </div>
                      <div className="user-card-info">
                        <h4>{userData.name}</h4>
                        <p>{userData.email}</p>
                      </div>
                    </div>
                    <div className="user-stats-mini">
                      <span title="Пройдено тестов">
                        📝 {userData.testsCompleted || 0}
                      </span>
                      <span title="Средний балл">
                        📊 {userData.averageScore || 0}%
                      </span>
                      <span title="Просмотрено материалов">
                        📖 {userData.materialsViewed || 0}
                      </span>
                    </div>
                    <div className="user-last-active">
                      Был активен: {new Date(userData.lastActive).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

          <main className="users-main">
            <div className="users-analytics-grid">
              <div className="analytics-card">
                <h3>📊 Общая статистика</h3>
                <div className="analytics-stats">
                  <div className="analytics-stat">
                    <span className="analytics-value">{usersAnalytics.length}</span>
                    <span className="analytics-label">Всего пользователей</span>
                  </div>
                  <div className="analytics-stat">
                    <span className="analytics-value">
                      {usersAnalytics.reduce((sum, u) => sum + (u.testsCompleted || 0), 0)}
                    </span>
                    <span className="analytics-label">Пройдено тестов</span>
                  </div>
                  <div className="analytics-stat">
                    <span className="analytics-value">
                      {Math.round(
                        usersAnalytics.reduce((sum, u) => sum + (u.averageScore || 0), 0) / 
                        (usersAnalytics.length || 1)
                      )}%
                    </span>
                    <span className="analytics-label">Средний балл</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>🔥 Популярные материалы</h3>
                <div className="materials-stats-list">
                  {materialsProgress.slice(0, 5).map((mat, index) => (
                    <div key={index} className="material-stat-item">
                      <span className="material-stat-rank">#{index + 1}</span>
                      <div className="material-stat-info">
                        <span className="material-stat-title">{mat.title}</span>
                        <div className="material-stat-meta">
                          <span>👁️ {mat.views} просмотров</span>
                          <span>👤 {mat.uniqueUsers} пользователей</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ТУТА ИСТРИЯ ПОЛЬЗОВАТЕЛЯ  */}
            {selectedUserHistory && (
              <div className="user-history-section">
                <h3>📝 История тестов</h3>
                {Array.isArray(selectedUserHistory) && selectedUserHistory.length > 0 ? (
                  <div className="test-history-list">
                    {selectedUserHistory.map((test, index) => (
                      <div key={index} className="test-history-card">
                        <div className="test-history-header">
                          <h4>{test.title}</h4>
                          <span className={`test-score-badge ${
                            (test.score / test.maxScore * 100) >= 70 ? 'passed' : 'failed'
                          }`}>
                            {test.score}/{test.maxScore}
                          </span>
                        </div>
                        <div className="test-progress-bar">
                          <div
                            className="test-progress-fill"
                            style={{
                              width: `${(test.score / test.maxScore) * 100}%`
                            }}
                          />
                        </div>
                        <div className="test-history-date">
                          {new Date(test.date).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Выберите пользователя для просмотра истории</p>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default AdminPage