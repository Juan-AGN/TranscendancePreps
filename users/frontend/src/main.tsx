// ============================================================================
// PUNTO DE ENTRADA DE REACT
// ============================================================================
// Este es el primer archivo que ejecuta React.
// Su único trabajo es "montar" la aplicación en el div#root del index.html

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ReactDOM.createRoot() busca el div con id="root" en el index.html
// y le dice a React que tome el control de ese div.
// A partir de aquí, React maneja todo el contenido de la página.
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* StrictMode ayuda a detectar errores durante el desarrollo */}
        <App />
    </React.StrictMode>
);
