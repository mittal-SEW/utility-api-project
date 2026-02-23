import { useEffect, useState } from 'react'
import api from '../api/api'

const Profile = () => {
    const [customer, setCustomer] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // The account endpoint returns customer info in the mock
                const response = await api.get('/utility/electricity/account')
                setCustomer(response.data.customer)
            } catch (error) {
                console.error('Failed to fetch profile', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    if (loading) return <div>Loading profile information...</div>
    if (!customer) return <div>Error loading profile.</div>

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 600
                    }}>
                        {customer.firstName[0]}{customer.lastName[0]}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{customer.firstName} {customer.lastName}</h2>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>Primary Account Holder</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Email</span>
                        <strong>{customer.email}</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Phone</span>
                        <strong>{customer.phone}</strong>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => alert('Edit profile functionality coming soon!')}>
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Profile
