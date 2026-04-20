// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { processPayment } from '../store/slices/paymentSlice';
// import RemotePayment from 'payment-module';

// const PaymentWrapper = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const { paymentMethods } = useSelector((s) => s.payment);
//     const { accountId, currentBalance, currency, serviceAddress } = useSelector((s) => s.account);

//     const handlePay = async (paymentData) => {
//         return new Promise((resolve) => {
//             dispatch(processPayment(paymentData));
//             setTimeout(() => resolve({ transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9), paidAmount: paymentData.amount, paidAt: new Date().toISOString() }), 1500);
//         });
//     };

//     const handleCancel = () => {
//         navigate(-1);
//     };

//     return (
//         <RemotePayment
//             accountId={accountId}
//             currentBalance={currentBalance}
//             currency={currency}
//             serviceAddress={serviceAddress}
//             paymentMethods={paymentMethods}
//             onPay={handlePay}
//             onCancel={handleCancel}
//         />
//     );
// };

// export default PaymentWrapper;

// (Previous commented code block truncated for brevity)