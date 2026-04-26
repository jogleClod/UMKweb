    import { useState, useEffect } from "react"
    import { useAuth } from "../hooks/useAuth"
    import SubjectAPI from "../api/subject"
    import MaterialAPI from "../api/material"
    import "./AdminPage.css"

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
        const { user } = useAuth()

        const [subjects, setSubjects] = useState([])
        const [selectedSubject, setSelectedSubject] = useState(null)

        const [materials, setMaterials] = useState([])

        const [activeSection, setActiveSection] = useState(null)
        const [activeSubcategory, setActiveSubcategory] = useState(null)

        const [title, setTitle] = useState("")
        const [description, setDescription] = useState("")
        const [file, setFile] = useState(null)
        const [videoUrl, setVideoUrl] = useState("")

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
                const data = await MaterialAPI.getBySubject(
                    selectedSubject.id
                )

                setMaterials(data)
            } catch (err) {
                console.log(err)
            }
        }

        const currentSection = sections.find(
            s => s.category === activeSection
        )

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
                formData.append(
                    "subjectId",
                    selectedSubject.id
                )

                let finalType = "PDF"

                if (
                    activeSubcategory.includes("Видео")
                ) {
                    finalType = videoUrl
                        ? "LINK"
                        : "VIDEO"
                } else if (file) {
                    const fileName =
                        file.name.toLowerCase()

                    if (
                        fileName.endsWith(".doc") ||
                        fileName.endsWith(".docx")
                    ) {
                        finalType = "DOC"
                    }
                    else if (
                        fileName.endsWith(".ppt") ||
                        fileName.endsWith(".pptx")
                    ) {
                        finalType =
                            "PRESENTATION"
                    }
                    else if (
                        fileName.endsWith(".xls") ||
                        fileName.endsWith(".xlsx")
                    ) {
                        finalType = "XLS"
                    }
                    else if (
                        fileName.endsWith(".png") ||
                        fileName.endsWith(".jpg") ||
                        fileName.endsWith(".jpeg")
                    ) {
                        finalType = "IMAGE"
                    }
                }

                formData.append(
                    "type",
                    finalType
                )

                if (videoUrl) {
                    formData.append(
                        "url",
                        videoUrl
                    )
                }

                if (file) {
                    formData.append(
                        "file",
                        file
                    )
                }

                await MaterialAPI.createMaterial(
                    formData
                )

                alert(
                    "Материал успешно добавлен"
                )

                loadMaterials()

                setTitle("")
                setDescription("")
                setFile(null)
                setVideoUrl("")

            } catch (err) {
                console.log(err)
                alert(
                    "Ошибка загрузки материала"
                )
            }
        }

        return (
            <div className="admin-page">
                <header className="admin-header">
                    <div>
                        <h1>📚 Панель администратора</h1>
                        <p>{user?.name}</p>
                    </div>

                    <div className="subject-actions">
                        <select
                            value={selectedSubject?.id || ""}
                            onChange={(e) => {
                                const subject = subjects.find(
                                    s =>
                                        s.id === Number(
                                            e.target.value
                                        )
                                )

                                setSelectedSubject(
                                    subject
                                )
                            }}
                        >
                            {subjects.map(subject => (
                                <option
                                    key={subject.id}
                                    value={subject.id}
                                >
                                    {subject.title}
                                </option>
                            ))}
                        </select>

                        {/* ДОБАВИТЬ */}
                        <button
                            className="add-subject-btn"
                            onClick={async () => {
                                try {
                                    const subjectTitle =
                                        prompt(
                                            "Введите название предмета"
                                        )

                                    if (!subjectTitle)
                                        return

                                    await SubjectAPI.createSubject(
                                        subjectTitle,
                                        ""
                                    )

                                    await loadSubjects()

                                    alert(
                                        "Предмет добавлен"
                                    )

                                } catch (err) {
                                    console.log(err)
                                    alert(
                                        "Ошибка создания предмета"
                                    )
                                }
                            }}
                        >
                            + Предмет
                        </button>

                        {/* УДАЛИТЬ */}
                        <button
                            className="delete-subject-btn"
                            onClick={async () => {
                                try {
                                    if (!selectedSubject)
                                        return

                                    const confirmDelete =
                                        window.confirm(
                                            `Удалить предмет "${selectedSubject.title}"?`
                                        )

                                    if (!confirmDelete)
                                        return

                                    await SubjectAPI.deleteSubject(
                                        selectedSubject.id
                                    )

                                    await loadSubjects()

                                    alert(
                                        "Предмет удален"
                                    )

                                } catch (err) {
                                    console.log(err)
                                    alert(
                                        "Ошибка удаления предмета"
                                    )
                                }
                            }}
                        >
                            Удалить предмет
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    <aside className="admin-sidebar">
                        <h3>Категории</h3>

                        {sections.map(section => (
                            <button
                                key={
                                    section.category
                                }
                                className={`admin-section-btn ${
                                    activeSection ===
                                    section.category
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => {
                                    setActiveSection(
                                        section.category
                                    )
                                    setActiveSubcategory(
                                        null
                                    )
                                }}
                            >
                                {section.icon}{" "}
                                {section.title}
                            </button>
                        ))}
                    </aside>

                    <main className="admin-main">
                        {!activeSection ? (
                            <div className="admin-empty">
                                Выберите категорию
                            </div>
                        ) : (
                            <>
                                <h2>
                                    {
                                        currentSection.title
                                    }
                                </h2>

                                <div className="subcategory-list">
                                    {currentSection.subcategories.map(
                                        sub => (
                                            <button
                                                key={sub}
                                                className={`subcategory-btn ${
                                                    activeSubcategory ===
                                                    sub
                                                        ? "active-sub"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveSubcategory(
                                                        sub
                                                    )
                                                }
                                            >
                                                {sub}
                                            </button>
                                        )
                                    )}
                                </div>

                                {activeSubcategory && (
                                    <>
                                        <div className="upload-box">
                                            <h3>
                                                Добавить материал
                                            </h3>

                                            <input
                                                type="text"
                                                placeholder="Название материала"
                                                value={
                                                    title
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setTitle(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <textarea
                                                placeholder="Описание"
                                                value={
                                                    description
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setDescription(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            {activeSubcategory.includes(
                                                "Видео"
                                            ) && (
                                                <input
                                                    type="text"
                                                    placeholder="YouTube ссылка (необязательно)"
                                                    value={
                                                        videoUrl
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setVideoUrl(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />
                                            )}

                                            <label className="custom-file-upload">
                                                <input
                                                    type="file"
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setFile(
                                                            e
                                                                .target
                                                                .files[0]
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

                                        <div className="materials-list">
                                            {filteredMaterials.map((material) => (
                                                <div
                                                    key={material.id}
                                                    className="material-card"
                                                >
                                                    <div className="material-info">
                                                        <h4>{material.title}</h4>
                                                        <p>{material.description}</p>
                                                    </div>

                                                    <div className="material-actions">
                                                        {(material.type === "VIDEO" ||
                                                            material.type === "LINK") ? (
                                                            <button
                                                                className="watch-btn"
                                                                onClick={() =>
                                                                    window.open(
                                                                        material.url,
                                                                        "_blank"
                                                                    )
                                                                }
                                                            >
                                                                Смотреть
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="download-btn"
                                                                onClick={() =>
                                                                    MaterialAPI.downloadMaterial(
                                                                        material.id
                                                                    )
                                                                }
                                                            >
                                                                Скачать
                                                            </button>
                                                        )}

                                                        {/* ИЗМЕНИТЬ */}
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

                                                                    const formData =
                                                                        new FormData()

                                                                    formData.append(
                                                                        "title",
                                                                        newTitle
                                                                    )

                                                                    formData.append(
                                                                        "description",
                                                                        newDescription
                                                                    )

                                                                    await MaterialAPI.updateMaterial(
                                                                        material.id,
                                                                        formData
                                                                    )

                                                                    await loadMaterials()

                                                                    alert(
                                                                        "Материал обновлен"
                                                                    )

                                                                } catch (err) {
                                                                    console.log(err)
                                                                    alert(
                                                                        "Ошибка обновления"
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            Изменить
                                                        </button>

                                                        {/* УДАЛИТЬ */}
                                                        <button
                                                            className="delete-btn"
                                                            onClick={async () => {
                                                                try {
                                                                    await MaterialAPI.deleteMaterial(
                                                                        material.id
                                                                    )

                                                                    loadMaterials()

                                                                    alert(
                                                                        "Материал удален"
                                                                    )

                                                                } catch (err) {
                                                                    console.log(err)

                                                                    alert(
                                                                        "Ошибка удаления"
                                                                    )
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
            </div>
        )
    }

    export default AdminPage