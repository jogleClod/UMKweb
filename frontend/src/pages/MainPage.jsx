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
        key: "normative_materials",
        titleRu: "Нормативно-методические материалы",
        titleKg: "Нормативдик-методикалык материалдар",
        titleDe: "Normativ-methodische Materialien",

        category: "SYLLABUS"
    },

    {
        key: "theory_course",
        titleRu: "Теоретический курс",
        titleKg: "Теориялык курс",
        titleDe: "Theoretischer Kurs",

        category: "LECTURE"
    },

    {
        key: "practice_course",
        titleRu: "Практический курс",
        titleKg: "Практикалык курс",
        titleDe: "Praktischer Kurs",

        category: "LAB"
    },

    {
        key: "srs",
        titleRu: "Самостоятельная работа студентов",
        titleKg: "Студенттердин өз алдынча иши",
        titleDe: "Selbstständige Arbeit der Studierenden",

        category: "SRS"
    },

    {
        key: "assessment_tools",
        titleRu: "Оценочные средства",
        titleKg: "Баалоо каражаттары",
        titleDe: "Bewertungsmittel",

        category: "TEST"
    },

    {
        key: "sources",
        titleRu: "Источники",
        titleKg: "Булактар",
        titleDe: "Quellen",

        category: "LITERATURE"
    }
]

