import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaExclamationTriangle, FaMapMarkerAlt, FaShieldAlt, FaTools, FaCheckCircle, FaBolt } from 'react-icons/fa';
import api from '../api/api';

const Outages = () => {
    const [outageStatus, setOutageStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reporting, setReporting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState('');
    const [reportDetails, setReportDetails] = useState('');

    const account = useSelector((state) => state.account);
    const { accountId, serviceAddress } = account;

    // Get primary address for display
    const addressDisplay = Array.isArray(serviceAddress)
        ? (serviceAddress[0]?.street ? `${serviceAddress[0].street}, ${serviceAddress[0].city}` : 'Unknown Address')
        : (serviceAddress?.street ? `${serviceAddress.street}, ${serviceAddress.city}` : 'Unknown Address');

    const fetchOutageStatus = async () => {
        try {
            setLoading(true);
            const res = await api.get('/utility/electricity/outages/status');
            // If the mock API doesn't have the endpoint yet, this will fail or return 404
            // We'll handle it gracefully
            setOutageStatus(res.data);
        } catch (error) {
            console.error('Failed to fetch outage status', error);
            // Default mock state for development before API is ready
            setOutageStatus({
                activeOutage: false,
                message: "No known outages in your area.",
                lastUpdated: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutageStatus();
        // Set an interval to refresh status every 5 minutes
        const interval = setInterval(fetchOutageStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleReportOutage = async (e) => {
        e.preventDefault();
        setReporting(true);
        setReportError('');
        setReportSuccess(false);

        try {
            await api.post('/utility/electricity/outages/report', {
                accountId,
                details: reportDetails,
                reportedAt: new Date().toISOString()
            });

            setReportSuccess(true);
            setReportDetails('');

            // Re-fetch status to see if the reported outage is now active
            setTimeout(() => fetchOutageStatus(), 2000);

        } catch (err) {
            setReportError(err.response?.data?.message || 'Failed to submit outage report. Please try again.');
        } finally {
            setReporting(false);
        }
    };

    if (loading && !outageStatus) {
        return (
            <div className="outage-loading">
                <div className="skeleton-card"></div>
                <div className="skeleton-card skeleton-tall"></div>
            </div>
        );
    }

    return (
        <div className="outages-container">
            {/* Outage Status Banner */}
            <div className={`outage-banner ${outageStatus?.activeOutage ? 'active' : 'clear'}`}>
                <div className="banner-icon">
                    {outageStatus?.activeOutage ? <FaExclamationTriangle /> : <FaCheckCircle />}
                </div>
                <div className="banner-content">
                    <h2>{outageStatus?.activeOutage ? 'Active Outage Reported' : 'Grid Status: Normal'}</h2>
                    <p>{outageStatus?.message || (outageStatus?.activeOutage
                        ? 'We are aware of a power outage in your area. Our crews are working to restore service.'
                        : 'There are currently no reported power outages affecting your service address.')}</p>

                    {outageStatus?.activeOutage && outageStatus?.estimatedRestoration && (
                        <div className="etr-badge">
                            <strong>Estimated Restoration:</strong> {new Date(outageStatus.estimatedRestoration).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
            </div>

            <div className="outages-grid">
                {/* Outage Map/Info Card */}
                <div className="card outage-info-card">
                    <div className="card-header-icon">
                        <FaMapMarkerAlt className="icon-primary" />
                        <h3>Service Area</h3>
                    </div>

                    <div className="service-location">
                        <div className="location-pin"></div>
                        <div className="location-details">
                            <span className="location-label">Current Address</span>
                            <span className="location-value">{addressDisplay}</span>
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-item">
                            <FaBolt className="stat-icon warning" />
                            <div className="stat-content">
                                <span>Affected Customers</span>
                                <strong>{outageStatus?.affectedCustomers || 0}</strong>
                            </div>
                        </div>
                        <div className="stat-item">
                            <FaTools className="stat-icon info" />
                            <div className="stat-content">
                                <span>Crew Status</span>
                                <strong>{outageStatus?.crewStatus || 'Standby'}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Outage Form */}
                <div className="card report-outage-card">
                    <div className="card-header-icon">
                        <FaShieldAlt className="icon-danger" />
                        <h3>Report an Outage</h3>
                    </div>
                    <p className="report-desc">
                        If you are experiencing a power loss that isn't listed above, please let us know.
                        <strong>If this is an emergency or you see downed power lines, call 911 immediately.</strong>
                    </p>

                    {reportSuccess ? (
                        <div className="success-message">
                            <FaCheckCircle className="success-icon" />
                            <div>
                                <h4>Report Submitted</h4>
                                <p>Thank you. Our team has been notified and will investigate the issue shortly.</p>
                                <button className="btn btn-secondary mt-3" onClick={() => setReportSuccess(false)}>
                                    Submit Another Report
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleReportOutage} className="report-form">
                            <div className="form-group">
                                <label htmlFor="outageDetails">Additional Details (Optional)</label>
                                <textarea
                                    id="outageDetails"
                                    className="pay-input"
                                    rows="4"
                                    placeholder="E.g., Heard a loud pop, tree fell on line, entire street is dark..."
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                    disabled={reporting}
                                ></textarea>
                            </div>

                            {reportError && (
                                <div className="error-alert">
                                    <FaExclamationTriangle /> {reportError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-danger submit-btn"
                                disabled={reporting}
                            >
                                {reporting ? 'Submitting...' : 'Report Outage Now'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Outages;
