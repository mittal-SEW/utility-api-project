import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchAccount } from '../store/slices/accountSlice'
import { Select, MenuItem } from '@mui/material'

const Dashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { fetchStatus, accountId, plan, status, meterNumber, currentBalance, currency, dueDate, serviceAddress } = useSelector((state) => state.account)
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)

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
                    <button className="btn" style={{ backgroundColor: 'var(--bg-muted, #ccc)', color: 'var(--text-muted, #666)', fontWeight: 600, padding: '0.75rem 1.5rem', cursor: 'not-allowed' }} disabled>
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
                        {Array.isArray(serviceAddress) && serviceAddress.length > 0 ? (
                            <>
                                {serviceAddress.length > 1 && (
                                    <Select
                                        value={selectedAddressIndex}
                                        onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}
                                        sx={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', width: '100%' }}
                                        size="small"
                                    >
                                        {serviceAddress.map((addr, idx) => (
                                            <MenuItem key={idx} value={idx}>
                                                {addr?.label || `Address ${idx + 1}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                                <div style={{ paddingTop: '0.5rem' }}>
                                    <div>{serviceAddress[selectedAddressIndex]?.street}</div>
                                    <div>{serviceAddress[selectedAddressIndex]?.city}, {serviceAddress[selectedAddressIndex]?.state} {serviceAddress[selectedAddressIndex]?.zip}</div>
                                </div>
                            </>
                        ) : serviceAddress && !Array.isArray(serviceAddress) ? (
                            <div>
                                <div>{serviceAddress?.street}</div>
                                <div>{serviceAddress?.city}, {serviceAddress?.state} {serviceAddress?.zip}</div>
                            </div>
                        ) : (
                            <div>No address available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
