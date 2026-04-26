const API_URL = "https://umk-qu6t.onrender.com"

class MaterialAPI {
    static async getBySubject(subjectId) {
        const response = await fetch(
            `${API_URL}/materials/subject/${subjectId}`
        )

        if (!response.ok) {
            throw new Error("Ошибка получения материалов")
        }

        return response.json()
    }

    static async downloadMaterial(id) {
        window.open(
            `${API_URL}/materials/download/${id}`,
            "_blank"
        )
    }
}

export default MaterialAPI