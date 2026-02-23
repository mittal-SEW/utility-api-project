import { useEffect, useState } from 'react'
import api from '../api/api'

const Dashboard = () => {
    const [account, setAccount] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/utility/electricity/account')
                setAccount(response.data)
            } catch (error) {
                console.error('Failed to fetch account data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div>Loading account details...</div>
    if (!account) return <div>Error loading account details. Please try again.</div>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>
                <div>
                    <h3 style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 500 }}>Current Balance</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>
                        {account.currency === 'USD' ? '$' : ''}{account.currentBalance.toFixed(2)}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0.5rem 0 0' }}>
                        Due on {new Date(account.dueDate).toLocaleDateString()}
                    </p>
                </div>
                <div>
                    <button className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: 600, padding: '0.75rem 1.5rem' }}>
                        Pay Bill
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <h4 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Account Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Account ID</span> <strong>{account.accountId}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Plan</span> <strong>{account.plan}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Status</span> <strong style={{ color: 'var(--success)' }}>{account.status.toUpperCase()}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Meter Number</span> <strong>{account.meterNumber}</strong></div>
                    </div>
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Service Address</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                        <div>{account.serviceAddress.street}</div>
                        <div>{account.serviceAddress.city}, {account.serviceAddress.state} {account.serviceAddress.zip}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
