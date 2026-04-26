const API_URL = "https://umk-qu6t.onrender.com"

class SubjectAPI {
    static async getSubjects() {
        const response = await fetch(`${API_URL}/subjects`)

        if (!response.ok) {
            throw new Error("Ошибка получения предметов")
        }

        return response.json()
    }
}

export default SubjectAPI