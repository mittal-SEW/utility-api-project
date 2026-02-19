import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/utility'

function App() {
    const { token } = useSelector((state) => state.auth)

    return (
        <Router basename={BASE_PATH}>
            <Routes>
                <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
            </Routes>
        </Router>
    )
}

export default App
