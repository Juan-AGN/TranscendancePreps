# Transcendence - Frontend Developer Readme Init (en español luego lo ponemos en English )
    La arquitectura del front de Transcendence se basaría si todo sale bien ...
    en una aplicacion hibrida donde integrariamos una interfaz de usuario reactiva moderna con el motor renderizado 3D en tiempo real. 
    --Ver tambien como implementamos el juego mas tarde si es en 3D tambien-
    La eleccion se basa es separar...    REACT se encarga de toda la gestion UI(navegacion, menus, chats, login,etc...) reaccionando a los eventos de usuario , mientras la parte visual y fisica a BABYLON.JS, que gestiona el Canvas en tiempo real.
    Esta separacion hibrida nos permitiria(espero) tener una UI reactiva y asi no sacrificamos el rendimineto del renderizado 3D, utilizaremos ZUSTAND como puente globlal de estados, para que corran sin problemas y comunicacion de los dos.

### 1. Stack Tecnológico del FrontEnd

    Por el momento y salvo errores que surjan al final del PROJECT que crasheen todo esto...... Utilizamos y configuramos de Inicio en el FrontEnd:

  .   1.-**React**            | Para UI, menús, componentes interactivos   
  .   2.-**Babylon.js**       | Motor 3D, HUB3D y (juego de Pong(not yet)) 
  .   3.-**Vite**             | Dev-server rápido para codigo              
  .   4.-**Tailwind**         | Estilos rápidos con clases listas CSS      
  .   5.-**TypeScript**       | Seguridad de tipos (definido por Proyecto)     
  .   6.-**Zustand**          | Estado global simple y eficiente(x probar)     
  .   7.-**React Router**     | Gestiona la navegacion de la APP               
  .   8.-**clsx + tw-merge**  | Clases CSS dinámicas                           
  .   9.-**Draco3D**          | Compresor para optimizacion Modelos 3D (ojo!*) 

1. React 19
     Utilizamos REACT para toda la capa de interfaz de usuario(UI).
     La ventaja es no volver a dibujar toda la pagina cada vez que cambia algo. SOlo actualiza las partes que realmente han cambiado. Clave porque tenemos un HUB3D que se renderiza completamente, asi la UI puede cambiar sin interferir con el motor del juego.
     Esto evita recargas completas, parpadeos y problemas de sincronización con el juego.

2. Babylon.js
      BABYLON.JS  es el motor 3D que tenemos para Trancendence... Se encarga de todo lo que ocurre dentro del canvas: escena, camara, objetos, animaciones, logica , etc.... .
      Por el momento lo tenemos para el HUB3D interactivo, previsto y por ver aun para el juego.
      Separarando Babylon del resto de la UI evita que el renderizado 3D dependa del ciclo de render de React, mejorando el rendimiento y la estabilidad

3. TypeScript
      Definido al principio del proyecyo por el grupo para evitar errores mas adelante.
      TypeScript nos obliga a definir qué datos pasamos.
      Ej.... Si intentamo pasarle un texto a la función de calcularPuntuacion(), TypeScript no te dejará ni compilar!!!!!

4. Zustand
      Zustand es el sistema de estado global del frontend y una de las piezas clave en nuestra arquitectura.
      React y Babylon viven en mundos distintos: React trabaja con componentes y renderizado declarativo, y Babylon con un bucle de render y lógica imperativa. Zustand actúa como un punto común entre ambos.
      Se puede pensar como una pizarra compartida:
            -React puede leer y escribir estado
            -Babylon puede leer y escribir estado
            -Cuando algo cambia, quien lo use se actualiza

5. Vite
      Velocidad de Desarrollo
       Webpack es lento. Vite usa ES Modules nativos.
       La Ventaja es que el Hot Module Replacement (HMR) instantáneo. Podemos cambiar la velocidad de la pelota o el color del fondo y verlo reflejado en milisegundos sin perder el estado de la sesión( por ver resultados).

6. Tailwind CSS v4 
      Escribir CSS tradicional y pelearse con nombres de clase(menu-wrapper-inner-left) es una pérdida de tiempo.
      Uso: Nos permite crear Overlays: interfaces que flotan encima del juego 3D sin rompernos la cabeza con el z-index o el posicionamiento absoluto.
      Nosotoros Usamos la v4, que es más rápida y no requiere configuración compleja.

7. clsx + tailwind-merge 
      Utilidades de Clase
      ¿Por qué? Para lógica condicional en los estilos.
      Ejemplo: cn("btn-base", isActive && "bg-green-500", isDisabled && "opacity-50"). Nos permite cambiar el aspecto de los botones según el estado del juego de forma limpia y sin conflictos.
      
8. React router DOM
      Aunque el subject ya no obliga a tener una arquitectura SPA, RRDOM nos permite mantener el estaudo de usuario, del juego y del entorno 3D de forma continua, evitamos reinicio innecesario del motro y delas conexciones en tiempo real. React Router nos facilita separar claramente las distintas vistas.


9. Draco3D 
      Compresión de Assets
      ¿Por qué? Un modelo 3D sin comprimir puede pesar 20MB. Con Draco, baja a 2MB. Impacto: El juego carga rápido y no nos comemos los datos del usuario.


