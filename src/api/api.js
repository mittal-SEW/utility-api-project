import axios from 'axios'
import { API_BASE_URL } from '../config'
import { logout, updateTokens } from '../store/slices/authSlice'

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
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops if refresh fails
        if (originalRequest.url === '/auth/refresh') {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                let rToken = null;
                if (store) {
                    rToken = store.getState().auth.refreshToken;
                }

                if (!rToken) {
                    throw new Error('No refresh token available');
                }

                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: rToken });

                if (store) {
                    store.dispatch(updateTokens(res.data));
                }

                originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken || res.data.token}`;
                return api(originalRequest);
            } catch (err) {
                if (store) {
                    store.dispatch(logout());
                }
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api
