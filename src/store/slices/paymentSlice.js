import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

// Fetch available payment methods
export const fetchPaymentMethods = createAsyncThunk(
    'payment/fetchPaymentMethods',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/utility/payment/methods')
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
)

// Process a payment
export const processPayment = createAsyncThunk(
    'payment/processPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await api.post('/utility/payment/pay', paymentData)
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
)

const initialState = {
    paymentMethods: [],
    fetchMethodsStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    methodsError: null,

    paymentResponse: null,
    paymentStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    paymentError: null,
}

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        resetPaymentState: (state) => {
            state.paymentResponse = null;
            state.paymentStatus = 'idle';
            state.paymentError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Payment Methods
            .addCase(fetchPaymentMethods.pending, (state) => {
                state.fetchMethodsStatus = 'loading';
                state.methodsError = null;
            })
            .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
                state.fetchMethodsStatus = 'succeeded';
                state.paymentMethods = action.payload.methods || [];
            })
            .addCase(fetchPaymentMethods.rejected, (state, action) => {
                state.fetchMethodsStatus = 'failed';
                state.methodsError = action.payload || action.error.message;
            })
            // Process Payment
            .addCase(processPayment.pending, (state) => {
                state.paymentStatus = 'loading';
                state.paymentError = null;
            })
            .addCase(processPayment.fulfilled, (state, action) => {
                state.paymentStatus = 'succeeded';
                state.paymentResponse = action.payload;
            })
            .addCase(processPayment.rejected, (state, action) => {
                state.paymentStatus = 'failed';
                state.paymentError = action.payload || action.error.message;
            })
    },
})

export const { resetPaymentState } = paymentSlice.actions
export default paymentSlice.reducer
