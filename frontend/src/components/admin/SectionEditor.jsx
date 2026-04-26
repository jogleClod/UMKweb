// src/components/admin/SectionEditor.jsx
import { useState } from 'react'
import ItemEditor from './ItemEditor'  // Добавь этот импорт!

const contentTypes = {
  theory: { label: 'Теория', icon: '📝', color: '#4CAF50' },
  practice: { label: 'Практика', icon: '⚡', color: '#FF9800' },
  test: { label: 'Тест', icon: '✅', color: '#9C27B0' },
  video: { label: 'Видео', icon: '🎥', color: '#F44336' },
  presentation: { label: 'Презентация', icon: '📊', color: '#2196F3' },
  file: { label: 'Файлы', icon: '📁', color: '#607D8B' }
}

function SectionEditor({ 
  section, 
  onUpdate, 
  onDelete, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem,
  activeItem,
  setActiveItem 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(section.title)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleSaveTitle = () => {
    onUpdate({ title: editTitle })
    setIsEditing(false)
  }

  return (
    <div className="section-editor">
      {/* Заголовок раздела */}
      <div className="section-editor-header">
        <div className="section-title-area">
          {isEditing ? (
            <div className="edit-title-form">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="edit-title-input"
                autoFocus
              />
              <button onClick={handleSaveTitle} className="btn-icon">✓</button>
              <button onClick={() => setIsEditing(false)} className="btn-icon">✕</button>
            </div>
          ) : (
            <h2>
              <span className="section-icon-large">{section.icon}</span>
              {section.title}
              <button onClick={() => setIsEditing(true)} className="btn-edit-title">
                ✏️
              </button>
            </h2>
          )}
          <span className="items-count">{section.items?.length || 0} материалов</span>
        </div>
        <div className="section-actions">
          <button 
            className="btn-add-item"
            onClick={() => setShowAddForm(true)}
          >
            + Добавить материал
          </button>
          <button 
            className="btn-delete-section"
            onClick={onDelete}
          >
            🗑️ Удалить раздел
          </button>
        </div>
      </div>

      {/* Форма добавления материала */}
      {showAddForm && (
        <div className="add-item-form">
          <h3>Добавить новый материал</h3>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            onAddItem({
              title: formData.get('title'),
              type: formData.get('type'),
              content: '',
              createdAt: new Date().toISOString()
            })
            setShowAddForm(false)
          }}>
            <div className="form-row">
              <div className="form-group">
                <label>Название материала</label>
                <input 
                  name="title" 
                  required 
                  placeholder="Например: Лекция 1. Введение в сушку" 
                />
              </div>
              <div className="form-group">
                <label>Тип материала</label>
                <select name="type" required>
                  {Object.entries(contentTypes).map(([value, { label, icon }]) => (
                    <option key={value} value={value}>
                      {icon} {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-primary">Добавить</button>
              <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список материалов */}
      <div className="items-grid">
        {section.items?.length > 0 ? (
          section.items.map((item, index) => (
            <div 
              key={`${section.slug}-${index}`}  // Уникальный ключ!
              className={`item-card ${activeItem === index ? 'active' : ''}`}
              onClick={() => setActiveItem(activeItem === index ? null : index)}
            >
              <div className="item-card-header">
                <span 
                  className="item-type-badge"
                  style={{ background: contentTypes[item.type]?.color }}
                >
                  {contentTypes[item.type]?.icon} {contentTypes[item.type]?.label}
                </span>
                <div className="item-card-actions">
                  <button 
                    className="btn-icon-small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteItem(index)
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h4 className="item-title">{item.title}</h4>
              {item.content && (
                <p className="item-preview">
                  {item.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </p>
              )}
              <div className="item-footer">
                <span className="item-date">
                  {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-items">
            <p>В этом разделе пока нет материалов</p>
            <p>Нажмите "Добавить материал" чтобы начать</p>
          </div>
        )}
      </div>

      {/* Редактор контента для выбранного материала */}
      {activeItem !== null && section.items[activeItem] && (
        <ItemEditor
          item={section.items[activeItem]}
          onSave={(data) => onUpdateItem(activeItem, data)}
          onClose={() => setActiveItem(null)}
        />
      )}
    </div>
  )
}

export default SectionEditor