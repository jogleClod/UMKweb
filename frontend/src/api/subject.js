const API_URL = "https://umk-qu6t.onrender.com"

class SubjectAPI {
    static async getSubjects() {
        const response = await fetch(`${API_URL}/subjects`)

        if (!response.ok) {
            throw new Error("Ошибка получения предметов")
        }

        return response.json()
    }

    static async createSubject(title, description) {
        const token = localStorage.getItem("accessToken")

        const response = await fetch(`${API_URL}/subjects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description
            })
        })

        if (!response.ok) {
            throw new Error("Ошибка создания предмета")
        }

        return response.json()
    }
}

export default SubjectAPI