// Datos de la guía de lectura del Cosmere.
//
// Para añadir un libro: añade una línea en LIBROS con
//   - titulo y tituloEn: título en español y en inglés
//   - sistema: el id de uno de SISTEMAS
//   - fase:    el id de una de FASES
//   - fila:    la fila dentro de esa fase (1, 2, 3…). Libros de sistemas distintos
//              en la misma fila salen a la misma altura (se pueden leer en paralelo).
//   - publicado: "AAAA-MM" de la primera edición (sin él, el libro no sale
//              en el orden de publicación).
// Para un sistema nuevo, añádelo a SISTEMAS; su columna aparece sola.

export interface Sistema {
  id: string;
  nombre: string;
  planeta: string;
  // Nombres en inglés (si no se indican, se usan los de español)
  nombreEn?: string;
  planetaEn?: string;
  color: string;
  // La saga sigue abierta: su línea continúa (punteada) hasta el final
  continua?: boolean;
}

export interface Fase {
  id: string;
  nombre: string;
  nombreEn: string;
}

export interface Libro {
  titulo: string;
  // Título original en inglés
  tituloEn: string;
  sistema: string;
  fase: string;
  fila: number;
  // Primera publicación (original en inglés), "AAAA-MM" (o "AAAA-MM-DD" para desempatar). Ordena la vista por publicación
  publicado?: string;
  // Lugar alternativo donde también se puede leer (se dibuja con círculo punteado)
  alternativa?: boolean;
  nota?: string;
  notaEn?: string;
}

export const SISTEMAS: Sistema[] = [
  { id: "sel", nombre: "Sel", planeta: "Sel", color: "#f6c945" },
  { id: "scadrial", nombre: "Scadrial", planeta: "Scadrial", color: "#f39223", continua: true },
  { id: "nalthis", nombre: "Nalthis", planeta: "Nalthis", color: "#8cc63f" },
  { id: "roshar", nombre: "Roshar", planeta: "Roshar", color: "#5d9de0", continua: true },
  { id: "drominad", nombre: "Drominad", planeta: "Primero del Sol", planetaEn: "First of the Sun", color: "#4a5cc4" },
  { id: "treno", nombre: "Treno", planeta: "Treno", nombreEn: "Threnody", planetaEn: "Threnody", color: "#a39383" },
  { id: "lumar", nombre: "Lumar", planeta: "Lumar", color: "#1fae55" },
  { id: "komashi", nombre: "Komashi", planeta: "Komashi", color: "#b048bd" },
  { id: "cantico", nombre: "Cántico", planeta: "Cántico", nombreEn: "Canticle", planetaEn: "Canticle", color: "#e0393f" },
  { id: "diciembre", nombre: "Desconocido", planeta: "¿Sin nombre?", nombreEn: "Unknown", planetaEn: "Unnamed?", color: "#e8dcc0" },
];

export const FASES: Fase[] = [
  { id: "fase1", nombre: "Fase 1", nombreEn: "Phase 1" },
  { id: "interludio1", nombre: "Interludio 1", nombreEn: "Interlude 1" },
  { id: "fase2", nombre: "Fase 2", nombreEn: "Phase 2" },
  { id: "interludio2", nombre: "Interludio 2", nombreEn: "Interlude 2" },
  { id: "fase3", nombre: "Fase 3", nombreEn: "Phase 3" },
];

