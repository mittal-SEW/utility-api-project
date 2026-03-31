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
    availableAccounts: [], // List of all account IDs available to the user
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
        addServiceAddress: (state, action) => {
            if (Array.isArray(state.serviceAddress)) {
                state.serviceAddress.push(action.payload);
            } else if (state.serviceAddress) {
                state.serviceAddress = [state.serviceAddress, action.payload];
            } else {
                state.serviceAddress = [action.payload];
            }
        },
        editServiceAddress: (state, action) => {
            const { id, updatedAddress } = action.payload;
            if (Array.isArray(state.serviceAddress)) {
                const index = state.serviceAddress.findIndex(addr => addr.id === id);
                if (index !== -1) {
                    state.serviceAddress[index] = { ...state.serviceAddress[index], ...updatedAddress };
                }
            } else if (state.serviceAddress && state.serviceAddress.id === id) {
                state.serviceAddress = { ...state.serviceAddress, ...updatedAddress };
            }
        },
        setSelectedAccount: (state, action) => {
            state.accountId = action.payload;
            // Note: In a real app we'd fetch details for this specific account
            // For now, only the ID changes so the UI reflects the switch
        }
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

                // Populate available accounts - simulate having multiple accounts if only one is returned
                if (action.payload.availableAccounts) {
                    state.availableAccounts = action.payload.availableAccounts
                } else if (!state.availableAccounts.length) {
                    state.availableAccounts = [
                        action.payload.accountId,
                        `ELEC-${Math.floor(100000 + Math.random() * 900000)}`, // Dummy account 2
                        `ELEC-${Math.floor(100000 + Math.random() * 900000)}`  // Dummy account 3
                    ]
                }

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

export const { clearAccount, addServiceAddress, editServiceAddress, setSelectedAccount } = accountSlice.actions
export default accountSlice.reducer
