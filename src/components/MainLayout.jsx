import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { clearAccount } from '../store/slices/accountSlice';
import SessionTimeout from './SessionTimeout';

const MainLayout = () => {
    const location = useLocation();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearAccount());
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/bills', label: 'Bills & Payments' },
        { path: '/services', label: 'Service Center' },
        { path: '/profile', label: 'Profile' }
    ];

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    Smart CX
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <div className="main-wrapper">
                <header className="top-header">
                    <div className="header-title">
                        <h2>{navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}</h2>
                    </div>
                    <div className="user-actions">
                        <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                    </div>
                </header>
                <main className="main-content">
                    <Outlet />
                </main>
                <footer className="main-footer">
                    &copy; {new Date().getFullYear()} Smart CX. All rights reserved.
                </footer>
            </div>
            <SessionTimeout />
        </div>
    );
};

export default MainLayout;
