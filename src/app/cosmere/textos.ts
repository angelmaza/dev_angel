import type { Fase, Libro, Sistema } from "./datos";

// Idiomas de la guía: inglés por defecto, español con ?lang=es
export type Idioma = "es" | "en";

export function leerIdioma(valor: string | string[] | undefined): Idioma {
  return valor === "es" ? "es" : "en";
}

export const TEXTOS = {
  es: {
    tituloPagina: "Cosmere · Guía de lectura",
    descripcion: "Libros del Cosmere de Brandon Sanderson por sistema y orden de lectura",
    titulo: "Cosmere: Guía de lectura",
    ordenarPor: "Ordenar libros",
    lectura: "Orden de lectura",
    publicacion: "Orden de publicación",
    idioma: "Idioma",
    sistema: (nombre: string) => `Sistema ${nombre}`,
    paginas: (n: number) => `≈ ${n.toLocaleString("es-ES")} páginas`,
  },
  en: {
    tituloPagina: "Cosmere · Reading Guide",
    descripcion: "Brandon Sanderson's Cosmere books by star system and reading order",
    titulo: "Cosmere: Reading Guide",
    ordenarPor: "Sort books",
    lectura: "Reading order",
    publicacion: "Publication order",
    idioma: "Language",
    sistema: (nombre: string) => `${nombre} System`,
    paginas: (n: number) => `≈ ${n.toLocaleString("en-US")} pages`,
  },
} as const;

export const tituloLibro = (libro: Libro, idioma: Idioma) => (idioma === "en" ? libro.tituloEn : libro.titulo);
export const notaLibro = (libro: Libro, idioma: Idioma) => (idioma === "en" ? libro.notaEn ?? libro.nota : libro.nota);
export const nombreFase = (fase: Fase, idioma: Idioma) => (idioma === "en" ? fase.nombreEn : fase.nombre);
export const nombreSistema = (sistema: Sistema, idioma: Idioma) => (idioma === "en" ? sistema.nombreEn ?? sistema.nombre : sistema.nombre);
export const nombrePlaneta = (sistema: Sistema, idioma: Idioma) => (idioma === "en" ? sistema.planetaEn ?? sistema.planeta : sistema.planeta);
