import { useState, useEffect, useRef } from "react"
import { useAuth } from "../hooks/useAuth"
import SubjectAPI from "../api/subject.js"
import MaterialAPI from "../api/material"
import { useNavigate } from "react-router-dom"
import "../pages/MainPage.css"
import TestAPI from "../api/test"
import { translations } from "../constants/translations"
import profileIcon from "../assets/ic_prof.svg"
import logoIcon from "../assets/ic_logo.png"
import dryingImg from "../images/img.png"
import fruitsImg from "../images/img_1.png"
import fruitsImg2 from "../images/img_2.png"


const tabs = [
    {
        key: "syllabus",
        category: "SYLLABUS"
    },
    {
        key: "lectures",
        category: "LECTURE"
    },
    {
        key: "labs",
        category: "LAB"
    },
    {
        key: "srs",
        category: "SRS"
    },
    {
        key: "tests",
        category: "TEST"
    },
    {
        key: "literature",
        category: "LITERATURE"
    }
]

const subcategoryMap = {
    SYLLABUS: [
        {
            key: "module",
            ru: "Модуль",
            kg: "Модуль"
        },
        {
            key: "explanatory_note",
            ru: "Пояснительная записка",
            kg: "Түшүндүрмө кат"
        }
    ],

    LECTURE: [
        {
            key: "lectures",
            ru: "Лекции",
            kg: "Лекциялар"
        },
        {
            key: "presentations",
            ru: "Презентации",
            kg: "Презентациялар"
        },
        {
            key: "video_lectures",
            ru: "Видео лекции",
            kg: "Видео лекциялар"
        }
    ],

    LAB: [
        {
            key: "study_materials",
            ru: "Учебные материалы",
            kg: "Окуу материалдары"
        },
        {
            key: "method_materials",
            ru: "Методические материалы",
            kg: "Методикалык материалдар"
        },
        {
            key: "video_materials",
            ru: "Видео материалы",
            kg: "Видео материалдар"
        }
    ],

    SRS: [
        {
            key: "guidelines",
            ru: "Методические указания",
            kg: "Методикалык көрсөтмөлөр"
        },
        {
            key: "tasks",
            ru: "Задания",
            kg: "Тапшырмалар"
        }
    ],

    TEST: [
        {
            key: "control_questions",
            ru: "Контрольные вопросы",
            kg: "Көзөмөл суроолору"
        },
        {
            key: "control_tasks",
            ru: "Контрольные задания",
            kg: "Көзөмөл тапшырмалары"
        },
        {
            key: "tests",
            ru: "Тесты",
            kg: "Тесттер"
        },
        {
            key: "situational_tasks",
            ru: "Ситуационные задачи",
            kg: "Ситуациялык тапшырмалар"
        }
    ],

    LITERATURE: [
        {
            key: "recommended_sources",
            ru: "Рекомендуемые источники",
            kg: "Сунушталган булактар"
        }
    ]
}


