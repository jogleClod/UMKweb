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

    const [newSubject, setNewSubject] = useState("")


    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [file, setFile] = useState(null)


    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1>📚 Панель администратора</h1>
                    <p>{user?.name}</p>
                </div>

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
                        <option
                            key={subject.id}
                            value={subject.id}
                        >
                            {subject.title}
                        </option>
                    ))}
                </select>

                <button
                    className="add-subject-btn"
                    onClick={async () => {
                        const title = prompt("Введите название предмета")

                        if (!title) return

                        try {
                            await SubjectAPI.createSubject(
                                title,
                                ""
                            )

                            loadSubjects()
                        } catch (err) {
                            console.log(err)
                            alert("Ошибка создания предмета")
                        }
                    }}
                >
                    + Предмет
                </button>
            </header>

            <div className="admin-content">
                {/* Левая панель */}
                <aside className="admin-sidebar">
                    <h3>Категории</h3>

                    {sections.map(section => (
                        <button
                            key={section.category}
                            className={`admin-section-btn ${
                                activeSection === section.category
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => {
                                setActiveSection(section.category)
                                setActiveSubcategory(null)
                            }}
                        >
                            {section.icon} {section.title}
                        </button>
                    ))}
                </aside>

                {/* Правая часть */}
                <main className="admin-main">
                    {!activeSection ? (
                        <div className="admin-empty">
                            Выберите категорию
                        </div>
                    ) : (
                        <>
                            <h2>{currentSection.title}</h2>

                            <div className="subcategory-list">
                                {currentSection.subcategories.map(
                                    (sub) => (
                                        <button
                                            key={sub}
                                            className={`subcategory-btn ${
                                                activeSubcategory === sub
                                                    ? "active-sub"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveSubcategory(sub)
                                            }
                                        >
                                            {sub}
                                        </button>
                                    )
                                )}
                            </div>

                            {activeSubcategory && (
                                <>
                                    {/* Форма добавления материала */}
                                    <div className="upload-box">
                                        <h3>Добавить материал</h3>

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

                                        <label className="custom-file-upload">
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    setFile(e.target.files[0])
                                                }
                                            />

                                            {file
                                                ? file.name
                                                : "📁 Выберите файл"}
                                        </label>

                                        <button
                                            onClick={async () => {
                                                try {
                                                    if (!title) {
                                                        alert("Введите название")
                                                        return
                                                    }

                                                    const formData =
                                                        new FormData()

                                                    formData.append(
                                                        "title",
                                                        title
                                                    )

                                                    formData.append(
                                                        "description",
                                                        description
                                                    )

                                                    formData.append(
                                                        "category",
                                                        activeSection
                                                    )

                                                    formData.append(
                                                        "subcategory",
                                                        activeSubcategory
                                                    )

                                                    formData.append(
                                                        "subjectId",
                                                        selectedSubject.id
                                                    )

                                                    // автоматическое определение типа
                                                    let materialType = "PDF"

                                                    if (file) {
                                                        const fileName =
                                                            file.name
                                                                .toLowerCase()

                                                        if (
                                                            fileName.endsWith(
                                                                ".doc"
                                                            ) ||
                                                            fileName.endsWith(
                                                                ".docx"
                                                            )
                                                        ) {
                                                            materialType =
                                                                "DOC"
                                                        } else if (
                                                            fileName.endsWith(
                                                                ".ppt"
                                                            ) ||
                                                            fileName.endsWith(
                                                                ".pptx"
                                                            )
                                                        ) {
                                                            materialType =
                                                                "PRESENTATION"
                                                        } else if (
                                                            fileName.endsWith(
                                                                ".xls"
                                                            ) ||
                                                            fileName.endsWith(
                                                                ".xlsx"
                                                            )
                                                        ) {
                                                            materialType =
                                                                "XLS"
                                                        }
                                                    }

                                                    formData.append(
                                                        "type",
                                                        materialType
                                                    )

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

                                                } catch (err) {
                                                    console.log(err)
                                                    alert(
                                                        "Ошибка загрузки материала"
                                                    )
                                                }
                                            }}
                                        >
                                            Добавить материал
                                        </button>
                                    </div>

                                    {/* Список материалов */}
                                    <div className="materials-list">
                                        {filteredMaterials.length > 0 ? (
                                            filteredMaterials.map(
                                                (material) => (
                                                    <div
                                                        key={material.id}
                                                        className="material-card"
                                                    >
                                                        <h4>
                                                            {material.title}
                                                        </h4>

                                                        <p>
                                                            {
                                                                material.description
                                                            }
                                                        </p>

                                                        <div className="material-actions">
                                                            <a
                                                                href={`https://umk-qu6t.onrender.com/materials/download/${material.id}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                Скачать
                                                            </a>

                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await MaterialAPI.deleteMaterial(
                                                                            material.id
                                                                        )

                                                                        loadMaterials()
                                                                    } catch (err) {
                                                                        console.log(
                                                                            err
                                                                        )
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
                                                )
                                            )
                                        ) : (
                                            <p>
                                                Материалы пока отсутствуют
                                            </p>
                                        )}
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