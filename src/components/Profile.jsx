import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAccount, addServiceAddress, editServiceAddress } from '../store/slices/accountSlice'

const Profile = () => {
    const dispatch = useDispatch()
    const { customer, serviceAddress, fetchStatus } = useSelector((state) => state.account)

    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
    const [isAddingAddress, setIsAddingAddress] = useState(false)
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', zip: '' })

    const handleAddAddress = () => {
        if (newAddress.label && newAddress.street && newAddress.city && newAddress.state && newAddress.zip) {
            dispatch(addServiceAddress({ ...newAddress, id: `addr_${Date.now()}` }))
            setNewAddress({ label: '', street: '', city: '', state: '', zip: '' })
            setIsAddingAddress(false)
            if (Array.isArray(serviceAddress)) {
                setSelectedAddressIndex(serviceAddress.length)
            } else if (serviceAddress) {
                setSelectedAddressIndex(1)
            } else {
                setSelectedAddressIndex(0)
            }
        } else {
            alert('Please fill out all fields.')
        }
    }

    const handleEditAddress = () => {
        if (newAddress.label && newAddress.street && newAddress.city && newAddress.state && newAddress.zip) {
            const currentAddress = Array.isArray(serviceAddress) ? serviceAddress[selectedAddressIndex] : serviceAddress;
            dispatch(editServiceAddress({
                id: currentAddress.id,
                updatedAddress: newAddress
            }))
            setIsEditingAddress(false)
            setNewAddress({ label: '', street: '', city: '', state: '', zip: '' })
        } else {
            alert('Please fill out all fields.')
        }
    }

    const startEditing = () => {
        const addr = Array.isArray(serviceAddress) ? serviceAddress[selectedAddressIndex] : serviceAddress;
        setNewAddress({
            label: addr.label || '',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            zip: addr.zip || ''
        })
        setIsEditingAddress(true)
    }

    const cancelAction = () => {
        setIsAddingAddress(false)
        setIsEditingAddress(false)
        setNewAddress({ label: '', street: '', city: '', state: '', zip: '' })
    }

    useEffect(() => {
        if (fetchStatus === 'idle') {
            dispatch(fetchAccount())
        }
    }, [fetchStatus, dispatch])

    if (fetchStatus === 'loading') return <div>Loading profile information...</div>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Service {Array.isArray(serviceAddress) && serviceAddress.length > 1 ? 'Addresses' : 'Address'}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {Array.isArray(serviceAddress) && serviceAddress.length > 0 ? (
                                <>
                                    {serviceAddress.length > 1 && (
                                        <select
                                            className="input"
                                            value={selectedAddressIndex}
                                            onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}
                                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', width: '100%' }}
                                        >
                                            {serviceAddress.map((addr, idx) => (
                                                <option key={idx} value={idx}>
                                                    {addr?.label || `Address ${idx + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <div style={{ paddingTop: '0.5rem' }}>
                                        <strong>{serviceAddress[selectedAddressIndex]?.street}</strong>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.1rem' }}>{serviceAddress[selectedAddressIndex]?.city}, {serviceAddress[selectedAddressIndex]?.state} {serviceAddress[selectedAddressIndex]?.zip}</div>
                                    </div>
                                </>
                            ) : serviceAddress && !Array.isArray(serviceAddress) ? (
                                <div>
                                    <strong>{serviceAddress?.street}</strong>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.1rem' }}>{serviceAddress?.city}, {serviceAddress?.state} {serviceAddress?.zip}</div>
                                </div>
                            ) : (
                                <strong>N/A</strong>
                            )}
                        </div>
                    </div>
                </div>

                {(isAddingAddress || isEditingAddress) && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>{isEditingAddress ? 'Edit Service Address' : 'Add Service Address'}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="input" placeholder="Address Label (e.g. Home, Office)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                            <input className="input" placeholder="Street" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input className="input" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                                <input className="input" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                                <input className="input" placeholder="Zip" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} style={{ width: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button className="btn btn-secondary" onClick={cancelAction}>Cancel</button>
                                <button className="btn" onClick={isEditingAddress ? handleEditAddress : handleAddAddress} style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                                    {isEditingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!isAddingAddress && !isEditingAddress && (
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        {/* <button className="btn btn-secondary" onClick={startEditing} disabled={!serviceAddress}>
                            Edit Current
                        </button> */}
                        <button className="btn btn-secondary" onClick={() => setIsAddingAddress(true)}>
                            Add New
                        </button>
                        <button className="btn btn-secondary" onClick={() => alert('Edit profile functionality coming soon!')}>
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile
