import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import '../pages/MainPage.css'

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
        <div className="header-badge">УМК</div>
        <h1 className="title">
          ЭЛЕКТРОННЫЙ УЧЕБНО-МЕТОДИЧЕСКИЙ КОМПЛЕКС
        </h1>
        <h2 className="subtitle">
          ТЕХНОЛОГИЯ СУШКИ
        </h2>
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
          <ul className="content-list">
            {tabs[active].content.map((item, i) => (
              <li key={i} className="content-item">
                <span className="item-marker">▸</span>
                <span className="item-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App