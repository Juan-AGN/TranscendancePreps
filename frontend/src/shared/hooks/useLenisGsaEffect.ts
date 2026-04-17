import { useEffect, type RefObject } from 'react'; // useEffect para montar y limpiar todo; RefObject para tipar los refs
import { gsap } from 'gsap'; // libreria de animaciones
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // plugin para ligar animacion al scroll
import Lenis from 'lenis'; // smooth scroll

// registro el plugin para poder usar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface UseLenisGsaParams {
	wrapperRef: RefObject<HTMLDivElement | null>; // div que hace el scroll de verdad
	contentRef: RefObject<HTMLDivElement | null>; // contenido que esta dentro del wrapper
	stackRef: RefObject<HTMLDivElement | null>; // bloque donde estan las secciones apiladas
}

export function useLenisGsaEffect({
	wrapperRef,
	contentRef,
	stackRef,
}: UseLenisGsaParams) {
	// este hook monta todo el efecto del stack y lo limpia al desmontar
	useEffect(() => {
		// si falta algun ref, no sigo pq en el primer render puede que aun no exista el dom
		if (!wrapperRef.current || !contentRef.current || !stackRef.current)
			return;

		const wrapper = wrapperRef.current; // contenedor que realmente scrollea
		const content = contentRef.current; // contenido interno
		const stack = stackRef.current; // bloque principal del stack

		const lenis = new Lenis({
			wrapper: wrapper,
			content: content, // importante: asi lenis usa este wrapper y no window
			autoRaf: false, // en false pq el raf lo controlo yo abajo manualmente
			smoothWheel: true, // si lo quito, la rueda va mas seca y menos suave
			duration: 1.18, // si sube, va mas cinematografico pero mas lento; si baja responde antes
			easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // curva del movimiento; si la cambias cambia mucho la sensacion
		});
		// conecto lenis con scrolltrigger para que ambos vayan a la vez
		const updateScroll = () => {
			ScrollTrigger.update(); // cada vez que lenis mueve scroll, gsap recalcula triggers y progreso
		};
		lenis.on('scroll', updateScroll);
		let rafId = 0; // guardo el id para poder parar el loop al desmontar
		const raf = (time: number) => {
			lenis.raf(time); // aqui lenis actualiza la posicion smooth en cada frame
			rafId = requestAnimationFrame(raf);
		};
		rafId = requestAnimationFrame(raf); // arranco el bucle; si esto no corre, no hay smooth scroll
		// meto todo gsap aqui dentro para luego limpiarlo facil con ctx.revert()
		const ctx = gsap.context(() => {
			ScrollTrigger.defaults({
				scroller: wrapper, // importante: todos los triggers de aqui usan este wrapper y no window
			});

			const sections = gsap.utils.toArray<HTMLElement>('.stack-section'); // saco todas las capas completas del stack

			const panels = sections.map((section) => {
				const panel = section.querySelector<HTMLElement>('.stack-panel'); // intento sacar la tarjeta visual de dentro
				if (panel)
					return panel;
				return section; // si no hay .stack-panel, uso la section entera para no romper el efecto
			});
			// aqui preparo cada section al inicio
			sections.forEach((section, i) => {
				gsap.set(section, {
					position: 'absolute',
					inset: 0, // top right bottom left a 0 para que todas ocupen el mismo sitio
					zIndex: i + 1, // orden visual de las capas
					yPercent: i === 0 ? 0 : 110, // menos la primera, las demas empiezan mas abajo
					autoAlpha: i === 0 ? 1 : 0.12, // las que aun no entran casi no se ven
				});
			});
			// aqui preparo cada panel al inicio
			panels.forEach((panel, i) => {
				gsap.set(panel, {
					scale: i === 0 ? 1 : 0.64, // los del fondo se ven mas pequeños para dar profundidad
					autoAlpha: 1, // visibles, aunque luego la timeline ya controla mejor esto
				});
			});

			gsap.set(stack, {
				position: 'relative',
				height: 'calc(100vh - 88px)', // esta es la ventana visible del stack; 88px es la navbar actual
				overflow: 'hidden', // si lo quito, se pueden ver cosas fuera durante la transicion
			});

			let steps = panels.length - 1; // si hay 3 paneles, hay 2 pasos grandes de cambio
			if (steps < 1)
				steps = 1; // minimo 1 para que el end no se quede en 0
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: stack, // este bloque activa todo el stack
					start: 'top top', // empieza cuando el top del stack toca arriba del wrapper
					end: `+=${steps * 115}%`, // cuanto dura el efecto; si sube tarda mas en pasar cada panel
					pin: true, // fija el stack mientras dura la timeline
					pinSpacing: true, // deja espacio despues; si false suele romper la salida al footer
					scrub: 1.25, // une animacion al scroll; si sube se siente mas suave
					anticipatePin: 1, // ayuda a que no pegue un salto raro al empezar el pin
				},
			});
			let i = 1; // empiezo en 1 pq la primera capa ya arranca visible
			while (i < sections.length) {
				const currentSection = sections[i];
				const prevPanel = panels[i - 1];
				const currentPanel = panels[i];
				// aqui hago que el panel anterior se quede mas pequeño y mas apagado
				tl.to(prevPanel, {
					scale: 0.93, // cuanto se "aleja" el panel anterior
					autoAlpha: 0.65, // cuanto se apaga el panel anterior
					duration: 1,
					ease: 'power2.inOut',
				}, i - 1);

				// aqui sube la nueva capa desde abajo hasta ponerse arriba
				tl.to(currentSection, {
					yPercent: 0, // pasa de abajo a su posicion final
					autoAlpha: 1, // queda totalmente visible
					duration: 1,
					ease: 'power2.inOut',
				}, i - 1);

				// aqui el panel nuevo vuelve a tamaño normal para quedar como activo
				tl.to(currentPanel, {
					scale: 1,
					autoAlpha: 1,
					duration: 1,
					ease: 'power2.inOut',
				}, i - 1);
				i++;
			}
			// esta animacion es aparte del stack principal
			// solo la uso para las cards del bloque meet creators
			gsap.from('.creator-card', {
				opacity: 0, // empiezan invisibles
				y: 22, // empiezan un poco mas abajo
				scale: 0.96, // empiezan un poco mas pequeñas
				duration: 0.7, // cuanto tarda cada una en entrar
				ease: 'power2.out',
				stagger: 0.1, // entran una detras de otra
				scrollTrigger: {
					trigger: '.stack-section:last-child', // se dispara al llegar a la ultima section
					start: 'top center', // cuando la ultima section llega al centro del viewport
					once: true, // true = solo una vez; false = reanima al subir y bajar
				},
			});
		}, content);

		// hago refresh al cambiar tamaño de pantalla para recalcular medidas
		const handleResize = () => {
			ScrollTrigger.refresh(); // recalcula pin, start, end y tamaños
		};

		window.addEventListener('resize', handleResize);

		return () => {
			// limpieza completa para no dejar listeners, raf o triggers vivos
			window.removeEventListener('resize', handleResize); // quito resize global
			cancelAnimationFrame(rafId); // paro el loop manual
			lenis.off('scroll', updateScroll); // desconecto lenis de scrolltrigger
			ctx.revert(); // borra triggers y estilos metidos dentro del contexto gsap
			lenis.destroy(); // destruye lenis y libera recursos
		};
	}, [wrapperRef, contentRef, stackRef]); // si cambia algun ref, se vuelve a montar todo
}