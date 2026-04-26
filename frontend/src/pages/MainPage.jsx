import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import SubjectAPI from '../api/subject.js'
import '../pages/MainPage.css'
import { useNavigate } from 'react-router-dom'
import MaterialAPI from "../api/material"


const tabs = [
  {
    title: 'УМК',
    icon: '📚',
    content: ['Модуль', 'Пояснительная записка']
  },
  {
    title: 'Лекционные материалы',
    icon: '📖',
    content: ['Лекции']
  },
  {
    title: 'Практические и лабораторные работы',
    icon: '🔬',
    content: [
      'Учебные и методические материалы',
      'Презентации',
      'Видео лекции',
      'Видео материалы'
    ]
  },
  {
    title: 'СРС',
    icon: '✍️',
    content: [
      'Методические указания',
      'Задания',
      'Семинары / Форум / Обратная связь'
    ]
  },
  {
    title: 'Контрольные задания',
    icon: '✅',
    content: [
      'Контрольные вопросы',
      'Контрольные задания'
    ]
  },
  {
    title: 'Литература',
    icon: '📕',
    content: ['Рекомендуемые источники']
  }
]

function App() {
  const [active, setActive] = useState(0)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const handleBadgeClick = () => {
  const currentTime = Date.now()
    
    if (currentTime - lastClickTime > 2000) {
      setClickCount(1)
    } else {
      setClickCount(prev => prev + 1)
    }
    
    setLastClickTime(currentTime)
    
    // При тройном клике переходим в админку
    if (clickCount === 2) { 
      console.log("Нажата") // 2 потому что это будет третий клик
      navigate('/admin')
      setClickCount(0) 
    }
  }


    const [subjects, setSubjects] = useState([])
    const [selectedSubject, setSelectedSubject] = useState(null)

    const [materials, setMaterials] = useState([])

    useEffect(() => {
        SubjectAPI.getSubjects()
            .then(data => {
                setSubjects(data)
                setSelectedSubject(data[0])
            })
    }, [])

    useEffect(() => {
        if (!selectedSubject) return

        MaterialAPI.getBySubject(selectedSubject.id)
            .then(data => {
                setMaterials(data)
            })
    }, [selectedSubject])

    const categoryMap = {
        0: "SYLLABUS",
        1: "LECTURE",
        2: "LAB",
        3: "SRS",
        4: "TEST",
        5: "LITERATURE"
    }

    const subcategoryMap = {
        SYLLABUS: [
            "Модуль",
            "Пояснительная записка"
        ],

        LECTURE: [
            "Лекции",
            "Презентации",
            "Видео лекции"
        ],

        LAB: [
            "Учебные материалы",
            "Методические материалы",
            "Видео материалы"
        ],

        SRS: [
            "Методические указания",
            "Задания",
            "Семинары / Форум / Обратная связь"
        ],

        TEST: [
            "Контрольные вопросы",
            "Контрольные задания"
        ],

        LITERATURE: [
            "Рекомендуемые источники"
        ]
    }

    const [activeSubcategory, setActiveSubcategory] = useState(null)

    useEffect(() => {
        setActiveSubcategory(null)
    }, [active])

    const filteredMaterials = materials.filter(
        item =>
            item.category === categoryMap[active] &&
            item.subcategory === activeSubcategory
    )




    return (
    <div className="container">
      <div className="user-bar">
        <div className="user-info">
          <span className="user-avatar">👤</span>
          <span className="user-name">{user?.name || 'Пользователь'}</span>
        </div>
        <button onClick={logout} className="logout-button">
          Выйти
        </button>
      </div>

      <header className="header">
         <div 
          className="header-badge"
          onClick={handleBadgeClick}
          title="Нажмите 3 раза для входа в админку"
          style={{ cursor: 'pointer' }}
        >
          ЭУМК
          {/* Подсказка появляется при наведении */}
          {clickCount > 0 && (
            <span className="click-hint">
              {3 - clickCount} нажатий осталось
            </span>
          )}
        </div>
        <h1 className="title">
          ЭЛЕКТРОННЫЙ УЧЕБНО-МЕТОДИЧЕСКИЙ КОМПЛЕКС
        </h1>
          <div className="subject-select-wrapper">
              <p className="subject-label">Выберите предмет</p>

              <div className="subjects-list">
                  {subjects.map((subject) => (
                      <button
                          key={subject.id}
                          className={`subject-card ${
                              selectedSubject?.id === subject.id ? "active-subject" : ""
                          }`}
                          onClick={() => setSelectedSubject(subject)}
                      >
                          {subject.title}
                      </button>
                  ))}
              </div>
          </div>
      </header>



      <div className="tabs-wrapper">
        <div className="tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab ${active === index ? 'active' : ''}`}
              onClick={() => setActive(index)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-title">{tab.title}</span>
              {active === index && <div className="active-indicator" />}
            </button>
          ))}
        </div>
      </div>

      <div className="content">
        <div className="content-header">
          <span className="content-icon">{tabs[active].icon}</span>
          <h3 className="content-title">{tabs[active].title}</h3>
        </div>
        <div className="content-body">
            <div className="subcategory-list">
                {subcategoryMap[categoryMap[active]]?.map((sub) => (
                    <button
                        key={sub}
                        className={`subcategory-btn ${
                            activeSubcategory === sub
                                ? "active-sub-btn"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveSubcategory(sub)
                        }
                    >
                        {sub}
                    </button>
                ))}
            </div>

            {activeSubcategory && (
                <div className="materials-block">
                    {filteredMaterials.length > 0 ? (
                        <ul className="content-list">
                            {filteredMaterials.map((item) => (
                                <li
                                    key={item.id}
                                    className="content-item"
                                >
                        <span className="item-marker">
                            📄
                        </span>

                                    <a
                                        href={`https://umk-qu6t.onrender.com/materials/download/${item.id}`}
                                        className="item-text"
                                    >
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-materials">
                            Материалы пока не добавлены
                        </p>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default App