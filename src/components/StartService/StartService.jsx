import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import {
    Stepper, Step, StepLabel, Button, Typography, TextField,
    Select, MenuItem, InputLabel, FormControl, Card, CardContent,
    List, ListItem, ListItemText, Box, CircularProgress, Alert,
    Autocomplete, RadioGroup, Radio, FormControlLabel
} from '@mui/material'

const StartService = () => {
    const navigate = useNavigate()
    const { token } = useSelector((state) => state.auth)
    const isLoggedIn = !!token

    const steps = isLoggedIn
        ? ['Property Address', 'Schedule & Plan', 'Review & Submit']
        : ['Property Address', 'Schedule & Plan', 'Personal Information', 'Review & Submit']

    // Helper to map UI step to internal logic step
    const getInternalStep = (stepIndex) => {
        if (!isLoggedIn) return stepIndex
        if (stepIndex >= 2) return stepIndex + 1 // Skip Personal Info index
        return stepIndex
    }

    const [activeStep, setActiveStep] = useState(0)
    const [formData, setFormData] = useState({
        street: '', city: '', state: '', zip: '',
        startDate: '',
        planType: 'standard',
        propertyType: 'Single Family Home',
        isSomeonePresent: 'yes',
        accessInstructions: '',
        secondaryContact: '',
        firstName: '', lastName: '', email: '', phone: '', ssn: ''
    })

    const [ticketId, setTicketId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Address Autocomplete State
    const [addressOptions, setAddressOptions] = useState([])
    const [addressQuery, setAddressQuery] = useState('')
    const [addressLoading, setAddressLoading] = useState(false)

    useEffect(() => {
        if (!addressQuery || addressQuery.length < 3) {
            setAddressOptions([])
            return
        }

        const delayDebounceFn = setTimeout(async () => {
            setAddressLoading(true)
            try {
                const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(addressQuery)}&limit=5&lang=en`)
                const data = await response.json()
                const mappedOptions = data.features.map(f => {
                    const props = f.properties
                    const streetLabel = props.housenumber && props.street ? `${props.housenumber} ${props.street}` : (props.street || props.name || '')
                    return {
                        label: [streetLabel, props.city, props.state, props.postcode].filter(Boolean).join(', '),
                        street: streetLabel,
                        city: props.city || '',
                        state: props.state || '',
                        zip: props.postcode || ''
                    }
                }).filter(opt => opt.street && opt.city) // Filter out vague results without a city/street

                // Deduplicate array
                const uniqueOptions = Array.from(new Map(mappedOptions.map(item => [item.label, item])).values())
                setAddressOptions(uniqueOptions)
            } catch (err) {
                console.error("Error fetching addresses:", err)
            } finally {
                setAddressLoading(false)
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [addressQuery])

    const isStepSkipped = (step) => {
        return false // We no longer hide steps, we filter the array
    }

    const handleNext = () => {
        const internalStep = getInternalStep(activeStep)
        // Validation Logic
        if (internalStep === 0) {
            if (!formData.street || !formData.city || !formData.state || !formData.zip) {
                setError('Please ensure your street, city, state, and zip code are fully provided.')
                return
            }
            if (!/^\d{5}$/.test(formData.zip.replace(/\s/g, ''))) {
                setError('Please enter a valid 5-digit zip code.')
                return
            }
        } else if (internalStep === 1) {
            if (!formData.startDate) {
                setError('Please select a desired start date.')
                return
            }
            if (formData.isSomeonePresent === 'no' && !formData.accessInstructions?.trim()) {
                setError('Access instructions are required if no one will be present.')
                return
            }
        } else if (internalStep === 2 && !isLoggedIn) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.ssn) {
                setError('Please fill out all required personal information fields.')
                return
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setError('Please enter a valid email address.')
                return
            }
            if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
                setError('Please enter a valid 10-digit phone number.')
                return
            }
            if (!/^\d{9}$/.test(formData.ssn.replace(/\D/g, ''))) {
                setError('Please enter exactly 9 digits for your SSN or ID.')
                return
            }
        }

        setError(null)
        setActiveStep(activeStep + 1)
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if (activeStep === steps.length - 1) {
            handleSubmit()
        } else {
            handleNext()
        }
    }

    const handleBack = () => {
        setError(null)
        setActiveStep(activeStep - 1)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.post('/utility/electricity/start-service', formData)
            setTicketId(response.data.ticketId)
            setActiveStep(steps.length) // Go to completion screen
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit service request. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            {/* Navigation Header / Banner */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
                px: 4,
                py: 2,
                borderBottom: '1px solid var(--border)',
                mb: 4
            }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        letterSpacing: '-0.5px'
                    }}
                    onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                >
                    Smart CX
                </Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/login')}
                >
                    Back to Login
                </Button>
            </Box>

            <div style={{ padding: '0 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
                <Card sx={{ padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'var(--primary-dark)', textAlign: 'center' }}>
                        Start New Service
                    </Typography>

                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                        {steps.map((label, index) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {activeStep === steps.length ? (
                        <Box textAlign="center" py={4}>
                            <Typography variant="h5" sx={{ mb: 2, color: 'var(--success)' }}>
                                Service Request Submitted Successfully!
                            </Typography>
                            <Typography sx={{ mb: 4 }}>
                                Your confirmation number is: <strong>{ticketId}</strong>. We will contact you shortly to confirm the scheduled start date.
                            </Typography>
                            <Button variant="contained" sx={{ backgroundColor: 'var(--primary)' }} onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}>
                                {isLoggedIn ? 'Return to Dashboard' : 'Return to Login'}
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" noValidate autoComplete="off" onSubmit={handleFormSubmit}>
                            {/* STEP 0: Address */}
                            {getInternalStep(activeStep) === 0 && (
                                <Box sx={{ display: 'grid', gap: 2 }}>
                                    <Autocomplete
                                        freeSolo
                                        options={addressOptions}
                                        loading={addressLoading}
                                        getOptionLabel={(option) => option.street ? option.label : option}
                                        filterOptions={(x) => x} // Disable built-in filtering, handle API
                                        onChange={(event, newValue) => {
                                            if (newValue && typeof newValue === 'object') {
                                                setFormData({ ...formData, street: newValue.street, city: newValue.city, state: newValue.state, zip: newValue.zip })
                                            } else {
                                                setFormData({ ...formData, street: newValue || '' })
                                            }
                                        }}
                                        onInputChange={(event, newInputValue) => {
                                            setFormData({ ...formData, street: newInputValue })
                                            setAddressQuery(newInputValue)
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required
                                                label="Street Address"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <React.Fragment>
                                                            {addressLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </React.Fragment>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField required name="city" label="City" value={formData.city} onChange={handleChange} fullWidth />
                                        <TextField required name="state" label="State" value={formData.state} onChange={handleChange} sx={{ width: '150px' }} />
                                        <TextField required name="zip" label="Zip Code" value={formData.zip} onChange={handleChange} sx={{ width: '200px' }} />
                                    </Box>
                                </Box>
                            )}

                            {/* STEP 1: Schedule & Plan */}
                            {getInternalStep(activeStep) === 1 && (
                                <Box sx={{ display: 'grid', gap: 3 }}>
                                    <TextField
                                        required
                                        name="startDate"
                                        label="Desired Start Date"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel>Service Plan Type</InputLabel>
                                        <Select name="planType" value={formData.planType} label="Service Plan Type" onChange={handleChange}>
                                            <MenuItem value="standard">Standard Residential (Fixed Rate)</MenuItem>
                                            <MenuItem value="green">100% Renewable Energy (Variable)</MenuItem>
                                            <MenuItem value="time_of_use">Time-of-Use Savings Plan</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>Access & Logistics</Typography>

                                    <FormControl fullWidth>
                                        <InputLabel>Property Type</InputLabel>
                                        <Select name="propertyType" value={formData.propertyType} label="Property Type" onChange={handleChange}>
                                            <MenuItem value="Single Family Home">Single Family Home</MenuItem>
                                            <MenuItem value="Apartment">Apartment</MenuItem>
                                            <MenuItem value="Gated Community">Gated Community</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl component="fieldset">
                                        <Typography variant="body2" color="textSecondary" mb={1}>Will someone be present to provide meter/door access on the start date?</Typography>
                                        <RadioGroup row name="isSomeonePresent" value={formData.isSomeonePresent} onChange={handleChange}>
                                            <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" />
                                            <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
                                        </RadioGroup>
                                    </FormControl>

                                    {formData.isSomeonePresent === 'no' && (
                                        <TextField
                                            required
                                            name="accessInstructions"
                                            label="Access Instructions (Gate codes, key location, etc.)"
                                            multiline rows={2}
                                            value={formData.accessInstructions}
                                            onChange={handleChange}
                                            fullWidth
                                        />
                                    )}

                                    <TextField name="secondaryContact" label="Secondary Contact / PM Phone (Optional)" value={formData.secondaryContact} onChange={handleChange} fullWidth />
                                </Box>
                            )}

                            {/* STEP 2: Personal Information (Skipped if logged in) */}
                            {getInternalStep(activeStep) === 2 && !isLoggedIn && (
                                <Box sx={{ display: 'grid', gap: 2 }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField required name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} fullWidth />
                                        <TextField required name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} fullWidth />
                                    </Box>
                                    <TextField required name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} fullWidth />
                                    <TextField required name="phone" label="Phone Number" value={formData.phone} onChange={handleChange} fullWidth />
                                    <TextField required name="ssn" label="SSN / ID Number (for credit check)" type="password" value={formData.ssn} onChange={handleChange} fullWidth />
                                </Box>
                            )}

                            {/* STEP 3: Review */}
                            {getInternalStep(activeStep) === 3 && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Review details</Typography>
                                    <List disablePadding>
                                        <ListItem sx={{ py: 1, px: 0 }}>
                                            <ListItemText primary="Service Address" secondary={`${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`} />
                                        </ListItem>
                                        <ListItem sx={{ py: 1, px: 0 }}>
                                            <ListItemText primary="Start Date" secondary={formData.startDate || 'Not provided'} />
                                        </ListItem>
                                        <ListItem sx={{ py: 1, px: 0 }}>
                                            <ListItemText primary="Plan Type" secondary={formData.planType === 'standard' ? 'Standard Residential' : formData.planType === 'green' ? '100% Renewable Energy' : 'Time-of-Use'} />
                                        </ListItem>
                                        <ListItem sx={{ py: 1, px: 0 }}>
                                            <ListItemText primary="Logistics" secondary={`${formData.propertyType} | Presence: ${formData.isSomeonePresent === 'yes' ? 'Yes' : 'No'}`} />
                                        </ListItem>
                                        {formData.isSomeonePresent === 'no' && (
                                            <ListItem sx={{ py: 1, px: 0 }}>
                                                <ListItemText primary="Access Instructions" secondary={formData.accessInstructions || 'None provided'} />
                                            </ListItem>
                                        )}
                                        {!isLoggedIn && (
                                            <ListItem sx={{ py: 1, px: 0 }}>
                                                <ListItemText primary="Applicant" secondary={`${formData.firstName} ${formData.lastName} (${formData.email})`} />
                                            </ListItem>
                                        )}
                                    </List>
                                </Box>
                            )}

                            {error && (
                                <Box sx={{ mb: 3 }}>
                                    <Alert severity="error">{error}</Alert>
                                </Box>
                            )}

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid var(--border)' }}>
                                <Button disabled={activeStep === 0 || loading} onClick={handleBack} variant="outlined">
                                    Back
                                </Button>
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{ backgroundColor: 'var(--primary)', minWidth: '150px' }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
                                    </Button>
                                ) : (
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: 'var(--primary)' }}>
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </Card>
            </div>
        </Box>
    )
}

export default StartService
