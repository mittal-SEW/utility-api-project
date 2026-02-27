import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, logout } from '../store/slices/authSlice'
import { clearAccount } from '../store/slices/accountSlice'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { status, error } = useSelector((state) => state.auth)

    useEffect(() => {
        dispatch(logout())
        dispatch(clearAccount())
    }, [dispatch])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await dispatch(loginUser({ username: email, password })).unwrap()
            navigate('/dashboard', { replace: true })
        } catch (err) {
            // error is handled by redux state
        }
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>Smart CX</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign in to manage your account</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid var(--border)', fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid var(--border)', fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ marginTop: '0.5rem', padding: '0.75rem' }}>
                        {status === 'loading' ? 'Signing in...' : 'Sign In'}
                    </button>

                    {error && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
                            {typeof error === 'string' ? error : error.message || 'Login failed'}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Login
