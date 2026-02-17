import axios from 'axios'
import { API_BASE_URL } from '../config'

let store

export const injectStore = (_store) => {
    store = _store
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(
    (config) => {
        let token = null
        if (store) {
            const state = store.getState()
            token = state.auth.token
        } else {
            /* Fallback if store is not yet injected or running outside of app */
            token = localStorage.getItem('token')
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default api
