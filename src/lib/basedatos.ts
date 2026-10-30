import { neon } from "@neondatabase/serverless";

// URL de la base de datos (si no está, se usan datos de prueba)
const urlBaseDatos = process.env.DATABASE_URL;

export const hayConexionBd = !!urlBaseDatos;

// Cliente HTTP de Neon Serverless
const clienteSql = urlBaseDatos ? neon(urlBaseDatos) : null;

// Los nombres de los campos son los de las columnas de la base de datos
export interface ElementoContenido {
  id: number;
  type: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  status: string;
  rating: number;
  notes: string | null;
}

export interface Recomendacion {
  id: number;
  content_type: string;
  content_title: string;
  comment: string | null;
}

// Datos de prueba para trabajar en local o compilar sin URL de base de datos
const contenidoPrueba: ElementoContenido[] = [
  {
    id: 1,
    type: "pelicula test",
    title: "Inception",
    description: "Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños, se le da la tarea inversa de plantar una idea en la mente de un CEO.",
    poster_url: null,
    status: "vista",
    rating: 10,
    notes: "Increíble película, la banda sonora de Hans Zimmer es espectacular."
  },
  {
    id: 2,
    type: "serie",
    title: "Breaking test",
    description: "Un profesor de química de secundaria diagnosticado con cáncer de pulmón inoperable se asocia con un exalumno para asegurar el futuro de su familia fabricando y vendiendo metanfetamina.",
    poster_url: null,
    status: "vista",
    rating: 10,
    notes: "La mejor serie de la historia. El desarrollo de Walter White es inigualable."
  }
];

const recomendacionesPrueba: Recomendacion[] = [
  {
    id: 1,
    content_type: "pelicula",
    content_title: "The Prestige tes",
    comment: "Te encantará si te gustó Inception. Es del mismo director."
  }
];

function obtenerAliasTipo(tipo: string): string[] {
  const tipoLimpio = tipo.toLowerCase().trim();
  if (tipoLimpio === "serie" || tipoLimpio === "series") return ["serie", "series"];
  if (tipoLimpio === "pelicula" || tipoLimpio === "peliculas" || tipoLimpio === "película" || tipoLimpio === "películas") {
    return ["pelicula", "peliculas", "película", "películas"];
  }
  if (tipoLimpio === "anime" || tipoLimpio === "animes") return ["anime", "animes"];
  if (tipoLimpio === "libro" || tipoLimpio === "libros") return ["libro", "libros"];
  return [tipoLimpio];
}

export async function obtenerContenidoPorTipo(tipo: string): Promise<ElementoContenido[]> {
  const alias = obtenerAliasTipo(tipo);
  if (clienteSql) {
    try {
      const resultado = await clienteSql`SELECT * FROM content WHERE LOWER(type) = ANY(${alias}) ORDER BY rating DESC, title ASC`;
      return resultado as unknown as ElementoContenido[];
    } catch (e) {
      console.error("Error fetching content from Neon, returning mock data:", e);
      return contenidoPrueba.filter(elemento => alias.includes(elemento.type.toLowerCase()));
    }
  } else {
    // Sin cadena de conexión: devolvemos los datos de prueba
    return contenidoPrueba.filter(elemento => alias.includes(elemento.type.toLowerCase()));
  }
}

export async function obtenerRecomendaciones(): Promise<Recomendacion[]> {
  if (clienteSql) {
    try {
      const resultado = await clienteSql`SELECT * FROM recommendations ORDER BY id DESC`;
      return resultado as unknown as Recomendacion[];
    } catch (e) {
      console.error("Error fetching recommendations from Neon, returning mock data:", e);
      return recomendacionesPrueba;
    }
  } else {
    return recomendacionesPrueba;
  }
}

export async function insertarRecomendacion(
  tipoContenido: string,
  tituloContenido: string,
  comentario: string
): Promise<{ exito: boolean; error?: string }> {
  if (clienteSql) {
    try {
      // Comprobar cuántas hay ya
      const resultadoConteo = await clienteSql`SELECT COUNT(*) as count FROM recommendations`;
      const total = parseInt((resultadoConteo[0] as any).count);

      if (total >= 10) {
        return { exito: false, error: "Límite de 10 recomendaciones alcanzado." };
      }

      await clienteSql`INSERT INTO recommendations (content_type, content_title, comment) VALUES (${tipoContenido}, ${tituloContenido}, ${comentario})`;

      return { exito: true };
    } catch (e: any) {
      console.error("Error inserting recommendation:", e);
      return { exito: false, error: e.message || "Error al insertar en la base de datos." };
    }
  } else {
    // Simulación en memoria para compilar o hacer demos
    if (recomendacionesPrueba.length >= 10) {
      return { exito: false, error: "Límite de 10 recomendaciones alcanzado." };
    }

    recomendacionesPrueba.unshift({
      id: Date.now(),
      content_type: tipoContenido,
      content_title: tituloContenido,
      comment: comentario
    });

    return { exito: true };
  }
}
