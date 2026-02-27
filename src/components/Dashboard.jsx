import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchAccount } from '../store/slices/accountSlice'

const Dashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { fetchStatus, accountId, plan, status, meterNumber, currentBalance, currency, dueDate, serviceAddress } = useSelector((state) => state.account)

    useEffect(() => {
        if (fetchStatus === 'idle') {
            dispatch(fetchAccount())
        }
    }, [fetchStatus, dispatch])

    if (fetchStatus === 'loading') return <div>Loading account details...</div>
    if (fetchStatus === 'failed' || !accountId) return <div>Error loading account details. Please try again.</div>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>
                <div>
                    <h3 style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 500 }}>Current Balance</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>
                        {currency === 'USD' ? '$' : ''}{currentBalance?.toFixed(2)}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0.5rem 0 0' }}>
                        Due on {dueDate ? new Date(dueDate).toLocaleDateString() : '-'}
                    </p>
                </div>
                <div>
                    <button className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: 600, padding: '0.75rem 1.5rem' }} onClick={() => navigate('/payment')}>
                        Pay Bill
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <h4 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Account Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Account ID</span> <strong>{accountId}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Plan</span> <strong>{plan}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Status</span> <strong style={{ color: 'var(--success)' }}>{status?.toUpperCase()}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Meter Number</span> <strong>{meterNumber}</strong></div>
                    </div>
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Service {Array.isArray(serviceAddress) && serviceAddress.length > 1 ? 'Addresses' : 'Address'}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                        {Array.isArray(serviceAddress) ? (
                            serviceAddress.map((addr, idx) => (
                                <div key={idx} style={{ paddingBottom: idx < serviceAddress.length - 1 ? '0.75rem' : '0', borderBottom: idx < serviceAddress.length - 1 ? '1px solid var(--border-light, #eee)' : 'none' }}>
                                    <div>{addr?.street}</div>
                                    <div>{addr?.city}, {addr?.state} {addr?.zip}</div>
                                </div>
                            ))
                        ) : (
                            <div>
                                <div>{serviceAddress?.street}</div>
                                <div>{serviceAddress?.city}, {serviceAddress?.state} {serviceAddress?.zip}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
