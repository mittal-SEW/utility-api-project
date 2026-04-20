import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { processPayment } from '../store/slices/paymentSlice';

const PaymentWrapper = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [serviceStatus, setServiceStatus] = useState('checking'); // 'checking', 'online', 'offline'

    const { paymentMethods } = useSelector((s) => s.payment);
    const { accountId, currentBalance, currency, serviceAddress } = useSelector((s) => s.account);

    const [iframeHeight, setIframeHeight] = useState(800);

    useEffect(() => {
        const checkService = async () => {
            try {
                // Trying to ping the local server
                await fetch('http://localhost:5001', { mode: 'no-cors' });
                setServiceStatus('online');
            } catch (error) {
                console.error("Payment service is unreachable:", error);
                setServiceStatus('offline');
            }
        };

        checkService();

        const handleMessage = (event) => {
            if (event.data?.type === 'PAYMENT_SUCCESS') {
                dispatch(processPayment(event.data.payload));
            } else if (event.data?.type === 'PAYMENT_CANCELLED') {
                navigate(-1);
            } else if (event.data?.type === 'RESIZE_IFRAME') {
                setIframeHeight(Math.max(800, event.data.height));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch, navigate]);

    if (serviceStatus === 'checking') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-main)' }}>
                <div className="spinner" style={{ marginBottom: '1rem', border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
                <p>Connecting to secure payment gateway...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (serviceStatus === 'offline') {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', margin: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Payment System Unavailable</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                    We're sorry, but the payment service is currently unreachable. This could be due to scheduled maintenance or a connection issue.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ cursor: 'pointer' }}>
                        Retry Connection
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const paymentMethodsStr = encodeURIComponent(JSON.stringify(paymentMethods));
    const serviceAddressStr = encodeURIComponent(serviceAddress ? JSON.stringify(serviceAddress) : '');
    
    // Safely encode currentBalance
    const balanceParam = currentBalance !== null && currentBalance !== undefined ? encodeURIComponent(currentBalance) : '';
    const paymentUrl = `http://localhost:5001/?accountId=${encodeURIComponent(accountId)}&currentBalance=${balanceParam}&currency=${encodeURIComponent(currency)}&serviceAddress=${serviceAddressStr}&paymentMethods=${paymentMethodsStr}`;

    return (
        <div style={{ width: '100%', minHeight: `${iframeHeight}px`, paddingBottom: '2rem' }}>
            <iframe 
                src={paymentUrl}
                title="Payment Module"
                width="100%"
                height={`${iframeHeight}px`}
                style={{ border: 'none', display: 'block', overflow: 'hidden' }}
                scrolling="no"
            />
        </div>
    );
};

export default PaymentWrapper;