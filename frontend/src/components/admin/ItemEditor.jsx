// src/components/admin/ItemEditor.jsx
import { useState, useEffect } from 'react'

function ItemEditor({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'theory',
    content: '',
    description: '',
    videoUrl: '',
    files: []
  })

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        type: item.type || 'theory',
        content: item.content || '',
        description: item.description || '',
        videoUrl: item.videoUrl || '',
        files: item.files || []
      })
    }
  }, [item])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...item,
      ...formData,
      updatedAt: new Date().toISOString()
    })
  }

  const addFile = () => {
    const fileName = prompt('Название файла:')
    const fileUrl = prompt('URL файла:')
    if (fileName && fileUrl) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, { name: fileName, url: fileUrl }]
      }))
    }
  }

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="item-editor-overlay">
      <div className="item-editor">
        <div className="item-editor-header">
          <h3>Редактирование: {item?.title}</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="item-editor-form">
          <div className="form-group">
            <label>Название *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Введите название"
            />
          </div>

          <div className="form-group">
            <label>Тип материала</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="theory">📝 Теория</option>
              <option value="practice">⚡ Практика</option>
              <option value="test">✅ Тест</option>
              <option value="video">🎥 Видео</option>
              <option value="presentation">📊 Презентация</option>
              <option value="file">📁 Файлы</option>
            </select>
          </div>

          <div className="form-group">
            <label>Краткое описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Краткое описание материала"
            />
          </div>

          {(formData.type === 'theory' || formData.type === 'practice') && (
            <div className="form-group">
              <label>Основной контент (HTML)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="10"
                placeholder="<h2>Заголовок</h2><p>Текст материала...</p>"
                className="content-editor"
              />
              <small>Можно использовать HTML теги</small>
            </div>
          )}

          {formData.type === 'video' && (
            <div className="form-group">
              <label>Ссылка на видео</label>
              <input
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
          )}

          {(formData.type === 'file' || formData.type === 'presentation') && (
            <div className="form-group">
              <label>Прикрепленные файлы</label>
              <div className="files-list">
                {formData.files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>📄 {file.name}</span>
                    <button type="button" onClick={() => removeFile(index)}>✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addFile} className="btn-add-file">
                + Добавить файл
              </button>
            </div>
          )}

          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              💾 Сохранить
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemEditor