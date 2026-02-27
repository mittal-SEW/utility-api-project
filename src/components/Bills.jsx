import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

const Bills = () => {
    const [bills, setBills] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchBillsAndPayments = async () => {
        try {
            const [billsRes, paymentsRes] = await Promise.all([
                api.get('/utility/electricity/bills'),
                api.get('/utility/payment/history')
            ])
            setBills(billsRes.data.bills || [])
            setPayments(paymentsRes.data.payments || [])
        } catch (error) {
            console.error('Failed to fetch bills or payments', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBillsAndPayments()
    }, [])

    if (loading) return <div>Loading billing information...</div>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Recent Bills</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/payment')}>Pay a Bill</button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Period</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Bill ID</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No bills found.</td></tr>
                        ) : (
                            bills.map(bill => (
                                <tr key={bill.billId} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{bill.period}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{bill.billId}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>${bill.amount.toFixed(2)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            backgroundColor: bill.status === 'paid' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                                            color: bill.status === 'paid' ? 'var(--success)' : 'var(--warning)'
                                        }}>
                                            {bill.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', margin: 0 }}>Payment History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Transaction ID</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Method</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No recent payments.</td></tr>
                        ) : (
                            payments.map(payment => (
                                <tr key={payment.transactionId} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(payment.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{payment.transactionId}</td>
                                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{payment.method.replace('_', ' ')}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>${payment.amount.toFixed(2)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: payment.status === 'success' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                                            {payment.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Bills
