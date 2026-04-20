import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../api/api'
import { fetchAccount } from '../store/slices/accountSlice'
import { TextField } from '@mui/material'

const Bills = () => {
    const dispatch = useDispatch()
    const { accountId, fetchStatus } = useSelector((state) => state.account)
    const [bills, setBills] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
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
        if (fetchStatus === 'idle') {
            dispatch(fetchAccount())
        }
    }, [fetchStatus, dispatch])

    useEffect(() => {
        if (accountId) {
            fetchBillsAndPayments()
        }
    }, [accountId])

    if (loading || fetchStatus === 'loading') return <div>Loading billing information...</div>

    // Parse a date string into a timestamp. Handles ISO dates AND period strings like "Oct 2025".
    const parseDate = (str) => {
        if (!str) return null;
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d.getTime();
    };

    // Filter helper — checks if a timestamp falls within [startDate, endDate]
    const isInRange = (timestamp) => {
        if (timestamp === null) return true; // if date can't be parsed, keep the row visible
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        return timestamp >= start && timestamp <= (end + 86400000);
    };

    // Bills filter by their PERIOD (the month the bill covers), NOT by dueDate.
    // e.g. "Oct 2025" → Oct 1 2025. This way a bill for Oct 2025 won't pass a 2026 range filter.
    const filteredBills = bills.filter(b => isInRange(parseDate(b.period)));
    // Payments filter by the actual payment/transaction date.
    const filteredPayments = payments.filter(p => isInRange(parseDate(p.date)));

    // CSV Download Helper
    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
        const csvContent = [headers, ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            {/* Filters Row */}
            <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Start Date</label>
                    <TextField
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        inputProps={{
                            max: endDate ? new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 1)).toISOString().split('T')[0] : undefined
                        }}
                        sx={{ width: '100%' }}
                        size="small"
                        hiddenLabel
                    />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>End Date</label>
                    <TextField
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        inputProps={{
                            min: startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).toISOString().split('T')[0] : undefined
                        }}
                        sx={{ width: '100%' }}
                        size="small"
                        hiddenLabel
                    />
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Recent Bills</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => downloadCSV(filteredBills, 'billing_history.csv')} disabled={filteredBills.length === 0}>
                            Download CSV
                        </button>
                        <button 
                            className="btn btn-primary" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/payment')}
                        >
                            Pay a Bill
                        </button>
                    </div>
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
                        {filteredBills.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No bills found.</td></tr>
                        ) : (
                            filteredBills.map(bill => (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Payment History</h3>
                    <button className="btn btn-secondary" onClick={() => downloadCSV(filteredPayments, 'payment_history.csv')} disabled={filteredPayments.length === 0}>
                        Download CSV
                    </button>
                </div>
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
                        {filteredPayments.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No recent payments.</td></tr>
                        ) : (
                            filteredPayments.map(payment => (
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
