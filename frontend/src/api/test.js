const API_URL = "https://umk-qu6t.onrender.com"

class TestAPI {
    static getToken() {
        return localStorage.getItem("accessToken")
    }

    static async createTest(data) {
        const response = await fetch(`${API_URL}/test`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(data)
        })

        return response.json()
    }

    static async getTestsBySubject(subjectId) {
        const response = await fetch(
            `${API_URL}/test/subject/${subjectId}`,
            {
                headers: {
                    Authorization: `Bearer ${this.getToken()}`
                }
            }
        )

        return response.json()
    }

    static async submitTest(data) {
        const response = await fetch(
            `${API_URL}/test/submit`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(data)
            }
        )

        return response.json()
    }

    static async getMyResults() {
        const response = await fetch(
            `${API_URL}/test/my-results`,
            {
                headers: {
                    Authorization: `Bearer ${this.getToken()}`
                }
            }
        )

        return response.json()
    }

    static async deleteQuestion(id) {
        const response = await fetch(
            `${API_URL}/test/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${this.getToken()}`
                }
            }
        )

        return response.json()
    }
}

export default TestAPI