const subcategoryMap = {
    SYLLABUS: [
        {
            key: "module",
            ru: "Модуль",
            kg: "Модуль",
            de: "Modul"
        },

        {
            key: "explanatory_note",
            ru: "Пояснительная записка",
            kg: "Түшүндүрмө кат",
            de: "Erläuterungsschreiben"
        },

        {
            key: "work_program",
            ru: "Рабочая программа",
            kg: "Жумушчу программа",
            de: "Arbeitsprogramm"
        },

        {
            key: "syllabus",
            ru: "Силлабус",
            kg: "Силлабус",
            de: "Syllabus"
        },

        {
            key: "dictionary",
            ru: "Терминологический словарь",
            kg: "Терминологиялык сөздүк",
            de: "Terminologisches Wörterbuch"
        },

        {
            key: "glossary",
            ru: "Глоссарий",
            kg: "Глоссарий",
            de: "Glossar"
        },

        {
            key: "methods",
            ru: "Методы обучения",
            kg: "Окутуу методдору",
            de: "Lehrmethoden"
        }
    ],

    LECTURE: [
        {
            key: "lectures",
            ru: "Курс лекций",
            kg: "Лекция курсу",
            de: "Vorlesungskurs"
        },

        {
            key: "presentations",
            ru: "Презентации",
            kg: "Презентациялар",
            de: "Präsentationen"
        },

        {
            key: "video_lectures",
            ru: "Видео лекции",
            kg: "Видео лекциялар",
            de: "Videovorlesungen"
        },

        {
            key: "textbook",
            ru: "Учебник",
            kg: "Окуу китеби",
            de: "Lehrbuch"
        }
    ],

    LAB: [
        {
            key: "lab_guides",
            ru: "Методические указания к выполнению лабораторных работ",
            kg: "Лабораториялык иштер боюнча көрсөтмөлөр",
            de: "Methodische Anweisungen zur Durchführung von Laborarbeiten"
        },

        {
            key: "video_materials",
            ru: "Видео материалы",
            kg: "Видео материалдар",
            de: "Videomaterialien"
        }
    ],

    SRS: [
        {
            key: "guidelines",
            ru: "Методические указания",
            kg: "Методикалык көрсөтмөлөр",
            de: "Methodische Anweisungen"
        },

        {
            key: "tasks",
            ru: "Задания",
            kg: "Тапшырмалар",
            de: "Aufgaben"
        }
    ],

    TEST: [
        {
            key: "control_questions",
            ru: "Контрольные вопросы",
            kg: "Көзөмөл суроолору",
            de: "Kontrollfragen"
        },

        {
            key: "control_tasks",
            ru: "Контрольные задания",
            kg: "Көзөмөл тапшырмалары",
            de: "Kontrollaufgaben"
        },

        {
            key: "tests",
            ru: "Тесты",
            kg: "Тесттер",
            de: "Tests"
        },

        {
            key: "situational_tasks",
            ru: "Ситуационные задачи",
            kg: "Ситуациялык тапшырмалар",
            de: "Situationsaufgaben"
        }
    ],

    LITERATURE: [
        {
            key: "recommended_sources",
            ru: "Рекомендуемые источники",
            kg: "Сунушталган булактар",
            de: "Empfohlene Quellen"
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
        (Array.isArray(tests)
                ? tests
                : []
        ).reduce((acc, question) => {
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

    const filteredGroupedTests =
        groupedTests.filter(test => {

            const firstQuestion =
                test.questions[0]

            if (!firstQuestion) return false

            // Обычные тесты
            if (
                activeSubcategory === "Тесты"
            ) {
                return (
                    firstQuestion.testType ===
                    "TEST"
                )
            }

            // Ситуационные задачи
            if (
                activeSubcategory ===
                "Ситуационные задачи"
            ) {
                return (
                    firstQuestion.testType ===
                    "SITUATION"
                )
            }

            return false
        })

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
            const answeredQuestions =
                new Set(
                    userAnswers.map(
                        item => item.questionId
                    )
                )

            if (
                answeredQuestions.size !==
                selectedTest.questions.length
            ) {
                alert("Ответьте на все вопросы")
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
        if (
            activeSubcategory === "Тесты" ||
            activeSubcategory ===
            "Ситуационные задачи"
        ){
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
                       <button
                          className={
                              language === "de"
                                  ? "active-lang"
                                  : ""
                          }
                          onClick={() =>
                              setLanguage("de")
                          }
                      >
                          DE
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
        language === "kg"
          ? subcategoryMap[tab.category][0].kg
          : language === "de"
          ? subcategoryMap[tab.category][0].de
          : subcategoryMap[tab.category][0].ru
      )
    }
  }}
            >
               {
    language === "kg"
      ? tab.titleKg
      : language === "de"
      ? tab.titleDe
      : tab.titleRu
  }
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
          activeSubcategory ===
          (
            language === "kg"
              ? sub.kg
              : language === "de"
              ? sub.de
              : sub.ru
          )
            ? "active-subcategory"
            : ""
        }
        onClick={() => {
          setActiveCategory(tab.category)

          setActiveSubcategory(
            language === "kg"
              ? sub.kg
              : language === "de"
              ? sub.de
              : sub.ru
          )
        }}
      >
        • {
          language === "kg"
            ? sub.kg
            : language === "de"
            ? sub.de
            : sub.ru
        }
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
                          <h2>{t.subject}</h2>

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
                                  🎓 {t.titleMainPage}
                              </div>

                              <h1>
                                  {t.welcome} <br />
                                  {t.welcome2}
                              </h1>

                              <h3>
                                  {t.toWhere}
                                  <span> {t.tit}</span>
                              </h3>

                              <p className="welcome-description">
                                  {t.titDesc}
                              </p>

                              <div className="find-section">
                                  <h2>📘 {t.uWillFound}:</h2>

                                  <ul>
                                        <li>📢 {t.lab1}</li>
                                        <li>📄 {t.lab2}</li>
                                        <li>🎥 {t.lab3}</li>
                                        <li>🧪 {t.lab4}</li>
                                        <li>📅 {t.lab5}</li>
                                        <li>📝 {t.lab6}</li>
                                        <li>📚 {t.lab7}</li>
                                    </ul>
                              </div>

                              <div className="info-box">
                                {t.infoB}
                              </div>


                              <div className="success-box">
  ✅ {t.infoB2}
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
    <h3>📚 {t.ad1}</h3>
    <p>{t.ad2}</p>
  </div>

  <div className="advantage-card">
    <h3>⏰ {t.ad3}</h3>
    <p>{t.ad4}</p>
  </div>

  <div className="advantage-card">
    <h3>🎯 {t.ad5}</h3>
    <p>{t.ad6}</p>
  </div>

  <div className="advantage-card">
    <h3>💻 {t.ad7}</h3>
    <p>{t.ad8}</p>
  </div>
</div>
                  </>
          ): (
              activeSubcategory === "Тесты" ||
              activeSubcategory ===
              "Ситуационные задачи"
          ) ? (

              <div className="test-container">

                  {!selectedTest ? (
                      <>
                          <h2>{t.availableTests}</h2>

                          <div className="tests-list">
                              {filteredGroupedTests.map(
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

                                      {
                                          question.testType === "TEST" ? (

                                              <div className="answers-list">
                                                  {question.answers.map(
                                                      (answer) => (
                                                          <label
                                                              key={answer.id}
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

                                                                      updated.push({
                                                                          questionId:
                                                                          question.id,

                                                                          answerId:
                                                                          answer.id
                                                                      })

                                                                      setUserAnswers(
                                                                          updated
                                                                      )
                                                                  }}
                                                              />

                                                              {answer.text}
                                                          </label>
                                                      )
                                                  )}
                                              </div>

                                          ) : (

                                              <textarea
                                                  className="situation-answer-input"
                                                  placeholder="Введите ваш ответ..."

                                                  onChange={(e) => {

                                                      const updated =
                                                          userAnswers.filter(
                                                              item =>
                                                                  item.questionId !==
                                                                  question.id
                                                          )

                                                      updated.push({
                                                          questionId:
                                                          question.id,

                                                          textAnswer:
                                                          e.target.value
                                                      })

                                                      setUserAnswers(updated)
                                                  }}
                                              />

                                          )
                                      }
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