import axios from 'axios'

// Set VITE_API_URL in a .env file (or Vercel project env vars) to point at
// your deployed Spring Boot backend, e.g. https://your-app.onrender.com
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('lms_token')
      localStorage.removeItem('lms_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
