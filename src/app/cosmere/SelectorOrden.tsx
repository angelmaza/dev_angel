"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

interface Etiquetas {
  grupo: string;
  lectura: string;
  publicacion: string;
}

// Selector bajo el título para cambiar entre orden de lectura y de publicación.
// Las dos vistas llegan ya renderizadas desde el servidor; aquí solo se elige cuál se ve.
export default function SelectorOrden({
  etiquetas, lectura, publicacion,
}: { etiquetas: Etiquetas; lectura: ReactNode; publicacion: ReactNode }) {
  const [orden, setOrden] = useState<"lectura" | "publicacion">("lectura");
  const contenedor = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLDivElement>(null);

  usePellizco(contenedor, lienzo);

  return (
    <>
      <div className="cosmere-selector" role="group" aria-label={etiquetas.grupo}>
        <span className={`cosmere-selector-marca ${orden === "publicacion" ? "a-la-derecha" : ""}`} aria-hidden="true" />
        <button type="button" aria-pressed={orden === "lectura"} onClick={() => setOrden("lectura")}>
          {etiquetas.lectura}
        </button>
        <button type="button" aria-pressed={orden === "publicacion"} onClick={() => setOrden("publicacion")}>
          {etiquetas.publicacion}
        </button>
      </div>

      <div className="cosmere-desplazable" ref={contenedor}>
        <div ref={lienzo}>
          <div hidden={orden !== "lectura"}>{lectura}</div>
          <div hidden={orden !== "publicacion"}>{publicacion}</div>
        </div>
      </div>
    </>
  );
}

// Pellizcar con dos dedos dentro del recuadro aleja o acerca el mapa (no la página).
// Como mucho se aleja hasta que el mapa cabe entero de ancho; como mucho se acerca a su tamaño normal.
// Solo actúa cuando el mapa no cabe (móvil); en escritorio no hace nada.
// (Se llama "use…" porque React exige ese prefijo a los hooks.)
function usePellizco(
  contenedor: RefObject<HTMLDivElement | null>,
  lienzo: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const caja = contenedor.current;
    const contenido = lienzo.current;
    if (!caja || !contenido) return;

    let escala = 1;
    let inicio: { distancia: number; escala: number; medioX: number; medioY: number; scrollX: number; scrollY: number; cajaY: number } | null = null;

    // Escala mínima: la que hace que el mapa quepa entero en el ancho del recuadro
    const escalaMinima = () => {
      const anchoNormal = caja.scrollWidth / escala;
      return Math.min(1, caja.clientWidth / anchoNormal);
    };

    const distancia = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const alEmpezar = (e: TouchEvent) => {
      if (e.touches.length !== 2 || escalaMinima() >= 1) return;
      const rect = caja.getBoundingClientRect();
      inicio = {
        distancia: distancia(e.touches),
        escala,
        medioX: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
        medioY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        scrollX: caja.scrollLeft,
        scrollY: window.scrollY,
        cajaY: rect.top,
      };
    };

    const alMover = (e: TouchEvent) => {
      if (!inicio || e.touches.length !== 2) return;
      e.preventDefault();
      const nueva = Math.min(1, Math.max(escalaMinima(), (inicio.escala * distancia(e.touches)) / inicio.distancia));
      const factor = nueva / inicio.escala;
      escala = nueva;
      contenido.style.zoom = String(nueva);
      // Mantener bajo los dedos el mismo punto del mapa
      caja.scrollLeft = (inicio.scrollX + inicio.medioX) * factor - inicio.medioX;
      const yEnMapa = inicio.medioY - inicio.cajaY;
      window.scrollTo({ top: inicio.scrollY + yEnMapa * (factor - 1) });
    };

    const alTerminar = (e: TouchEvent) => {
      if (e.touches.length < 2) inicio = null;
    };

    // Safari (iPhone) usa sus propios eventos de gesto para el zoom de la página: se cancelan dentro del recuadro
    const cancelarGesto = (e: Event) => {
      if (escalaMinima() < 1) e.preventDefault();
    };

    caja.addEventListener("touchstart", alEmpezar, { passive: true });
    caja.addEventListener("touchmove", alMover, { passive: false });
    caja.addEventListener("touchend", alTerminar);
    caja.addEventListener("touchcancel", alTerminar);
    caja.addEventListener("gesturestart", cancelarGesto);
    caja.addEventListener("gesturechange", cancelarGesto);

    return () => {
      caja.removeEventListener("touchstart", alEmpezar);
      caja.removeEventListener("touchmove", alMover);
      caja.removeEventListener("touchend", alTerminar);
      caja.removeEventListener("touchcancel", alTerminar);
      caja.removeEventListener("gesturestart", cancelarGesto);
      caja.removeEventListener("gesturechange", cancelarGesto);
    };
  }, [contenedor, lienzo]);
}
