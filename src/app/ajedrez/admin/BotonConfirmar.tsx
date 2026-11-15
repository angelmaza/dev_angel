"use client";

import type { ReactNode } from "react";

// Botón de envío que pide confirmación antes de una acción que borra datos
export default function BotonConfirmar({ mensaje, children }: { mensaje: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      className="boton-ajedrez boton-peligro"
      onClick={(evento) => {
        if (!window.confirm(mensaje)) evento.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
