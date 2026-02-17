import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
    const { token } = useSelector((state) => state.auth)

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
                <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    )
}

export default App
