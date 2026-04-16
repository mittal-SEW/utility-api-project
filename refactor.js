const fs = require('fs');
const file = 'c:/Users/Vansh.Mittal/Desktop/projects/utility-api-project/src/components/Payment.jsx';
const content = fs.readFileSync(file, 'utf8');
const newContent = `import React, { Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { processPayment } from '../store/slices/paymentSlice';

const RemotePayment = lazy(() => import('paymentApp/Payment'));

const PaymentWrapper = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { paymentMethods } = useSelector((s) => s.payment);
    const { accountId, currentBalance, currency, serviceAddress } = useSelector((s) => s.account);

    const handlePay = async (paymentData) => {
        return new Promise((resolve) => {
             dispatch(processPayment(paymentData));
             setTimeout(() => resolve({transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9), paidAmount: paymentData.amount, paidAt: new Date().toISOString()}), 1500); 
        });
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <Suspense fallback={<div style={{textAlign: 'center', padding: '2rem'}}>Loading Payment Module...</div>}>
            <RemotePayment
                accountId={accountId}
                currentBalance={currentBalance}
                currency={currency}
                serviceAddress={serviceAddress}
                paymentMethods={paymentMethods}
                onPay={handlePay}
                onCancel={handleCancel}
            />
        </Suspense>
    );
};

export default PaymentWrapper;

/* ========================================================
   OLD CODE COMMENTED OUT AS PER INSTRUCTIONS
   ======================================================== 
` + content.replace(/\/\*/g, '//').replace(/\*\//g, '//') + '\n*/\n';
fs.writeFileSync(file, newContent);
console.log('Payment.jsx updated');
