"use client";

import { useState, type ReactNode } from "react";

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

      <div className="cosmere-desplazable">
        <div hidden={orden !== "lectura"}>{lectura}</div>
        <div hidden={orden !== "publicacion"}>{publicacion}</div>
      </div>
    </>
  );
}
