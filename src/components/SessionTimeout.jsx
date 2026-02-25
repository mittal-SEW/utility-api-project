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
    const idleTimerRef = useRef(null)
    const countdownIntervalRef = useRef(null)

    const handleSignOut = useCallback(() => {
        clearAllTimers()
        setShowDialog(false)
        dispatch(logout())
        dispatch(clearAccount())
    }, [dispatch])

    const clearAllTimers = () => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current)
            idleTimerRef.current = null
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
        }
    }

    const resetIdleTimer = useCallback(() => {
        // Don't reset if the warning dialog is already showing
        if (showDialog) return

        clearAllTimers()
        idleTimerRef.current = setTimeout(() => {
            // Time's up — show the warning dialog
            setShowDialog(true)
            setCountdown(WARNING_DURATION)
        }, IDLE_TIMEOUT)
    }, [showDialog])

    // Start countdown when dialog is shown
    useEffect(() => {
        if (!showDialog) return

        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Auto sign-out
                    handleSignOut()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
            }
        }
    }, [showDialog, handleSignOut])

    // Listen for user activity to reset the idle timer
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click']
        events.forEach((event) => window.addEventListener(event, resetIdleTimer))

        // Start the initial idle timer
        resetIdleTimer()

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetIdleTimer))
            clearAllTimers()
        }
    }, [resetIdleTimer])

    const handleKeepAlive = async () => {
        clearAllTimers()
        setShowDialog(false)
        try {
            await api.post('/auth/refresh')
        } catch (err) {
            console.error('Failed to refresh session', err)
        }
        // Restart the idle timer
        resetIdleTimer()
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
