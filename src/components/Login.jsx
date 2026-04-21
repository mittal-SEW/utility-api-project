import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, logout } from '../store/slices/authSlice'
import { clearAccount } from '../store/slices/accountSlice'
import { LOGIN_SERVICE_URL } from '../config'

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [serviceStatus, setServiceStatus] = useState('checking')

    useEffect(() => {
        // Clear local session on mount
        dispatch(logout())
        dispatch(clearAccount())

        const checkService = async () => {
            try {
                // Peek at the service to see if it's up
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                await fetch(LOGIN_SERVICE_URL, { 
                    mode: 'no-cors', 
                    signal: controller.signal 
                });
                clearTimeout(timeoutId);
                setServiceStatus('online');
            } catch (error) {
                console.error("Login service is unreachable:", error);
                setServiceStatus('offline');
            }
        };

        checkService();

        const handleMessage = (event) => {
            // Validate origin for security (optional in dev, but good practice)
            // if (event.origin !== LOGIN_SERVICE_URL) return;

            if (event.data?.type === 'LOGIN_SUCCESS') {
                const { user, token, refreshToken } = event.data.payload;
                dispatch(setCredentials({ user, token, refreshToken }));
                navigate('/dashboard', { replace: true });
            } else if (event.data?.type === 'NAVIGATE') {
                navigate(event.data.path);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch, navigate]);

    if (serviceStatus === 'checking') {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ marginBottom: '1rem', border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p>Loading secure login...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (serviceStatus === 'offline') {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
                <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔌</div>
                    <h2>Login Service Unavailable</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        We are unable to reach the login service. Please ensure the login backend is running.
                    </p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-primary" 
                        style={{ marginTop: '2rem' }}
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
            <iframe 
                src={LOGIN_SERVICE_URL}
                title="Login Service"
                width="100%"
                height="100%"
                style={{ border: 'none', display: 'block' }}
            />
        </div>
    );
}

export default Login
