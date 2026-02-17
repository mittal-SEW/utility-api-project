import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import api from '../api/api'

const Dashboard = () => {
    const dispatch = useDispatch()
    const [electricityAccount, setElectricityAccount] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/utility/electricity/account')
                setElectricityAccount(response.data)
            } catch (error) {
                console.error('Failed to fetch account data', error)
            }
        }

        fetchData()
    }, [])

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Dashboard</h1>
                <button onClick={() => dispatch(logout())}>Logout</button>
            </header>
            <main style={{ marginTop: '2rem' }}>
                <div className="card">
                    <h2>Your Electricity Account</h2>
                    {electricityAccount ? (
                        <pre style={{ textAlign: 'left', background: '#333', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
                            {JSON.stringify(electricityAccount, null, 2)}
                        </pre>
                    ) : (
                        <p>Loading account details...</p>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Dashboard
