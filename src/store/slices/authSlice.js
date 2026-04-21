import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    status: 'idle',
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null
            state.refreshToken = null
        },
        updateTokens: (state, action) => {
            state.token = action.payload.accessToken || action.payload.token
            if (action.payload.refreshToken) {
                state.refreshToken = action.payload.refreshToken
            }
        },
        setCredentials: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.refreshToken = action.payload.refreshToken
            state.status = 'succeeded'
        }
    },
})

export const { logout, updateTokens, setCredentials } = authSlice.actions
export default authSlice.reducer
