// ============================================================================
// REACT ENTRY POINT
// ============================================================================
// This is the first file React executes.
// Its only job is to "mount" the application in the div#root of index.html

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ReactDOM.createRoot() finds the div with id="root" in index.html
// and tells React to take control of that div.
// From here, React manages all page content.
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* StrictMode helps detect errors during development */}
        <App />
    </React.StrictMode>
);
