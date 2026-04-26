import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import SectionEditor from '../components/admin/SectionEditor'
import ItemEditor from '../components/admin/ItemEditor'
import './AdminPage.css'

const defaultSections = [
  {
    title: "УМК (Учебно-методический комплекс)",
    slug: "umk",
    icon: "📚",
    type: "section",
    items: [
      { title: "Модуль", type: "theory" },
      { title: "Пояснительная записка", type: "theory" }
    ]
  },
  {
    title: "Лекционные материалы",
    slug: "lections",
    icon: "📖",
    type: "section",
    items: [
      { title: "Лекции", type: "theory" }
    ]
  },
  {
    title: "Практические и лабораторные работы",
    slug: "practice",
    icon: "🔬",
    type: "section",
    items: [
      { title: "Учебные и методические материалы", type: "file" },
      { title: "Презентации", type: "presentation" },
      { title: "Видео лекции", type: "video" },
      { title: "Видео материалы", type: "video" }
    ]
  },
  {
    title: "Задания для самостоятельной работы студентов (СРС)",
    slug: "srs",
    icon: "✍️",
    type: "section",
    items: [
      { title: "Методические указания", type: "file" },
      { title: "Задания", type: "practice" },
      { title: "Семинары / Форум / Обратная связь", type: "practice" }
    ]
  },
  {
    title: "Контрольные задания",
    slug: "tests",
    icon: "✅",
    type: "section",
    items: [
      { title: "Контрольные вопросы", type: "test" },
      { title: "Контрольные задания", type: "test" }
    ]
  },
  {
    title: "Литература",
    slug: "literature",
    icon: "📕",
    type: "section",
    items: [
      { title: "Рекомендуемые источники", type: "file" }
    ]
  }
]

function AdminPage() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      setLoading(true)
      // Заменить потом на запрос API
      const savedSections = localStorage.getItem('umk_sections')
      if (savedSections) {
        setSections(JSON.parse(savedSections))
      } else {
        setSections(defaultSections)
        localStorage.setItem('umk_sections', JSON.stringify(defaultSections))
      }
    } catch (err) {
      console.error('Ошибка загрузки разделов:', err)
      setSections(defaultSections)
    } finally {
      setLoading(false)
    }
  }

  const saveSections = (newSections) => {
    setSections(newSections)
    localStorage.setItem('umk_sections', JSON.stringify(newSections))
  }

  const handleAddSection = (sectionData) => {
    const newSections = [...sections, {
      ...sectionData,
      items: []
    }]
    saveSections(newSections)
    setShowSectionForm(false)
  }

  const handleUpdateSection = (slug, sectionData) => {
    const newSections = sections.map(s => 
      s.slug === slug ? { ...s, ...sectionData } : s
    )
    saveSections(newSections)
    setEditingSection(null)
  }

  const handleDeleteSection = (slug) => {
    if (window.confirm('Вы уверены, что хотите удалить весь раздел?')) {
      const newSections = sections.filter(s => s.slug !== slug)
      saveSections(newSections)
      if (activeSection === slug) setActiveSection(null)
    }
  }

  const handleAddItem = (sectionSlug, itemData) => {
    const newSections = sections.map(s => {
      if (s.slug === sectionSlug) {
        return {
          ...s,
          items: [...s.items, itemData]
        }
      }
      return s
    })
    saveSections(newSections)
    setActiveItem(null)
  }

  const handleUpdateItem = (sectionSlug, itemIndex, itemData) => {
    const newSections = sections.map(s => {
      if (s.slug === sectionSlug) {
        const newItems = [...s.items]
        newItems[itemIndex] = itemData
        return { ...s, items: newItems }
      }
      return s
    })
    saveSections(newSections)
    setActiveItem(null)
  }

  const handleDeleteItem = (sectionSlug, itemIndex) => {
    if (window.confirm('Удалить этот материал?')) {
      const newSections = sections.map(s => {
        if (s.slug === sectionSlug) {
          return {
            ...s,
            items: s.items.filter((_, i) => i !== itemIndex)
          }
        }
        return s
      })
      saveSections(newSections)
    }
  }

  if (loading) {
    return <div className="admin-loading">Загрузка...</div>
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>📚 Панель управления УМК</h1>
          <p>Технология сушки</p>
        </div>
        <div className="admin-header-right">
          <span>{user?.name}</span>
          <button 
            className="btn-add-section"
            onClick={() => setShowSectionForm(true)}
          >
            + Новый раздел
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Боковая панель с разделами */}
        <aside className="admin-sidebar">
          <h3>Разделы курса</h3>
          <div className="sections-nav">
            {sections.map(section => (
              <div
                key={section.slug}
                className={`section-nav-item ${activeSection === section.slug ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(section.slug)
                  setActiveItem(null)
                }}
              >
                <span className="section-nav-icon">{section.icon}</span>
                <div className="section-nav-info">
                  <span className="section-nav-title">{section.title}</span>
                  <span className="section-nav-count">
                    {section.items?.length || 0} материалов
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Основная область */}
        <main className="admin-main">
          {activeSection ? (
            <SectionEditor
              section={sections.find(s => s.slug === activeSection)}
              onUpdate={(data) => handleUpdateSection(activeSection, data)}
              onDelete={() => handleDeleteSection(activeSection)}
              onAddItem={(data) => handleAddItem(activeSection, data)}
              onUpdateItem={(index, data) => handleUpdateItem(activeSection, index, data)}
              onDeleteItem={(index) => handleDeleteItem(activeSection, index)}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />
          ) : (
            <div className="admin-welcome">
              <h2>👈 Выберите раздел для редактирования</h2>
              <p>Или создайте новый раздел</p>
              <div className="admin-stats">
                <div className="stat-card">
                  <span className="stat-number">{sections.length}</span>
                  <span className="stat-label">Разделов</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">
                    {sections.reduce((acc, s) => acc + (s.items?.length || 0), 0)}
                  </span>
                  <span className="stat-label">Материалов</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Модальное окно для создания раздела */}
      {showSectionForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Создать новый раздел</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleAddSection({
                title: formData.get('title'),
                slug: formData.get('slug'),
                icon: formData.get('icon'),
                type: 'section'
              })
            }}>
              <div className="form-group">
                <label>Название раздела</label>
                <input name="title" required placeholder="Например: Лабораторные работы" />
              </div>
              <div className="form-group">
                <label>Slug (английскими буквами)</label>
                <input name="slug" required placeholder="labs" pattern="[a-z-]+" />
              </div>
              <div className="form-group">
                <label>Иконка</label>
                <select name="icon">
                  <option value="📚">📚 Учебник</option>
                  <option value="📖">📖 Лекции</option>
                  <option value="🔬">🔬 Практика</option>
                  <option value="✍️">✍️ Задания</option>
                  <option value="✅">✅ Тесты</option>
                  <option value="📕">📕 Литература</option>
                  <option value="🎥">🎥 Видео</option>
                  <option value="📊">📊 Презентации</option>
                </select>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-primary">Создать</button>
                <button type="button" className="btn-secondary" onClick={() => setShowSectionForm(false)}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage