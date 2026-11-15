"use client";

import { useActionState } from "react";
import { iniciarSesion } from "../acciones";

export default function FormularioAcceso() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, { error: "" });

  return (
    <form action={accion} className="formulario-acceso">
      <label>
        Usuario
        <input name="usuario" autoComplete="username" required />
      </label>
      <label>
        Contraseña
        <input name="clave" type="password" autoComplete="current-password" required />
      </label>
      {estado.error && <p className="error">{estado.error}</p>}
      <button type="submit" className="boton-ajedrez" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
