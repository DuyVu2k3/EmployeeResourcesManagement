import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://clinichr-api.runasp.net/api'

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let pendingQueue = [] // [{ resolve, reject }]

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  pendingQueue = []
}

const clearAuthAndRedirect = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

axiosClient.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err.response?.data ?? err)
    }

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      clearAuthAndRedirect()
      return Promise.reject(err.response?.data ?? err)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        accessToken: localStorage.getItem('token'),
        refreshToken,
      })

      const newToken = data.accessToken ?? data.token
      localStorage.setItem('token', newToken)
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)

      axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)
      return axiosClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthAndRedirect()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosClient
