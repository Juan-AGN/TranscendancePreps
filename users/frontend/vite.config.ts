// ============================================================================
// VITE CONFIGURATION
// ============================================================================
// Vite is the tool that converts our React code (JSX/TSX)
// into plain JavaScript that the browser can understand.
// It also starts a development server with hot reload.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react()  // Plugin that enables JSX/TSX syntax (React's syntax)
    ],
    server: {
        host: '0.0.0.0',  // Required for it to work inside Docker
        port: 5173,        // Port where the frontend will run
    }
});
