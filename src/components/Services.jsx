import { useState } from 'react'
import api from '../api/api'

const Services = () => {
    const [readingValue, setReadingValue] = useState('')
    const [readingStatus, setReadingStatus] = useState({ loading: false, success: false, error: null })

    const [serviceDesc, setServiceDesc] = useState('')
    const [serviceStatus, setServiceStatus] = useState({ loading: false, success: false, error: null })
    const [ticketId, setTicketId] = useState('')

    const submitMeterReading = async (e) => {
        e.preventDefault()
        setReadingStatus({ loading: true, success: false, error: null })
        try {
            await api.post('/utility/electricity/meter-reading', { reading: readingValue })
            setReadingStatus({ loading: false, success: true, error: null })
            setReadingValue('')
            setTimeout(() => setReadingStatus(s => ({ ...s, success: false })), 3000)
        } catch (err) {
            setReadingStatus({ loading: false, success: false, error: 'Failed to submit.' })
        }
    }

    const submitServiceRequest = async (e) => {
        e.preventDefault()
        setServiceStatus({ loading: true, success: false, error: null })
        try {
            const res = await api.post('/utility/electricity/service-request', { description: serviceDesc })
            setServiceStatus({ loading: false, success: true, error: null })
            setTicketId(res.data.ticketId)
            setServiceDesc('')
        } catch (err) {
            setServiceStatus({ loading: false, success: false, error: 'Failed to submit request.' })
        }
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Submit Meter Reading</h3>
                <form onSubmit={submitMeterReading} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Current Reading (kWh)</label>
                        <input
                            type="number"
                            required
                            value={readingValue}
                            onChange={(e) => setReadingValue(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={readingStatus.loading || !readingValue}>
                        {readingStatus.loading ? 'Submitting...' : 'Submit Reading'}
                    </button>
                    {readingStatus.success && <div style={{ color: 'var(--success)', fontWeight: 500, marginTop: '0.5rem' }}>Reading submitted successfully!</div>}
                    {readingStatus.error && <div style={{ color: 'var(--danger)', fontWeight: 500, marginTop: '0.5rem' }}>{readingStatus.error}</div>}
                </form>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>New Service Request</h3>
                <form onSubmit={submitServiceRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Issue Description</label>
                        <textarea
                            required
                            value={serviceDesc}
                            onChange={(e) => setServiceDesc(e.target.value)}
                            rows={4}
                            placeholder="Please describe the issue..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={serviceStatus.loading || !serviceDesc}>
                        {serviceStatus.loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                    {serviceStatus.success && (
                        <div style={{ color: 'var(--success)', fontWeight: 500, marginTop: '0.5rem' }}>
                            Request created! Ticket ID: {ticketId}
                        </div>
                    )}
                    {serviceStatus.error && <div style={{ color: 'var(--danger)', fontWeight: 500, marginTop: '0.5rem' }}>{serviceStatus.error}</div>}
                </form>
            </div>
        </div>
    )
}

export default Services