**Bundle**: Archivo(s) resultante(s) que el navegador descarga tras el build.
**Canvas**: Elemento HTML donde se renderiza el 3D.
**clsx**: Librería para combinar clases CSS de forma condicional.
**DOM**: Estructura HTML que maneja el navegador.
**Estado** (State): Datos que cambian durante la ejecución (usuario, puntuación).
**GLB**: Formato de modelo 3D binario optimizado para web.
**GLTF**: Formato moderno de modelos 3D estándar en web.
**HMR (Hot Module Replacement)**: Actualiza cambios al instante sin reiniciar la app
**Hot Reload**: Actualización del código sin recargar la página (gracias a Vite + HMR).
**Layout**: Estructura base de una pantalla (header, sidebar, contenido).
**Mesh**: Objeto 3D visible (pelota, mesa, pala)
**Overlay**: Interfaz que flota encima del canvas 3D.
**Payload**: Datos que se envían en una petición o evento.
**React Router DOM**: Librería para navegar entre pantallas sin recargar la página.
**Ruta (Route)**: Relación entre una URL y un componente.
**SPA (Single Page Application)**: Aplicación que no recarga al cambiar de pantalla.
**UI (User Interface)**: Parte visual e interactiva de la aplicación.
**Virtual DOM**: Representación interna que React usa para optimizar cambios en la UI.
**WebGL**: Tecnología que permite renderizar 3D en el navegador (Babylon lo usa).
**Webpack**: Herramienta antigua de build (más lenta).
**WebSocket**: Conexión en tiempo real entre cliente y servidor.



### A. Comandos Básicos
      npm run dev - Inicia el servidor de desarrollo (puerto 5173 por defecto)
      npm run build - Compila la aplicación para producción
      npm run preview - Previsualiza el build de producción
      npm run lint - Ejecuta el linter para revisar errores de código
      Servidor corriendo en: http://localhost:5173

### B. Flujo de la APP
      Usuario interactúa con UI (React)
         ↓
      Actualiza Zustand (estado global)
         ↓
      Babylon lee el estado de Zustand
         ↓
      Babylon actualiza la escena 3D
         ↓
      Babylon escribe cambios en Zustand
         ↓
      React detecta cambios y actualiza UI

### C. Problemillas Comunes y Soluciones
      Problemas Comunes y Soluciones
      ❌ "Cannot find module '@babylonjs/core'"

      Solución: npm install (falta instalar dependencias)
      ❌ El canvas 3D aparece en negro

      Verifica que la cámara esté bien posicionada
      Comprueba que haya al menos una luz en la escena
      Abre la consola del navegador para ver errores de Babylon
      ❌ Los cambios no se reflejan (HMR no funciona)

      Para por completo el servidor (Ctrl+C) y vuelve a ejecutar npm run dev
      Limpia la caché del navegador (Ctrl+Shift+R)
      ❌ Error de TypeScript en build

      Revisa los tipos en /src/types
      Asegúrate de que las props de los componentes estén bien tipadas
      ❌ El modelo 3D no carga (.glb/.gltf)

      Verifica la ruta del archivo en /public
      Comprueba en la consola si hay errores 404
      Asegúrate de que Draco esté configurado correctamente
      ojo! Draco habra que ponerlo dentro, para que comprima bien y no haya errores.




###  Dependencias instaladass 
    **Dependencias de Producción**
            @babylonjs/core (^8.46.2) - Motor 3D para el juego
            @babylonjs/loaders (^8.46.2) - Cargadores de modelos 3D
            clsx (^2.1.1) - Utilidad para manejar clases CSS condicionales
            draco3d (^1.5.7) - Compresión de geometría 3D
            react (^19.2.0) - Librería de interfaz de usuario
            react-dom (^19.2.0) - Renderizado de React en el DOM
            react-router-dom (^7.12.0) - Enrutamiento para React
            tailwind-merge (^3.4.0) - Fusión de clases Tailwind
            zustand (^5.0.10) - Gestión de estado
   **Dependencias de Desarrollo**
            @eslint/js (^9.39.1) - ESLint configuración JS
            @tailwindcss/postcss (^4.1.18) - Plugin PostCSS de Tailwind
            @types/node (^24.10.1) - Tipos TypeScript para Node
            @types/react (^19.2.5) - Tipos TypeScript para React
            @types/react-dom (^19.2.3) - Tipos TypeScript para React DOM
            @vitejs/plugin-react (^5.1.1) - Plugin React para Vite
            autoprefixer (^10.4.23) - Prefijos CSS automáticos
            eslint (^9.39.1) - Linter de código
            eslint-plugin-react-hooks (^7.0.1) - Reglas ESLint para hooks
            eslint-plugin-react-refresh (^0.4.24) - Plugin ESLint para React Refresh
            globals (^16.5.0) - Variables globales
            **postcss (^8.5.6) - Procesador CSS**
            tailwindcss (^4.1.18) - Framework CSS
            typescript (~5.9.3) - Superset de JavaScript tipado
            typescript-eslint (^8.46.4) - ESLint para TypeScript
            vite (^7.2.4) - Build tool y servidor de desarrollo



##### UPDATES 
      instalacion del paquete postcss para TAILWIND 4, no viene por defecto en tailwind. es un procesador de CSS