function App() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [subjects, setSubjects] = useState([])
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [materials, setMaterials] = useState([])

    const [activeCategory, setActiveCategory] = useState(null)
    const [activeSubcategory, setActiveSubcategory] = useState(null)

    const clickCountRef = useRef(0)
    const clickTimerRef = useRef(null)
    const [showHint, setShowHint] = useState(false)


    useEffect(() => {
        SubjectAPI.getSubjects().then(data => {
            setSubjects(data)
            if (data.length > 0) {
                setSelectedSubject(data[0])
            }
        })
    }, [])

    useEffect(() => {
        if (!selectedSubject) return

        MaterialAPI.getBySubject(selectedSubject.id)
            .then(data => {
                setMaterials(data)
            })
    }, [selectedSubject])

    const handleBadgeClick = () => {
        clickCountRef.current += 1
        setShowHint(true)

        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current)
        }

        if (clickCountRef.current >= 3) {
            navigate("/admin")
            clickCountRef.current = 0
            setShowHint(false)
            return
        }

        clickTimerRef.current = setTimeout(() => {
            clickCountRef.current = 0
            setShowHint(false)
        }, 2000)
    }

    const filteredMaterials = materials.filter(
        item =>
            item.category === activeCategory &&
            item.subcategory === activeSubcategory
    )

    const [openedMenu, setOpenedMenu] = useState(null)

    const [tests, setTests] = useState([])
    const [userAnswers, setUserAnswers] = useState([])
    const [testResult, setTestResult] = useState(null)
    const [testHistory, setTestHistory] = useState([])
    const [selectedTest, setSelectedTest] =
        useState(null)

    const [startTest, setStartTest] =
        useState(false)



    const loadTests = async () => {
        try {
            const data =
                await TestAPI.getTestsBySubject(
                    selectedSubject.id
                )

            console.log("TESTS:", data)

            setTests(data)
        } catch (error) {
            console.log(error)
        }
    }

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

    const loadTestHistory = async () => {
        try {
            const data =
                await TestAPI.getMyResults()

            setTestHistory(data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleSubmitTest = async () => {
        try {
            if (
                userAnswers.length !==
                selectedTest.questions.length
            ) {
                alert(
                    "Ответьте на все вопросы"
                )
                return
            }

            const result =
                await TestAPI.submitTest({
                    subjectId: selectedSubject.id,
                    testTitle: selectedTest.title,
                    answers: userAnswers
                })

            setTestResult(result)
            setStartTest(false)

            // очищаем ответы
            setUserAnswers([])
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (activeSubcategory === "Тесты") {
            console.log("Открыли тесты")
            console.log("selectedSubject:", selectedSubject)

            loadTests()
            loadTestHistory()
        }
    }, [activeSubcategory, selectedSubject])


    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("language") || "ru"
    })

    useEffect(() => {
        localStorage.setItem(
            "language",
            language
        )
    }, [language])


    const t =
        translations[language]

    return (
  <div className="page">

    {/* HEADER */}
      <div className="top-bar">
          <div className="top-bar-inner">

              <div className="left-header">
                  <div
                      className="logo-circle"
                      onClick={handleBadgeClick}
                  >
                      <img
                          src={logoIcon}
                          alt="logo"
                      />

                      {showHint && (
                          <div className="hint-box">
                              Ещё {3 - clickCountRef.current} нажатия
                          </div>
                      )}
                  </div>

                  <div className="header-text-block">
                      <h1>{t.titleMainPage}</h1>
                  </div>
              </div>

              <div className="right-header">

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

                  <div
                      className="profile-btn"
                      onClick={() =>
                          navigate("/profile")
                      }
                  >
                      <img
                          className="icon"
                          src={profileIcon}
                          alt="profile-user-account"
                      />
                  </div>

              </div>
          </div>
      </div>

    {/* CONTENT */}
    <div className="main-container">

      {/* MAIN NAV */}
      <div className="horizontal-menu">

          <div className="menu-column home-column">
              <h3
                  onClick={() => {
                      setActiveCategory(null)
                      setActiveSubcategory(null)
                      setOpenedMenu(null)
                      setSelectedTest(null)
                      setStartTest(false)
                  }}
              >
                  {t.main}
              </h3>
          </div>
        {tabs.map(tab => (
          <div
            key={tab.key}
            className={`menu-column ${
              activeCategory === tab.category
                ? "active-column"
                : ""
            }`}
          >
            <h3
              onClick={() => {
                if (openedMenu === tab.category) {
                  setOpenedMenu(null)
                } else {
                  setOpenedMenu(tab.category)
                }

                setActiveCategory(tab.category)

                if (
                  tab.category &&
                  subcategoryMap[tab.category]?.length > 0
                ) {
                  setActiveSubcategory(
                    subcategoryMap[tab.category][0].ru
                  )
                }
              }}
            >
              {t[tab.key]}
            </h3>

            <div
              className={`submenu ${
                openedMenu === tab.category
                  ? "submenu-open"
                  : ""
              }`}
            >
              {openedMenu === tab.category &&
                subcategoryMap[tab.category]?.map(sub => (
                  <p
                    key={sub.key}
                    className={
                      activeSubcategory === sub.ru
                        ? "active-subcategory"
                        : ""
                    }
                    onClick={() => {
                      setActiveCategory(tab.category)
                      setActiveSubcategory(sub.ru)
                    }}
                  >
                    • {language === "kg" ? sub.kg : sub.ru}
                  </p>
                ))}
            </div>
          </div>
        ))}
      </div>

    </div>

            {/* MATERIALS */}
      <div className="materials-section">

          {!activeSubcategory ? (
                  <>
                      <div className="slider-section">
                          <h2>Технология сушки</h2>

                          <div className="slider-container">
                              <div className="slider-track">
                                  <img src={fruitsImg} alt="" />
                                  <img src={fruitsImg2} alt="" />
                                  <img src={dryingImg} alt="" />

                                  <img src={fruitsImg} alt="" />
                                  <img src={fruitsImg2} alt="" />
                                  <img src={dryingImg} alt="" />
                              </div>
                          </div>
                      </div>

                      <div className="welcome-section">
                          <div className="welcome-left">
                              <div className="welcome-badge">
                                  🎓 ЭЛЕКТРОННЫЙ УЧЕБНО-МЕТОДИЧЕСКИЙ КОМПЛЕКС
                              </div>

                              <h1>
                                  Добро пожаловать <br />
                                  на портал
                              </h1>

                              <h3>
                                  электронного учебно-методического комплекса курса
                                  <span> «Технология сушки»</span>
                              </h3>

                              <p className="welcome-description">
                                  Данный комплекс создан с целью обеспечить студентов
                                  всем необходимым для эффективного освоения учебного
                                  материала: лекциями, практическими и лабораторными
                                  заданиями, методическими указаниями, тестами и
                                  рекомендованной литературой.
                              </p>

                              <div className="find-section">
                                  <h2>📘 Здесь вы найдете:</h2>

                                  <ul>
                                      <li>📢 Объявления и важные новости курса</li>
                                      <li>📄 Пояснительные записки и силлабусы</li>
                                      <li>🎥 Лекции, презентации и видеоматериалы</li>
                                      <li>🧪 Практические и лабораторные работы с методическими указаниями</li>
                                      <li>📅 Задания для самостоятельной работы с дедлайнами</li>
                                      <li>📝 Темы курсовых проектов и контрольные задания</li>
                                      <li>📚 Рекомендуемую литературу и глоссарий терминов</li>
                                  </ul>
                              </div>

                              <div className="info-box">
                                  ℹ️ Материалы курса структурированы для удобного и
                                  последовательного изучения. Рекомендуется проходить
                                  их в указанной последовательности, выполнять задания
                                  в срок и использовать все доступные ресурсы для
                                  закрепления знаний.
                              </div>

                              <div className="success-box">
                                  ✅ Желаем успешного обучения и продуктивной работы
                                  с электронным учебно-методическим комплексом!
                              </div>
                          </div>

                          <div className="welcome-right">
                              <img src={fruitsImg} alt="" />
                              <img src={fruitsImg2} alt="" />
                              <img src={dryingImg} alt="" />
                          </div>
                      </div>
                      <div className="advantages-section">
                          <div className="advantage-card">
                              <h3>📚 Удобная структура</h3>
                              <p>Все материалы разделены по темам</p>
                          </div>

                          <div className="advantage-card">
                              <h3>⏰ Доступ 24/7</h3>
                              <p>Учитесь в любое удобное время</p>
                          </div>

                          <div className="advantage-card">
                              <h3>🎯 Эффективное обучение</h3>
                              <p>Практика + тесты + материалы</p>
                          </div>

                          <div className="advantage-card">
                              <h3>💻 Доступ с любых устройств</h3>
                              <p>Телефон, планшет, компьютер</p>
                          </div>
                      </div>
                  </>
          ): activeSubcategory === "Тесты" ? (

              <div className="test-container">

                  {!selectedTest ? (
                      <>
                          <h2>{t.availableTests}</h2>

                          <div className="tests-list">
                              {groupedTests.map(
                                  (test, index) => (
                                      <div
                                          key={index}
                                          className="test-list-card"
                                      >
                                          <h3>
                                              {test.title}
                                          </h3>

                                          <p>
                                              {t.questions}:
                                              {
                                                  test.questions
                                                      .length
                                              }
                                          </p>

                                          <button
                                              onClick={() =>
                                                  setSelectedTest(
                                                      test
                                                  )
                                              }
                                          >
                                              {t.open}
                                          </button>
                                      </div>
                                  )
                              )}
                          </div>
                      </>
                  ) : !startTest ? (
                      <div className="test-preview-card">
                          <h2>
                              {selectedTest.title}
                          </h2>

                          <p>
                              {t.questionCount}:
                              {
                                  selectedTest.questions
                                      .length
                              }
                          </p>

                          <button
                              className="start-test-btn"
                              onClick={() =>
                                  setStartTest(true)
                              }
                          >
                              {t.startTest}
                          </button>

                          <button
                              className="back-btn"
                              onClick={() =>
                                  setSelectedTest(
                                      null
                                  )
                              }
                          >
                              {t.back}
                          </button>
                      </div>
                  ) : (
                      <>
                          <h2>{t.passingTest}</h2>

                          {selectedTest.questions.map(
                              (question) => (
                                  <div
                                      key={question.id}
                                      className="test-question"
                                  >
                                      <h3>
                                          {question.text}
                                      </h3>

                                      <div className="answers-list">
                                          {question.answers.map(
                                              (
                                                  answer
                                              ) => (
                                                  <label
                                                      key={
                                                          answer.id
                                                      }
                                                      className="answer-option"
                                                  >
                                                      <input
                                                          type="radio"
                                                          name={`question-${question.id}`}
                                                          onChange={() => {
                                                              const updated =
                                                                  userAnswers.filter(
                                                                      item =>
                                                                          item.questionId !==
                                                                          question.id
                                                                  )

                                                              updated.push(
                                                                  {
                                                                      questionId:
                                                                      question.id,
                                                                      answerId:
                                                                      answer.id
                                                                  }
                                                              )

                                                              setUserAnswers(
                                                                  updated
                                                              )
                                                          }}
                                                      />

                                                      {
                                                          answer.text
                                                      }
                                                  </label>
                                              )
                                          )}
                                      </div>
                                  </div>
                              )
                          )}

                          <button
                              className="submit-test-btn"
                              onClick={
                                  handleSubmitTest
                              }
                          >
                              {t.finishTest}
                          </button>
                      </>
                  )}

                  {testResult && (
                      <div className="result-box">
                          <h3>
                              {t.result}
                          </h3>

                          <p>
                              {t.score}:
                              {
                                  testResult.result
                                      .score
                              } /
                              {
                                  testResult.result
                                      .total
                              }
                          </p>

                          <p>
                              {t.percent}:
                              {
                                  testResult.result
                                      .percent
                              }%
                          </p>
                      </div>
                  )}
              </div>

              ) : filteredMaterials.length > 0 ? (
              <div className="materials-grid">
                  {filteredMaterials.map((material) => (
                      <div
                          key={material.id}
                          className="material-card"
                      >
                          <div className="material-info">
                              <h3 className="material-title">
                                  {material.title}
                              </h3>

                              <p className="material-description">
                                  {material.description ||
                                      t.noDescription}
                              </p>

                              <div className="material-meta">
                            <span>
                                📁 {material.type}
                            </span>

                                  <span>
                                👤 {
                                      material.author?.name
                                  }
                            </span>

                                  <span>
                                📅{" "}
                                      {new Date(
                                          material.createdAt
                                      ).toLocaleDateString()}
                            </span>
                              </div>
                          </div>

                          <div className="material-actions">

                              {["VIDEO", "LINK"].includes(
                                  material.type
                              ) ? (
                                  <button
                                      className="view-btn"
                                      onClick={async () => {
                                          try {
                                              await MaterialAPI.markProgress(
                                                  material.id
                                              )

                                              window.open(
                                                  material.url,
                                                  "_blank"
                                              )
                                          } catch (error) {
                                              console.log(error)
                                          }
                                      }}
                                  >
                                      {t.watch}
                                  </button>
                              ) : (
                                  <>
                                      <button
                                          className="view-btn"
                                          onClick={async () => {
                                              try {
                                                  await MaterialAPI.markProgress(
                                                      material.id
                                                  )

                                                  window.open(
                                                      material.url,
                                                      "_blank"
                                                  )
                                              } catch (error) {
                                                  console.log(error)
                                              }
                                          }}
                                      >
                                          {t.open}
                                      </button>

                                      <button
                                          className="download-btn"
                                          onClick={async () => {
                                              try {
                                                  await MaterialAPI.markProgress(
                                                      material.id
                                                  )

                                                  window.location.href =
                                                      `https://umk-qu6t.onrender.com/materials/download/${material.id}`
                                              } catch (error) {
                                                  console.log(error)
                                              }
                                          }}
                                      >
                                          {t.download}
                                      </button>
                                  </>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
              ) : null
          }
      </div>
        </div>
    )
}

export default App