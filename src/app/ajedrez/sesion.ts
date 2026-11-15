import { cookies } from "next/headers";

// Acceso sencillo al panel: usuario y contraseña fijos y una cookie.
// No es seguridad real; basta para que la vista pública no se pueda editar.
export const USUARIO_ADMIN = "admin";
export const CLAVE_ADMIN = "jaque";

export const NOMBRE_COOKIE = "ajedrez_sesion";
export const VALOR_COOKIE = "ok-torneo-ajedrez";

export async function haySesion(): Promise<boolean> {
  const almacen = await cookies();
  return almacen.get(NOMBRE_COOKIE)?.value === VALOR_COOKIE;
}
