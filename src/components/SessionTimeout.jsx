import { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { clearAccount } from '../store/slices/accountSlice'
import api from '../api/api'

const IDLE_TIMEOUT = 5 * 60 * 1000   // 5 minutes
const WARNING_DURATION = 60           // 60 seconds countdown

const SessionTimeout = () => {
    const dispatch = useDispatch()
    const [showDialog, setShowDialog] = useState(false)
    const [countdown, setCountdown] = useState(WARNING_DURATION)
    const expireTimeRef = useRef(Date.now() + IDLE_TIMEOUT)
    const logoutTimeRef = useRef(null)

    const handleSignOut = useCallback(() => {
        setShowDialog(false)
        expireTimeRef.current = Date.now() + IDLE_TIMEOUT // Prevent immediate re-trigger before unmount
        dispatch(logout())
        dispatch(clearAccount())
    }, [dispatch])

    const resetIdleTimer = useCallback(() => {
        // Don't reset if the warning dialog is already showing
        if (showDialog) return

        // If the timestamp has already passed, we shouldn't reset it.
        // This prevents physical mouse movements on laptop wakeup from artificially keeping
        // the session alive if they've technically been asleep past the timeout.
        if (Date.now() >= expireTimeRef.current) return

        expireTimeRef.current = Date.now() + IDLE_TIMEOUT
    }, [showDialog])

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = Date.now()

            if (showDialog) {
                // Warning countdown mode
                if (logoutTimeRef.current) {
                    const remaining = Math.max(0, Math.ceil((logoutTimeRef.current - now) / 1000))
                    setCountdown(remaining)

                    if (remaining <= 0) {
                        handleSignOut()
                    }
                }
            } else {
                // Idle tracking mode
                if (now >= expireTimeRef.current) {
                    const sessionDeathTime = expireTimeRef.current + (WARNING_DURATION * 1000)

                    if (now >= sessionDeathTime) {
                        // The user slept through the entire warning period
                        handleSignOut()
                    } else {
                        // The user slept through part of the warning period (or none at all)
                        setShowDialog(true)
                        const remaining = Math.max(0, Math.ceil((sessionDeathTime - now) / 1000))
                        setCountdown(remaining)
                        logoutTimeRef.current = sessionDeathTime
                    }
                }
            }
        }, 1000)

        return () => clearInterval(intervalId)
    }, [showDialog, handleSignOut])

    // Listen for user activity to reset the idle timer
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click']
        events.forEach((event) => window.addEventListener(event, resetIdleTimer))

        // Start the initial idle timer
        resetIdleTimer()

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetIdleTimer))
        }
    }, [resetIdleTimer])

    const handleKeepAlive = async () => {
        setShowDialog(false)
        expireTimeRef.current = Date.now() + IDLE_TIMEOUT // Restart the idle timer manually
        try {
            await api.post('/auth/refresh')
        } catch (err) {
            console.error('Failed to refresh session', err)
        }
    }

    if (!showDialog) return null

    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="card" style={{
                width: '420px', textAlign: 'center', padding: '2.5rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Session Timeout</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Your session is about to expire due to inactivity.
                </p>

                <div style={{
                    fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger, #dc3545)',
                    margin: '1rem 0 1.5rem', fontVariantNumeric: 'tabular-nums',
                }}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.75rem' }}
                        onClick={handleKeepAlive}
                    >
                        Keep Session Alive
                    </button>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.75rem' }}
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SessionTimeout
