import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App.jsx'
import { store, persistor } from './store/store.js'
import { injectStore } from './api/api.js'
import './index.css'

// Inject store into api
injectStore(store)

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>
)
