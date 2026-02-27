import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Bills from './components/Bills'
import Services from './components/Services'
import Profile from './components/Profile'
import Payment from './components/Payment'
import MainLayout from './components/MainLayout';
import { useEffect } from 'react'

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/utility'

function App() {
    const { token } = useSelector((state) => state.auth)
    useEffect(() => {
        console.log('app.jsloaded')
    })
    return (
        <Router basename={BASE_PATH}>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={token ? <MainLayout /> : <Navigate to="/login" />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/bills" element={<Bills />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/payment" element={<Payment />} />
                </Route>

                <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
            </Routes>
        </Router>
    )
}

export default App
