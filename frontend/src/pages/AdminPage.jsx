// src/pages/AdminPage.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import MaterialAPI from "../api/material"
import "./AdminPage.css"
import TestAPI from "../api/test"
import logoIcon from "../assets/ic_logo.png"
import { translations } from "../constants/translations"


// ==========================================
// НОВЫЙ API для аналитики пользователей
// ==========================================
const UserAnalyticsAPI = {
  BASE_URL: 'https://umk-qu6t.onrender.com',

  // Получить всех пользователей и их результаты тестов
    async getUsersAnalytics() {
        const token = localStorage.getItem("accessToken")

        const response = await fetch(
            `${this.BASE_URL}/test/analytics/users`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        if (!response.ok) {
            throw new Error("Ошибка загрузки аналитики")
        }

        return response.json()
    },

  // Получить историю тестов конкретного пользователя
    async getUserTestHistory(userId) {
        const token = localStorage.getItem('accessToken')

        const response = await fetch(
            `${this.BASE_URL}/test/user/${userId}/results`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        if (!response.ok) {
            throw new Error("Ошибка загрузки истории тестов")
        }

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
      "Контрольные задания",
        "Тесты"
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
  const [language, setLanguage] = useState(() => {
        return localStorage.getItem("language") || "ru"
    })

    useEffect(() => {
        localStorage.setItem("language", language)
    }, [language])

    const t = translations[language]
    const [testQuestions, setTestQuestions] = useState([
        {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: ""
        }
    ])

    useEffect(() => {
        loadMaterials()
    }, [])

    //добавление теста

    const addQuestion = () => {
        setTestQuestions([
            ...testQuestions,
            {
                question: "",
                options: ["", "", "", ""],
                correctAnswer: ""
            }
        ])
    }
    const updateQuestionText = (index, value) => {
        const updated = [...testQuestions]
        updated[index].question = value
        setTestQuestions(updated)
    }
    const updateOption = (
        questionIndex,
        optionIndex,
        value
    ) => {
        const updated = [...testQuestions]

        updated[questionIndex].options[
            optionIndex
            ] = value

        setTestQuestions(updated)
    }
    const updateCorrectAnswer = (
        questionIndex,
        value
    ) => {
        const updated = [...testQuestions]

        updated[questionIndex].correctAnswer =
            value

        setTestQuestions(updated)
    }
  const loadMaterials = async () => {
    try {
        const data =
            await MaterialAPI.getBySubject(1)
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
    }
  }

  const loadUserTestHistory = async (userId) => {
    try {
      const data = await UserAnalyticsAPI.getUserTestHistory(userId)
      setSelectedUserHistory(data)
    } catch (err) {
      console.log('Ошибка загрузки истории:', err)
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
        formData.append("subjectId", 1)

      let finalType = "PDF"

      if (activeSubcategory?.includes("Видео")) {
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

    const [selectedSubject] = useState({
        id: 1,
        title: "Технология сушки"
    })

    const loadTests = async () => {
        try {
            const data =
                await TestAPI.getTestsBySubject(1)

            setTests(data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleSaveTest = async () => {
        try {
            for (const question of testQuestions) {
                const formattedAnswers =
                    question.options.map(option => ({
                        text: option,
                        isCorrect:
                            option === question.correctAnswer
                    }))

                await TestAPI.createTest({
                    testTitle: title,
                    text: question.question,
                    subjectId: 1,
                    answers: formattedAnswers
                })
            }

            alert("Тест успешно сохранен")
            loadTests()

            setTitle("")
            setDescription("")

            setTestQuestions([
                {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: ""
                }
            ])
        } catch (error) {
            console.log(error)
            alert("Ошибка сохранения теста")
        }
    }

    const [tests, setTests] = useState([])
    const [openedTest, setOpenedTest] = useState(null)

    useEffect(() => {
        if (
            activeSubcategory === "Тесты" &&
            selectedSubject
        ) {
            loadTests()
        }
    }, [
        activeSubcategory,
        selectedSubject?.id
    ])

    const groupedTests = Object.values(
        tests.reduce((acc, question) => {
            const key =
                question.testTitle ||
                "Без названия"

            if (!acc[key]) {
                acc[key] = {
                    title: key,
                    questions: []
                }
            }

            acc[key].questions.push(question)

            return acc
        }, {})
    )

    const handleDeleteTest = async (questions) => {
        try {
            for (const question of questions) {
                await TestAPI.deleteQuestion(
                    question.id
                )
            }

            alert("Тест удален")

            loadTests()

            if (openedTest !== null) {
                setOpenedTest(null)
            }

        } catch (error) {
            console.log(error)
            alert("Ошибка удаления теста")
        }
    }
     





  return (
    <div className="admin-page">
      <header className="admin-header">
        <div
                    className="logo-circle"
                  >
                    <img src={logoIcon} alt="logo" />
        
                  </div>
        <div>
          <h1>{t.title}</h1>
          <p>{user?.name}</p>
        </div>

        <div className="header-actions">
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              {t.content}
            </button>
            <button
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              {t.users}
            </button>
          </div>

          <button onClick={handleLogout} className="logout-admin-btn">
            {t.exit}
          </button>
        </div>
      </header>

      {activeTab === 'content' ? (
        <div className="admin-content">
  <aside className="admin-sidebar">
      <div className="subject-actions">
          <div className="fixed-subject-box">
              <strong>{t.subject}</strong>
          </div>
      </div>

    <h3>{t.categories}</h3>
    
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

              setTitle("")
              setDescription("")
              setFile(null)
              setVideoUrl("")

              setTestQuestions([
                  {
                      question: "",
                      options: ["", "", "", ""],
                      correctAnswer: ""
                  }
              ])
          }}
        >
          {section.icon} {section.title}
        </button>
      ))}
    </div>
  </aside>
  

          <main className="admin-main">
            {!activeSection ? (
              <div className="admin-empty">{t.chooseCategory}</div>
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

                  {!activeSubcategory ? (
                      <div className="admin-empty">
                          {t.chooseSubcategory}
                      </div>
                  ) : activeSubcategory === "Тесты" ? (
                      <div className="upload-box">
                          <h3>{t.createTest}</h3>

                          <input
                              type="text"
                              placeholder="Название теста"
                              value={title}
                              onChange={(e) =>
                                  setTitle(e.target.value)
                              }
                          />

                          <textarea
                              placeholder="{t.descPlaceholder}"
                              value={description}
                              onChange={(e) =>
                                  setDescription(e.target.value)
                              }
                          />

                          {testQuestions.map(
                              (question, qIndex) => (
                                  <div
                                      key={qIndex}
                                      className="test-question-box"
                                  >
                                      <h4>
                                          Вопрос {qIndex + 1}
                                      </h4>

                                      <textarea
                                          placeholder="Введите вопрос"
                                          value={question.question}
                                          onChange={(e) =>
                                              updateQuestionText(
                                                  qIndex,
                                                  e.target.value
                                              )
                                          }
                                      />

                                      <div className="options-list">
                                          {question.options.map(
                                              (
                                                  option,
                                                  optionIndex
                                              ) => (
                                                  <input
                                                      key={
                                                          optionIndex
                                                      }
                                                      type="text"
                                                      placeholder={`Вариант ${
                                                          optionIndex +
                                                          1
                                                      }`}
                                                      value={
                                                          option
                                                      }
                                                      onChange={(
                                                          e
                                                      ) =>
                                                          updateOption(
                                                              qIndex,
                                                              optionIndex,
                                                              e.target
                                                                  .value
                                                          )
                                                      }
                                                  />
                                              )
                                          )}
                                      </div>

                                      <select
                                          className="correct-answer-select"
                                          value={
                                              question.correctAnswer
                                          }
                                          onChange={(e) =>
                                              updateCorrectAnswer(
                                                  qIndex,
                                                  e.target.value
                                              )
                                          }
                                      >
                                          <option value="">
                                              Выберите правильный
                                              ответ
                                          </option>

                                          {question.options.map(
                                              (
                                                  option,
                                                  index
                                              ) => (
                                                  <option
                                                      key={
                                                          index
                                                      }
                                                      value={
                                                          option
                                                      }
                                                  >
                                                      {option ||
                                                          `Вариант ${
                                                              index +
                                                              1
                                                          }`}
                                                  </option>
                                              )
                                          )}
                                      </select>
                                  </div>
                              )
                          )}

                          <button
                              className="add-question-btn"
                              onClick={addQuestion}
                          >
                              + Добавить вопрос
                          </button>

                          <button
                              className="save-test-btn"
                              onClick={handleSaveTest}
                          >
                              Сохранить тест
                          </button>
                          <div className="saved-tests-list">
                              <h3 className="saved-tests-title">
                                  Созданные тесты
                              </h3>

                              {groupedTests.length > 0 ? (
                                  groupedTests.map((test, index) => (
                                      <div
                                          key={index}
                                          className="saved-test-card"
                                      >
                                          <div className="test-card-info">
                                              <h4
                                                  className="test-title-name clickable-test-title"
                                                  onClick={() =>
                                                      setOpenedTest(
                                                          openedTest === index
                                                              ? null
                                                              : index
                                                      )
                                                  }
                                              >
                                                  {test.title}
                                              </h4>

                                              <p>
                                                  Всего вопросов:
                                                  {test.questions.length}
                                              </p>

                                              {openedTest === index && (
                                                  <div className="test-details-box">
                                                      {test.questions.map(
                                                          (question, qIndex) => (
                                                              <div
                                                                  key={question.id}
                                                                  className="question-preview-card"
                                                              >
                                                                  <h5>
                                                                      {qIndex + 1}.{" "}
                                                                      {question.text}
                                                                  </h5>

                                                                  <div className="answers-preview">
                                                                      {question.answers.map(
                                                                          (
                                                                              answer
                                                                          ) => (
                                                                              <p
                                                                                  key={
                                                                                      answer.id
                                                                                  }
                                                                                  className={
                                                                                      answer.isCorrect
                                                                                          ? "correct-answer-preview"
                                                                                          : ""
                                                                                  }
                                                                              >
                                                                                  {answer.isCorrect
                                                                                      ? "✅"
                                                                                      : "•"}{" "}
                                                                                  {
                                                                                      answer.text
                                                                                  }
                                                                              </p>
                                                                          )
                                                                      )}
                                                                  </div>
                                                              </div>
                                                          )
                                                      )}
                                                  </div>
                                              )}
                                          </div>

                                          <button
                                              className="delete-test-btn"
                                              onClick={() =>
                                                  handleDeleteTest(
                                                      test.questions
                                                  )
                                              }
                                          >
                                              🗑 Удалить
                                          </button>
                                      </div>
                                  ))
                              ) : (
                                  <p>Тестов пока нет</p>
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="upload-box">
                          <h3>{t.addMaterial}</h3>

                          <input
                              type="text"
                              placeholder="Название материала"
                              value={title}
                              onChange={(e) =>
                                  setTitle(e.target.value)
                              }
                          />

                          <textarea
                              placeholder="Описание"
                              value={description}
                              onChange={(e) =>
                                  setDescription(e.target.value)
                              }
                          />

                          {activeSubcategory?.includes(
                              "Видео"
                          ) && (
                              <input
                                  type="text"
                                  placeholder="YouTube ссылка"
                                  value={videoUrl}
                                  onChange={(e) =>
                                      setVideoUrl(
                                          e.target.value
                                      )
                                  }
                              />
                          )}

                          <label className="custom-file-upload">
                              <input
                                  type="file"
                                  onChange={(e) =>
                                      setFile(
                                          e.target.files[0]
                                      )
                                  }
                              />
                              {file
                                  ? file.name
                                  : "📁 Выберите файл"}
                          </label>

                          <button
                              onClick={
                                  handleCreateMaterial
                              }
                          >
                              Добавить материал
                          </button>
                      </div>
                  )}
                  {activeSubcategory &&
                      activeSubcategory !== "Тесты" && (
                          <div className="materials-list">
                              <h3>{t.uploadedMaterials}</h3>

                              {filteredMaterials.length > 0 ? (
                                  filteredMaterials.map((material) => (
                                      <div
                                          key={material.id}
                                          className="material-item"
                                      >
                                          <div className="material-info">
                                              <h4>
                                                  {material.title || material.fileName}
                                              </h4>

                                              <p>
                                                  {material.description ||
                                                      "Описание отсутствует"}
                                              </p>

                                              <div className="material-meta">
            <span>
                📁 {material.type}
            </span>
                                              </div>
                                          </div>

                                          <div className="material-actions">

                                              {/* Для видео */}
                                              {["VIDEO", "LINK"].includes(material.type) ? (
                                                  <a
                                                      href={material.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="watch-btn"
                                                  >
                                                      ▶ Смотреть
                                                  </a>
                                              ) : (
                                                  <>
                                                      {/* Скачать */}
                                                      <a
                                                          href={`https://umk-qu6t.onrender.com/materials/download/${material.id}`}
                                                          className="download-btn"
                                                      >
                                                          ⬇ Скачать
                                                      </a>
                                                  </>
                                              )}

                                              {/* Изменить */}
                                              <button
                                                  className="edit-btn"
                                                  onClick={() => {
                                                      setTitle(
                                                          material.title ||
                                                          material.fileName ||
                                                          ""
                                                      )

                                                      setDescription(
                                                          material.description || ""
                                                      )
                                                  }}
                                              >
                                                  ✏️ Изменить
                                              </button>

                                              {/* Удалить */}
                                              <button
                                                  className="delete-btn"
                                                  onClick={() =>
                                                      handleDeleteMaterial(material.id)
                                                  }
                                              >
                                                  {t.delete}
                                              </button>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <p>
                                      {t.noMaterials}
                                  </p>
                              )}
                          </div>
                      )}
              </>
            )}
          </main>
        </div>
      ) : (
        <div className="admin-content users-content">
          <aside className="users-sidebar">
            <h3>{t.users}</h3>
            
            {loadingAnalytics ? (
              <div className="loading-text">{t.loading}</div>
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
                      {t.wasActive}: {new Date(userData.lastActive).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

          <main className="users-main">
            <div className="users-analytics-grid">
              <div className="analytics-card">
                <h3>{t.generalStats}</h3>
                <div className="analytics-stats">
                  <div className="analytics-stat">
                    <span className="analytics-value">{usersAnalytics.length}</span>
                    <span className="analytics-label">{t.totalUsers}</span>
                  </div>
                  <div className="analytics-stat">
                    <span className="analytics-value">
                      {usersAnalytics.reduce((sum, u) => sum + (u.testsCompleted || 0), 0)}
                    </span>
                    <span className="analytics-label">{t.testsTaken}</span>
                  </div>
                  <div className="analytics-stat">
                    <span className="analytics-value">
                      {Math.round(
                        usersAnalytics.reduce((sum, u) => sum + (u.averageScore || 0), 0) / 
                        (usersAnalytics.length || 1)
                      )}%
                    </span>
                    <span className="analytics-label">{t.averageScore}</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>{t.popularMaterials}</h3>
                <div className="materials-stats-list">
                  {materialsProgress.slice(0, 5).map((mat, index) => (
                    <div key={index} className="material-stat-item">
                      <span className="material-stat-rank">#{index + 1}</span>
                      <div className="material-stat-info">
                        <span className="material-stat-title">{mat.title}</span>
                        <div className="material-stat-meta">
                          <span>👁️ {mat.views} {t.views}</span>
                          <span>👤 {mat.uniqueUsers} {t.uniqueUsers}</span>
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
                <h3>{t.testHistory}</h3>
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
                  <p className="no-data">{t.chooseUserHistory}</p>
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