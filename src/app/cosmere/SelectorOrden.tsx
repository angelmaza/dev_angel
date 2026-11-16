"use client";

import { useState, type ReactNode } from "react";

// Botones arriba a la derecha para cambiar entre orden de lectura y de publicación.
// Las dos vistas llegan ya renderizadas desde el servidor; aquí solo se elige cuál se ve.
export default function SelectorOrden({ lectura, publicacion }: { lectura: ReactNode; publicacion: ReactNode }) {
  const [orden, setOrden] = useState<"lectura" | "publicacion">("lectura");

  return (
    <>
      <div className="cosmere-selector" role="group" aria-label="Ordenar libros">
        <button type="button" aria-pressed={orden === "lectura"} onClick={() => setOrden("lectura")}>
          Orden de lectura
        </button>
        <button type="button" aria-pressed={orden === "publicacion"} onClick={() => setOrden("publicacion")}>
          Orden de publicación
        </button>
      </div>

      <div hidden={orden !== "lectura"}>{lectura}</div>
      <div hidden={orden !== "publicacion"}>{publicacion}</div>
    </>
  );
}
