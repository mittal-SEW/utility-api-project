import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { clearAccount, setSelectedAccount } from '../store/slices/accountSlice';
import SessionTimeout from './SessionTimeout';
import SupportChat from './SupportChat';
import { Select, MenuItem } from '@mui/material';

const MainLayout = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { accountId, availableAccounts } = useSelector((s) => s.account);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearAccount());
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/bills', label: 'Bills & Payments' },
        { path: '/outages', label: 'Outage Center' },
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
                <header className="top-header" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1.5rem 2rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="header-title">
                            <h2 style={{ margin: 0 }}>{navItems.find(i => location.pathname.startsWith(i.path))?.label || (location.pathname.startsWith('/payment') ? 'Payment' : 'Dashboard')}</h2>
                        </div>
                        <div className="user-actions">
                            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>

                    {/* Embedded Account Switcher (Available on all pages) */}
                    {availableAccounts && availableAccounts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Account:</h3>
                            <Select
                                value={accountId || ''}
                                onChange={(e) => dispatch(setSelectedAccount(e.target.value))}
                                sx={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', minWidth: '200px', fontSize: '1rem', fontWeight: 600 }}
                                size="small"
                            >
                                {availableAccounts.map(accId => (
                                    <MenuItem key={accId} value={accId}>{accId}</MenuItem>
                                ))}
                            </Select>
                        </div>
                    )}
                </header>
                <main className="main-content">
                    <Outlet />
                </main>
                <footer className="main-footer">
                    &copy; {new Date().getFullYear()} Smart CX. All rights reserved.
                </footer>
            </div>
            <SessionTimeout />
            <SupportChat />
        </div>
    );
};

export default MainLayout;
