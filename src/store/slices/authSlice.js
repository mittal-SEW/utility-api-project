import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials)
            return response.data
        } catch (err) {
            if (!err.response) {
                throw err
            }
            return rejectWithValue(err.response.data)
        }
    }
)

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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.token = action.payload.accessToken || action.payload.token
                state.refreshToken = action.payload.refreshToken
                state.user = action.payload.user
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload || action.error.message
            })
    },
})

export const { logout, updateTokens } = authSlice.actions
export default authSlice.reducer
