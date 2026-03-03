// ============================================================================
// CONFIGURACIÓN DE VITE
// ============================================================================
// Vite es la herramienta que convierte nuestro código React (JSX/TSX) 
// en JavaScript normal que el navegador puede entender.
// También levanta un servidor de desarrollo con hot reload.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react()  // Plugin que permite usar JSX/TSX (la sintaxis de React)
    ],
    server: {
        host: '0.0.0.0',  // Necesario para que funcione dentro de Docker
        port: 5173,        // Puerto donde correrá el frontend
    }
});