export const LIBROS: Libro[] = [
  // Fase 1
  { titulo: "Elantris", tituloEn: "Elantris", publicado: "2005-04", sistema: "sel", fase: "fase1", fila: 1 },
  { titulo: "El imperio final", tituloEn: "The Final Empire", publicado: "2006-07", sistema: "scadrial", fase: "fase1", fila: 1 },
  { titulo: "El aliento de los dioses", tituloEn: "Warbreaker", publicado: "2009-06", sistema: "nalthis", fase: "fase1", fila: 1 },
  { titulo: "El pozo de la ascensión", tituloEn: "The Well of Ascension", publicado: "2007-08", sistema: "scadrial", fase: "fase1", fila: 2 },
  { titulo: "El héroe de las eras", tituloEn: "The Hero of Ages", publicado: "2008-10", sistema: "scadrial", fase: "fase1", fila: 3 },
  { titulo: "Historia secreta", tituloEn: "Secret History", publicado: "2016-01-29", sistema: "scadrial", fase: "fase1", fila: 4, nota: "También puedes leerla al final de la Fase 2", notaEn: "You can also read it at the end of Phase 2" },

  // Interludio 1
  { titulo: "La esperanza de Elantris", tituloEn: "The Hope of Elantris", publicado: "2006-12", sistema: "sel", fase: "interludio1", fila: 1 },
  { titulo: "El undécimo metal", tituloEn: "The Eleventh Metal", publicado: "2011-12", sistema: "scadrial", fase: "interludio1", fila: 1 },
  { titulo: "Sexto del ocaso", tituloEn: "Sixth of the Dusk", publicado: "2014-11", sistema: "drominad", fase: "interludio1", fila: 1 },
  { titulo: "Sombras por silencio en los bosques del infierno", tituloEn: "Shadows for Silence in the Forests of Hell", publicado: "2013-12", sistema: "treno", fase: "interludio1", fila: 1 },
  { titulo: "El alma del emperador", tituloEn: "The Emperor's Soul", publicado: "2012-11", sistema: "sel", fase: "interludio1", fila: 2 },

  // Fase 2
  { titulo: "Aleación de ley", tituloEn: "The Alloy of Law", publicado: "2011-11", sistema: "scadrial", fase: "fase2", fila: 1 },
  { titulo: "El camino de los reyes", tituloEn: "The Way of Kings", publicado: "2010-08", sistema: "roshar", fase: "fase2", fila: 1 },
  { titulo: "Alomante Jak y los pozos de Eltania", tituloEn: "Allomancer Jak and the Pits of Eltania", publicado: "2014-08", sistema: "scadrial", fase: "fase2", fila: 2 },
  { titulo: "Palabras radiantes", tituloEn: "Words of Radiance", publicado: "2014-03", sistema: "roshar", fase: "fase2", fila: 2 },
  { titulo: "Sombras de identidad", tituloEn: "Shadows of Self", publicado: "2015-10", sistema: "scadrial", fase: "fase2", fila: 3 },
  { titulo: "Danzante del filo", tituloEn: "Edgedancer", publicado: "2016-11", sistema: "roshar", fase: "fase2", fila: 3 },
  { titulo: "Brazales de duelo", tituloEn: "The Bands of Mourning", publicado: "2016-01-26", sistema: "scadrial", fase: "fase2", fila: 4 },
  { titulo: "Juramentada", tituloEn: "Oathbringer", publicado: "2017-11", sistema: "roshar", fase: "fase2", fila: 4 },
  { titulo: "Historia secreta", tituloEn: "Secret History", sistema: "scadrial", fase: "fase2", fila: 5, alternativa: true, nota: "También puedes leerla en este punto", notaEn: "You can also read it at this point" },
  { titulo: "Esquirla del amanecer", tituloEn: "Dawnshard", publicado: "2020-11-06", sistema: "roshar", fase: "fase2", fila: 5 },
  { titulo: "El ritmo de la guerra", tituloEn: "Rhythm of War", publicado: "2020-11-17", sistema: "roshar", fase: "fase2", fila: 6 },
  { titulo: "El metal perdido", tituloEn: "The Lost Metal", publicado: "2022-11", sistema: "scadrial", fase: "fase2", fila: 7 },

  // Interludio 2
  { titulo: "Trenza del mar Esmeralda", tituloEn: "Tress of the Emerald Sea", publicado: "2023-01", sistema: "lumar", fase: "interludio2", fila: 1 },
  { titulo: "Yumi y el pintor de pesadillas", tituloEn: "Yumi and the Nightmare Painter", publicado: "2023-07", sistema: "komashi", fase: "interludio2", fila: 1 },
  { titulo: "El hombre iluminado", tituloEn: "The Sunlit Man", publicado: "2023-10", sistema: "cantico", fase: "interludio2", fila: 1 },

  // Fase 3 (en proceso): añade aquí los nuevos libros
  { titulo: "Viento y verdad", tituloEn: "Wind and Truth", publicado: "2024-12", sistema: "roshar", fase: "fase3", fila: 1 },
  { titulo: "Islas de la Ascuaoscura", tituloEn: "Isles of the Emberdark", publicado: "2025-07", sistema: "drominad", fase: "fase3", fila: 2, nota: "Amplía la historia de Sexto del ocaso", notaEn: "Expands on the story of Sixth of the Dusk" },
  { titulo: "The Fires of December", tituloEn: "The Fires of December", publicado: "2026-12", sistema: "diciembre", fase: "fase3", fila: 3, nota: "Hoid's Travails. Aún sin título en español", notaEn: "Hoid's Travails" },
];
