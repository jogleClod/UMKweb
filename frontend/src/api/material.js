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

    static async createMaterial(formData) {
        const token = localStorage.getItem(
            "accessToken"
        )

        const response = await fetch(
            `${API_URL}/materials`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }
        )

        if (!response.ok) {
            throw new Error(
                "Ошибка добавления материала"
            )
        }

        return response.json()
    }

    static async deleteMaterial(id) {
        const token = localStorage.getItem(
            "accessToken"
        )

        const response = await fetch(
            `${API_URL}/materials/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        if (!response.ok) {
            throw new Error(
                "Ошибка удаления материала"
            )
        }

        return response.json()
    }

    static async updateMaterial(
        id,
        formData
    ) {
        const token =
            localStorage.getItem(
                "accessToken"
            )

        const response = await fetch(
            `${API_URL}/materials/${id}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }
        )

        if (!response.ok) {
            throw new Error(
                "Ошибка обновления"
            )
        }

        return response.json()
    }
}

export default MaterialAPI