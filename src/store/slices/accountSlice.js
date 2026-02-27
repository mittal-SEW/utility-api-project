import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

export const fetchAccount = createAsyncThunk(
    'account/fetchAccount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/utility/electricity/account')
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
    accountId: null,
    plan: null,
    status: null,
    meterNumber: null,
    currentBalance: null,
    currency: null,
    dueDate: null,
    serviceAddress: null,
    customer: null,
    fetchStatus: 'idle',
    error: null,
}

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        clearAccount: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccount.pending, (state) => {
                state.fetchStatus = 'loading'
                state.error = null
            })
            .addCase(fetchAccount.fulfilled, (state, action) => {
                state.fetchStatus = 'succeeded'
                state.accountId = action.payload.accountId
                state.plan = action.payload.plan
                state.status = action.payload.status
                state.meterNumber = action.payload.meterNumber
                state.currentBalance = action.payload.currentBalance
                state.currency = action.payload.currency
                state.dueDate = action.payload.dueDate

                // Set serviceAddress, check if payload changed it to an array
                state.serviceAddress = action.payload.serviceAddress || action.payload.serviceAddresses || null

                state.customer = action.payload.customer
            })
            .addCase(fetchAccount.rejected, (state, action) => {
                state.fetchStatus = 'failed'
                state.error = action.payload || action.error.message
            })
    },
})

export const { clearAccount } = accountSlice.actions
export default accountSlice.reducer
