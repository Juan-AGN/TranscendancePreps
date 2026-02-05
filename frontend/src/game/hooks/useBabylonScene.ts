/**
 * useBabylonScene - Hook custom de React pa gestionar la escena 3D de Babylon
 * Crea, inicializa y limpia la escena del Hub 3D
 * Maneja el progreso de carga y sincroniza con el store global
 */

import { useEffect, useRef } from 'react';
import { HomeScene3D } from '../engine/scenes/HomeScene3D';
import { useGameStore } from '../../shared/store/gameStore';

// Interface q define los props del hook (parametros de entrada)
interface UseBabylonSceneProps {
  canvasId: string;  // id del canvas HTML donde se renderiza el 3D
  enabled?: boolean;
  onProgress?: (progress: number, label: string) => void;  // callback opcional pa reportar progreso
  onComplete?: () => void;  // callback opcional cuando termina la carga
}

/** Hook pa crear y gestionar la escena 3D de Babylon
  * Maneja el ciclo de vida completo: creacion, carga, cleanup */
export const useBabylonScene = ({ 
  canvasId,
  enabled = true,
  onProgress, 
  onComplete 
}: UseBabylonSceneProps) => {
  // useRef -> guarda la referencia a la escena 3D sin causar re-renders
  // al cambiar sceneRef.current, React NO vuelve a renderizar el componente
  const sceneRef = useRef<HomeScene3D | null>(null);  // referencia persistente a la escena
  
  // Obtenemos la func del store pa marcar q el Hub esta listo
  const setHubReady = useGameStore(state => state.setHubReady);

  // useEffect -> ejecuta codigo cuando el componente se monta/desmonta
  // se ejecuta 1 vez cuando el componente aparece en pantalla
  useEffect(() => {
    if (!enabled) return;
    
    // Flag pa evitar actualizaciones de estado si el componente se desmonta
    // esto previene memory leaks y warnings de React
    let isCancelled = false;
    

    /** Inicializa la escena 3D de forma asincrona */
    const initScene = async () => {
      try {
        // Creamos la escena 3D con callback de progreso
        // le pasamos una func q se ejecuta cada vez q carga un asset
        const scene = new HomeScene3D(canvasId, (loaded, total) => {
          // Si el componente ya se desmonto, no hacemos nada
          if (isCancelled)
            return;
          
          // Calculamos el porcentaje de carga (ej: 5/10 = 50%)
          const percentage = Math.round((loaded / total) * 100);
          // Creamos el label informativo pa mostrar al usuario
          const label = `Cargando assets... ${loaded}/${total}`;
          
          // Ejecutamos el callback de progreso si existe
          // ?. -> optional chaining (solo llama si onProgress no es undefined)
          onProgress?.(percentage, label);
        });
        
        // Si el componente se desmonto durante la creacion, limpiamos y salimos
        if (isCancelled) {
          scene.dispose();  // liberamos memoria
          return;
        }
        
        // Guardamos la referencia a la escena pa poder limpiarla despues
        sceneRef.current = scene;
        
        // Cargamos todos los assets (modelos 3D, texturas, etc)
        // esto es asincrono, puede tardar varios segundos
        await scene.loadAssets();
        
        // Si el componente se desmonto durante la carga, limpiamos y salimos
        if (isCancelled) {
          scene.dispose();
          return;
        }
        
        // Todo cargado correctamente
        onProgress?.(100, 'Completado');  // reportamos 100% de progreso
        setHubReady(true);  // marcamos en el store global q el Hub esta listo
        onComplete?.();  // ejecutamos callback de finalizacion si existe
        
      } catch (error) {
        // Si algo fallo durante la inicializacion o carga
        if (!isCancelled) {
          console.error('Error al inicializar escena Babylon:', error);
          onProgress?.(100, 'Error de carga');  // reportamos error
          onComplete?.();  // ejecutamos callback igualmente pa desbloquear UI
        }
      }
    };

    // Iniciamos la carga de la escena
    initScene();

    // Cleanup function -> se ejecuta cuando el componente se desmonta
    // esto es CRITICO pa evitar memory leaks en aplicaciones React
    return () => {
      isCancelled = true;  // marcamos q el componente ya no existe
      // Si existe una escena activa, la limpiamos
      if (sceneRef.current) {
        sceneRef.current.dispose();  // libera memoria (engine, scene, meshes, etc)
        sceneRef.current = null;  // eliminamos la referencia
      }
    };
  }, [canvasId, enabled]);
  // Array de dependencias -> solo canvasId
  // NO incluimos onProgress/onComplete xq cambian en cada render y causan bucle infinito
  // usamos las referencias mas recientes con closures

  // Devolvemos un objeto con la referencia a la escena
  // otros componentes pueden acceder a sceneRef.current si necesitan la escena
  return { scene: sceneRef.current };
};