"use server";

import {
  obtenerContenidoPorTipo,
  obtenerRecomendaciones,
  insertarRecomendacion,
  ElementoContenido,
  Recomendacion
} from "@/lib/basedatos";

export async function obtenerContenidoCultura(tipo: string): Promise<ElementoContenido[]> {
  try {
    return await obtenerContenidoPorTipo(tipo);
  } catch (e) {
    console.error("obtenerContenidoCultura server action error:", e);
    return [];
  }
}

export async function obtenerListaRecomendaciones(): Promise<Recomendacion[]> {
  try {
    return await obtenerRecomendaciones();
  } catch (e) {
    console.error("obtenerListaRecomendaciones server action error:", e);
    return [];
  }
}

export async function agregarRecomendacion(
  tipoContenido: string,
  tituloContenido: string,
  comentario: string
): Promise<{ exito: boolean; error?: string }> {
  try {
    if (!tipoContenido || !tituloContenido || !comentario) {
      return { exito: false, error: "Todos los campos son obligatorios." };
    }

    return await insertarRecomendacion(tipoContenido, tituloContenido, comentario);
  } catch (e: any) {
    console.error("agregarRecomendacion server action error:", e);
    return { exito: false, error: e.message || "Error al añadir la recomendación." };
  }
}
