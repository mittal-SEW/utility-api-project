import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPaymentMethods, processPayment, resetPaymentState } from '../store/slices/paymentSlice';
import { fetchAccount } from '../store/slices/accountSlice';
import { FaPaypal, FaApplePay, FaGooglePay, FaAmazonPay, FaCreditCard, FaUniversity, FaGlobe, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaReceipt, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { SiVisa, SiAmericanexpress, SiDiscover, SiVenmo } from 'react-icons/si';

const TRANSACTION_FEE = 6.00;

/* ---- Step Progress Indicator ---- */
const StepIndicator = ({ current }) => {
    const steps = [
        { num: 1, label: 'Payment' },
        { num: 2, label: 'Review' },
        { num: 3, label: 'Done' },
    ];
    return (
        <div className="pay-step-indicator">
            {steps.map((s, i) => (
                <React.Fragment key={s.num}>
                    <div style={{ textAlign: 'center' }}>
                        <div className={`pay-step-dot ${current === s.num ? 'active' : current > s.num ? 'completed' : ''}`}>
                            {current > s.num ? '✓' : s.num}
                        </div>
                        <div className={`pay-step-label ${current === s.num ? 'active' : ''}`}>{s.label}</div>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`pay-step-line ${current > s.num ? 'completed' : ''}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

/* ---- Helper: format address object to string ---- */
const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    if (typeof addr === 'string') return addr;
    // Handle both single address object and array
    const a = Array.isArray(addr) ? addr[0] : addr;
    if (!a) return 'N/A';
    if (typeof a === 'string') return a;
    const parts = [a.street, a.city, a.state, a.zip].filter(Boolean);
    return parts.join(', ') || 'N/A';
};

/* ======== MAIN COMPONENT ======== */
const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { paymentMethods, fetchMethodsStatus, paymentStatus, paymentResponse } = useSelector((s) => s.payment);
    const { accountId, currentBalance, currency, serviceAddress, fetchStatus: acctFetchStatus } = useSelector((s) => s.account);

    const [step, setStep] = useState(1);
    const [amountOption, setAmountOption] = useState('other'); // 'total' | 'other'
    const [paymentMethod, setPaymentMethod] = useState('credit_card'); // 'credit_card' | 'bank_transfer'
    const [formData, setFormData] = useState({
        paymentAmount: '',
        // Credit Card fields
        cardName: '',
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvv: '',
        // Bank Transfer fields
        accountHolderName: '',
        routingNumber: '',
        confirmRoutingNumber: '',
        bankName: '',
        bankAccountNumber: '',
        confirmBankAccountNumber: '',
        accountType: '',
        // Billing
        billingFirstName: '',
        billingLastName: '',
        zipCode: '',
        sameAsService: true,
        rememberCard: true,
        defaultCard: false,
    });
    const [errors, setErrors] = useState({});
    const [numericWarnings, setNumericWarnings] = useState({});

    // Fetch account + payment methods on mount
    useEffect(() => {
        if (acctFetchStatus === 'idle') dispatch(fetchAccount());
        if (fetchMethodsStatus === 'idle') dispatch(fetchPaymentMethods());
        return () => { dispatch(resetPaymentState()); };
    }, [dispatch, acctFetchStatus, fetchMethodsStatus]);

    // Auto-transition on success
    useEffect(() => {
        if (paymentStatus === 'succeeded' && step === 2) setStep(3);
    }, [paymentStatus, step]);

    // If user picks "Total Amount Due", set the amount
    useEffect(() => {
        if (amountOption === 'total' && currentBalance != null) {
            setFormData((p) => ({ ...p, paymentAmount: currentBalance.toFixed(2) }));
        }
    }, [amountOption, currentBalance]);

    // Clear sensitive fields when switching payment method for security reasons
    useEffect(() => {
        setFormData((prev) => {
            const newData = { ...prev };
            if (paymentMethod === 'credit_card') {
                // Clear bank transfer fields
                newData.accountHolderName = '';
                newData.routingNumber = '';
                newData.confirmRoutingNumber = '';
                newData.bankName = '';
                newData.bankAccountNumber = '';
                newData.confirmBankAccountNumber = '';
                newData.accountType = '';
            } else if (paymentMethod === 'bank_transfer') {
                // Clear credit card fields
                newData.cardName = '';
                newData.cardNumber = '';
                newData.expMonth = '';
                newData.expYear = '';
                newData.cvv = '';
            }
            return newData;
        });

        // Also clear any related visual warnings
        if (paymentMethod === 'credit_card') {
            setNumericWarnings({});
        }
    }, [paymentMethod]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Auto-format card number with spaces every 4 digits
        if (name === 'cardNumber') {
            const digits = value.replace(/\D/g, '').slice(0, 16);
            const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
            setFormData((p) => ({ ...p, cardNumber: formatted }));
            if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
            return;
        }

        // When year changes, clear month if it's now expired
        if (name === 'expYear') {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            const selectedYear = parseInt(value);
            setFormData((p) => {
                const newData = { ...p, expYear: value };
                if (selectedYear === currentYear && parseInt(p.expMonth) > 0 && parseInt(p.expMonth) < currentMonth) {
                    newData.expMonth = '';
                }
                return newData;
            });
            if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
            return;
        }

        // Strip non-numeric characters for routing / account number fields
        const numericOnlyFields = ['routingNumber', 'confirmRoutingNumber', 'bankAccountNumber', 'confirmBankAccountNumber'];
        if (numericOnlyFields.includes(name)) {
            const hasNonNumeric = /\D/.test(value);
            const sanitized = value.replace(/\D/g, '');
            setFormData((p) => ({ ...p, [name]: sanitized }));
            if (hasNonNumeric) {
                setNumericWarnings((p) => ({ ...p, [name]: 'Only numbers are allowed' }));
                setTimeout(() => setNumericWarnings((p) => ({ ...p, [name]: null })), 2000);
            } else {
                setNumericWarnings((p) => ({ ...p, [name]: null }));
            }
        } else {
            setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
        }
        if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
    };

    /* ---- VALIDATIONS ---- */
    const validate = () => {
        const err = {};
        const amt = parseFloat(formData.paymentAmount);
        if (isNaN(amt) || amt <= 0) err.paymentAmount = 'Enter a valid payment amount';

        if (paymentMethod === 'credit_card') {
            if (!formData.cardName.trim()) err.cardName = 'Cardholder name is required';
            if (!/^\d{12,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) err.cardNumber = 'Enter a valid 12–19 digit card number';
            if (!formData.expMonth) err.expMonth = 'Required';
            if (!formData.expYear) err.expYear = 'Required';
            // Reject expired cards
            if (formData.expMonth && formData.expYear) {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                const selYear = parseInt(formData.expYear);
                const selMonth = parseInt(formData.expMonth);
                if (selYear < currentYear || (selYear === currentYear && selMonth < currentMonth)) {
                    err.expMonth = 'Card has expired';
                    err.expYear = 'Card has expired';
                }
            }
            if (!/^\d{3,4}$/.test(formData.cvv)) err.cvv = 'Enter a valid 3 or 4 digit CVV';
        } else if (paymentMethod === 'bank_transfer') {
            if (!formData.accountHolderName.trim()) err.accountHolderName = 'Account holder name is required';
            if (!/^\d{9}$/.test(formData.routingNumber)) err.routingNumber = 'Routing number must be exactly 9 digits';
            if (!formData.confirmRoutingNumber) err.confirmRoutingNumber = 'Please confirm your routing number';
            else if (formData.routingNumber !== formData.confirmRoutingNumber) err.confirmRoutingNumber = 'Routing numbers do not match';
            // bankName is auto-populated from routing number lookup (backend), skip validation
            if (!/^\d{4,17}$/.test(formData.bankAccountNumber)) err.bankAccountNumber = 'Enter a valid account number (4–17 digits)';
            if (!formData.confirmBankAccountNumber) err.confirmBankAccountNumber = 'Please confirm your account number';
            else if (formData.bankAccountNumber !== formData.confirmBankAccountNumber) err.confirmBankAccountNumber = 'Account numbers do not match';
            if (!formData.accountType) err.accountType = 'Account type is required';
        }

        if (!formData.billingLastName.trim()) err.billingLastName = 'Last name is required';
        if (!/^\d{5}$/.test(formData.zipCode)) err.zipCode = 'Enter a valid 5-digit zip code';
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleNext = () => { if (validate()) setStep(2); };
    const handleBack = () => setStep(1);

    const handlePay = () => {
        const amt = parseFloat(formData.paymentAmount) + TRANSACTION_FEE;
        const paymentData = { accountId, amount: amt, method: paymentMethod };
        if (paymentMethod === 'credit_card') {
            paymentData.cardNumber = formData.cardNumber;
        } else if (paymentMethod === 'bank_transfer') {
            paymentData.routingNumber = formData.routingNumber;
            paymentData.bankAccountNumber = formData.bankAccountNumber;
            paymentData.accountType = formData.accountType;
        }
        dispatch(processPayment(paymentData));
    };

    const maskedCard = formData.cardNumber ? `****${formData.cardNumber.replace(/\s/g, '').slice(-4)}` : '';
    const maskedBank = formData.bankAccountNumber ? `****${formData.bankAccountNumber.slice(-4)}` : '';
    const paymentMethodLabel = paymentMethod === 'credit_card'
        ? `VISA(${maskedCard})`
        : `Bank Transfer(${maskedBank})`;
    const baseAmt = parseFloat(formData.paymentAmount) || 0;
    const totalAmt = baseAmt + TRANSACTION_FEE;
    const primaryAddress = formatAddress(serviceAddress);
    const today = new Date();

    /* =============== STEP 1 =============== */
    const renderStep1 = () => (
        <>
            {/* Payment Amount */}
            <div className="pay-section">
                <div className="pay-section-title">
                    Payment Amount
                </div>
                <div className="pay-radio-group">
                    <label className="pay-radio-item">
                        <input type="radio" name="amountOption" checked={amountOption === 'total'} onChange={() => setAmountOption('total')} />
                        <span>Total Amount Due &nbsp;<strong>{currency === 'USD' ? '$' : ''}{currentBalance?.toFixed(2) ?? '0.00'}</strong></span>
                    </label>
                    <label className="pay-radio-item">
                        <input type="radio" name="amountOption" checked={amountOption === 'other'} onChange={() => setAmountOption('other')} />
                        <span>Other</span>
                    </label>
                </div>
                {amountOption === 'other' && (
                    <div className="pay-field" style={{ marginTop: '0.75rem', maxWidth: '220px' }}>
                        <label className="pay-label">Payment Amount <span className="required">*</span></label>
                        <input
                            className={`pay-input ${errors.paymentAmount ? 'error' : ''}`}
                            type="number" name="paymentAmount" step="0.01" placeholder="0.00"
                            value={formData.paymentAmount} onChange={handleChange}
                        />
                        {errors.paymentAmount && <div className="pay-error">⚠ {errors.paymentAmount}</div>}
                    </div>
                )}
            </div>

            {/* Payment Date */}
            <div className="pay-section">
                <div className="pay-section-title">
                    Payment Date
                </div>
                <div className="pay-radio-group">
                    <label className="pay-radio-item">
                        <input type="radio" name="payDate" defaultChecked /> <span>Pay Now</span>
                    </label>
                    <label className="pay-radio-item" style={{ opacity: 0.5 }}>
                        <input type="radio" name="payDate" disabled /> <span>Pay Later</span>
                    </label>
                </div>
            </div>

            {/* Payment Method */}
            <div className="pay-section">
                <div className="pay-section-title">
                    Payment Method
                </div>

                {/* Saved card dropdown */}
                <div className="pay-field">
                    <select className="pay-select" defaultValue="visa">
                        <option value="visa">VISA (****1111) (Default)</option>
                        {paymentMethods.map((m) => (
                            <option key={m.code} value={m.code}>{m.label}</option>
                        ))}
                    </select>
                </div>

                {/* New Payment Method */}
                <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginTop: '0.5rem' }}>
                    <div className="pay-new-method-header">
                        New Payment Method <span>−</span>
                    </div>

                    {/* Processor Icons */}
                    <div className="pay-card-icons" style={{ marginBottom: '0.75rem', fontSize: '1.5rem', gap: '1rem' }}>
                        <span className={`pay-card-badge ${paymentMethod === 'credit_card' ? 'selected' : ''}`} title="Credit Card" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => { setPaymentMethod('credit_card'); setErrors({}); }}><FaCreditCard /></span>
                        <span className={`pay-card-badge ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`} title="Bank Transfer" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => { setPaymentMethod('bank_transfer'); setErrors({}); }}><FaUniversity /></span>
                        <span className="pay-card-badge" title="PayPal" style={{ color: '#003087', padding: '0.5rem 1rem', cursor: 'not-allowed', opacity: 0.5 }}><FaPaypal /></span>
                        <span className="pay-card-badge" title="Venmo" style={{ color: '#008CFF', padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'not-allowed', opacity: 0.5 }}><SiVenmo /></span>
                        <span className="pay-card-badge" title="Google Pay" style={{ color: '#4285f4', padding: '0.5rem 1rem', cursor: 'not-allowed', opacity: 0.5 }}><FaGooglePay size={28} /></span>
                    </div>

                    {/* Accepted cards — only for credit card */}
                    {paymentMethod === 'credit_card' && (
                        <div className="pay-accepted-cards" style={{ fontSize: '2rem', gap: '1rem' }}>
                            <span className="pay-accepted-label" style={{ fontSize: '0.9rem' }}>Accepted Cards</span>
                            <SiAmericanexpress style={{ color: '#006fcf' }} />
                            <SiVisa style={{ color: '#1a1f71', fontSize: '2.5rem' }} />
                            <svg width="40" height="24" viewBox="0 0 40 24" style={{ display: 'inline-block' }}>
                                <circle cx="15" cy="12" r="12" fill="#eb001b" />
                                <circle cx="25" cy="12" r="12" fill="#f79e1b" style={{ mixBlendMode: 'multiply' }} />
                            </svg>
                            <SiDiscover style={{ color: '#ff6000' }} />
                        </div>
                    )}

                    {/* Payment Method Fields */}
                    <div className="pay-new-method-body">
                        {paymentMethod === 'credit_card' && (
                            <>
                                <div className="pay-field">
                                    <label className="pay-label">Name on Card <span className="required">*</span></label>
                                    <input className={`pay-input ${errors.cardName ? 'error' : ''}`} type="text" name="cardName" placeholder="John Doe" value={formData.cardName} onChange={handleChange} />
                                    {errors.cardName && <div className="pay-error">⚠ {errors.cardName}</div>}
                                </div>
                                <div className="pay-field">
                                    <label className="pay-label">Card Number <span className="required">*</span></label>
                                    <input className={`pay-input ${errors.cardNumber ? 'error' : ''}`} type="text" name="cardNumber" placeholder="•••• •••• •••• ••••" maxLength="19" value={formData.cardNumber} onChange={handleChange} />
                                    {errors.cardNumber && <div className="pay-error">⚠ {errors.cardNumber}</div>}
                                </div>
                                <div className="pay-row">
                                    <div className="pay-field">
                                        <label className="pay-label">Month <span className="required">*</span></label>
                                        <select className={`pay-select ${errors.expMonth ? 'error' : ''}`} name="expMonth" value={formData.expMonth} onChange={handleChange}>
                                            <option value="">Month</option>
                                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
                                                .filter((m) => {
                                                    const now = new Date();
                                                    if (parseInt(formData.expYear) === now.getFullYear()) {
                                                        return parseInt(m) >= now.getMonth() + 1;
                                                    }
                                                    return true;
                                                })
                                                .map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                        </select>
                                        {errors.expMonth && <div className="pay-error">⚠ {errors.expMonth}</div>}
                                    </div>
                                    <div className="pay-field">
                                        <label className="pay-label">Year <span className="required">*</span></label>
                                        <select className={`pay-select ${errors.expYear ? 'error' : ''}`} name="expYear" value={formData.expYear} onChange={handleChange}>
                                            <option value="">Year</option>
                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                        {errors.expYear && <div className="pay-error">⚠ {errors.expYear}</div>}
                                    </div>
                                    <div className="pay-field">
                                        <label className="pay-label">CVV <span className="required">*</span></label>
                                        <input className={`pay-input ${errors.cvv ? 'error' : ''}`} type="text" name="cvv" placeholder="•••" maxLength="4" value={formData.cvv} onChange={handleChange} />
                                        {errors.cvv && <div className="pay-error">⚠ {errors.cvv}</div>}
                                    </div>
                                </div>
                            </>
                        )}

                        {paymentMethod === 'bank_transfer' && (
                            <>
                                <div className="pay-field">
                                    <label className="pay-label">Account Holder Name <span className="required">*</span></label>
                                    <input className={`pay-input ${errors.accountHolderName ? 'error' : ''}`} type="text" name="accountHolderName" placeholder="Account Holder Name" value={formData.accountHolderName} onChange={handleChange} />
                                    {errors.accountHolderName && <div className="pay-error">⚠ {errors.accountHolderName}</div>}
                                </div>
                                <div className="pay-field">
                                    <label className="pay-label">Routing Number <span className="required">*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input className={`pay-input ${errors.routingNumber ? 'error' : ''}`} type="password" name="routingNumber" placeholder="•••••••••" maxLength="9" inputMode="numeric" value={formData.routingNumber} onChange={handleChange} />
                                        <FaInfoCircle style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'help' }} title="9-digit routing number found on your check or bank statement" />
                                    </div>
                                    {errors.routingNumber && <div className="pay-error">⚠ {errors.routingNumber}</div>}
                                    {numericWarnings.routingNumber && <div className="pay-error" style={{ animation: 'fadeIn 0.2s ease' }}>⚠ {numericWarnings.routingNumber}</div>}
                                </div>
                                <div className="pay-field">
                                    <label className="pay-label">Confirm Routing Number <span className="required">*</span></label>
                                    <input className={`pay-input ${errors.confirmRoutingNumber ? 'error' : ''}`} type="text" name="confirmRoutingNumber" placeholder="Confirm Routing Number" maxLength="9" inputMode="numeric" value={formData.confirmRoutingNumber} onChange={handleChange} />
                                    {errors.confirmRoutingNumber && <div className="pay-error">⚠ {errors.confirmRoutingNumber}</div>}
                                    {numericWarnings.confirmRoutingNumber && <div className="pay-error" style={{ animation: 'fadeIn 0.2s ease' }}>⚠ {numericWarnings.confirmRoutingNumber}</div>}
                                </div>
                                <div className="pay-field">
                                    <label className="pay-label">Bank Name <span className="required">*</span></label>
                                    <input className="pay-input" type="text" name="bankName" placeholder="Auto-populated from Routing Number" value={formData.bankName} disabled style={{ backgroundColor: 'var(--bg-muted, #f0f0f0)', color: 'var(--text-muted, #999)', cursor: 'not-allowed' }} />
                                </div>
                                <div className="pay-field">
                                    <label className="pay-label">Bank Account Number <span className="required">*</span></label>
                                    <input className={`pay-input ${errors.bankAccountNumber ? 'error' : ''}`} type="password" name="bankAccountNumber" placeholder="Bank Account Number" maxLength="17" value={formData.bankAccountNumber} onChange={handleChange} />
                                    {errors.bankAccountNumber && <div className="pay-error">⚠ {errors.bankAccountNumber}</div>}
                                </div>
                                <div className="pay-field">
                                    <label className="pay-label">Confirm Bank Account Number <span className="required">*</span></label>
                                    <input className={`pay-input ${errors.confirmBankAccountNumber ? 'error' : ''}`} type="text" name="confirmBankAccountNumber" placeholder="Confirm Bank Account Number" maxLength="17" value={formData.confirmBankAccountNumber} onChange={handleChange} />
                                    {errors.confirmBankAccountNumber && <div className="pay-error">⚠ {errors.confirmBankAccountNumber}</div>}
                                </div>
                                <div className="pay-field">
                                    <label className="pay-label">Account Type <span className="required">*</span></label>
                                    <select className={`pay-select ${errors.accountType ? 'error' : ''}`} name="accountType" value={formData.accountType} onChange={handleChange}>
                                        <option value="">Account Type</option>
                                        <option value="checking">Checking</option>
                                        <option value="savings">Savings</option>
                                    </select>
                                    {errors.accountType && <div className="pay-error">⚠ {errors.accountType}</div>}
                                </div>
                            </>
                        )}

                        {/* Remember + Default */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <label className="pay-checkbox-item">
                                <input type="checkbox" name="rememberCard" checked={formData.rememberCard} onChange={handleChange} />
                                Remember Payment Option for future use
                            </label>
                            <label className="pay-checkbox-item">
                                <input type="checkbox" name="defaultCard" checked={formData.defaultCard} onChange={handleChange} />
                                Make this my default Payment Method
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Address */}
            <div className="pay-section">
                <div className="pay-section-title">
                    Billing Address
                </div>
                <label className="pay-checkbox-item" style={{ marginBottom: '1rem' }}>
                    <input type="checkbox" name="sameAsService" checked={formData.sameAsService} onChange={handleChange} />
                    Same as Service Address
                </label>
                <div className="pay-row">
                    <div className="pay-field">
                        <label className="pay-label">First Name</label>
                        <input className="pay-input" type="text" name="billingFirstName" placeholder="First Name" value={formData.billingFirstName} onChange={handleChange} />
                    </div>
                    <div className="pay-field">
                        <label className="pay-label">Last Name <span className="required">*</span></label>
                        <input className={`pay-input ${errors.billingLastName ? 'error' : ''}`} type="text" name="billingLastName" placeholder="Last Name" value={formData.billingLastName} onChange={handleChange} />
                        {errors.billingLastName && <div className="pay-error">⚠ {errors.billingLastName}</div>}
                    </div>
                </div>
                <div className="pay-field" style={{ maxWidth: '200px' }}>
                    <label className="pay-label">Zip Code <span className="required">*</span></label>
                    <input className={`pay-input ${errors.zipCode ? 'error' : ''}`} type="text" name="zipCode" placeholder="00000" maxLength="5" value={formData.zipCode} onChange={handleChange} />
                    {errors.zipCode && <div className="pay-error">⚠ {errors.zipCode}</div>}
                </div>
            </div>

            {/* Buttons */}
            <div className="pay-btn-row right">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleNext}>Next</button>
            </div>
        </>
    );

    /* =============== STEP 2 =============== */
    const renderStep2 = () => (
        <>
            <ul className="pay-summary-list">
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaGlobe /></div>
                    <div><div className="pay-summary-label">Account Number</div><div className="pay-summary-value">{accountId}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaMapMarkerAlt /></div>
                    <div><div className="pay-summary-label">Service Address</div><div className="pay-summary-value">{primaryAddress}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaDollarSign /></div>
                    <div><div className="pay-summary-label">Bill Amount</div><div className="pay-summary-value">${baseAmt.toFixed(2)}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaDollarSign /></div>
                    <div><div className="pay-summary-label">Transaction Fees</div><div className="pay-summary-value">${TRANSACTION_FEE.toFixed(2)}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaDollarSign /></div>
                    <div><div className="pay-summary-label">Payment Amount</div><div className="pay-summary-value">${totalAmt.toFixed(2)}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaCalendarAlt /></div>
                    <div><div className="pay-summary-label">Payment Date</div><div className="pay-summary-value">{today.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon">{paymentMethod === 'credit_card' ? <FaCreditCard /> : <FaUniversity />}</div>
                    <div><div className="pay-summary-label">Payment Method</div><div className="pay-summary-value">{paymentMethodLabel}</div></div>
                </li>
            </ul>

            <div style={{ marginTop: '1.5rem' }}>
                <div className="pay-info-note"><span className="info-icon"><FaInfoCircle /></span> There will be a $6.00 transaction fee as well as $4,000.00 limit on the transaction.</div>
                <div className="pay-info-note"><span className="info-icon"><FaInfoCircle /></span> Please note, Bank Payments may take up to 24 to 48 hours to reflect.</div>
            </div>

            <div className="pay-btn-row">
                <button className="btn btn-secondary" onClick={handleBack} disabled={paymentStatus === 'loading'}>Back</button>
                <button className="btn btn-primary" onClick={handlePay} disabled={paymentStatus === 'loading'}>
                    {paymentStatus === 'loading' ? 'Processing...' : 'Make a payment'}
                </button>
            </div>
            {paymentStatus === 'failed' && <div className="pay-error" style={{ justifyContent: 'center', marginTop: '1rem' }}>⚠ Payment failed. Please try again.</div>}
        </>
    );

    /* =============== STEP 3 =============== */
    const renderStep3 = () => (
        <div style={{ textAlign: 'center' }}>
            <div className="pay-success-badge"><FaCheck /></div>
            <h2 style={{ marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>A confirmation email has been sent to your Email Address.</p>

            <ul className="pay-summary-list" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'left' }}>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaGlobe /></div>
                    <div><div className="pay-summary-label">Account Number</div><div className="pay-summary-value">{accountId}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaMapMarkerAlt /></div>
                    <div><div className="pay-summary-label">Service Address</div><div className="pay-summary-value">{primaryAddress}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaDollarSign /></div>
                    <div><div className="pay-summary-label">Bill Amount</div><div className="pay-summary-value">${baseAmt.toFixed(2)}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaDollarSign /></div>
                    <div><div className="pay-summary-label">Transaction Fees</div><div className="pay-summary-value">${TRANSACTION_FEE.toFixed(2)}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaDollarSign /></div>
                    <div><div className="pay-summary-label">Payment Amount</div><div className="pay-summary-value">${paymentResponse?.paidAmount?.toFixed(2) ?? totalAmt.toFixed(2)}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaCalendarAlt /></div>
                    <div><div className="pay-summary-label">Transaction Date</div><div className="pay-summary-value">{paymentResponse?.paidAt ? new Date(paymentResponse.paidAt).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : today.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon"><FaReceipt /></div>
                    <div><div className="pay-summary-label">Transaction ID</div><div className="pay-summary-value">{paymentResponse?.transactionId ?? 'N/A'}</div></div>
                </li>
                <li className="pay-summary-row">
                    <div className="pay-summary-icon">{paymentMethod === 'credit_card' ? <FaCreditCard /> : <FaUniversity />}</div>
                    <div><div className="pay-summary-label">Payment Method</div><div className="pay-summary-value">{paymentMethodLabel}</div></div>
                </li>
            </ul>

            <div className="pay-btn-row">
                <button className="btn btn-secondary" onClick={() => window.print()}>Print</button>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Done</button>
            </div>
        </div>
    );

    /* =============== RENDER =============== */
    return (
        <div className="payment-container">
            <div className="card" style={{ padding: '2rem' }}>
                <StepIndicator current={step} />
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};

export default Payment;
