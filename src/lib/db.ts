import { neon } from "@neondatabase/serverless";

// Helper to check if database URL is set
const databaseUrl = process.env.DATABASE_URL;

export const isDbConnected = !!databaseUrl;

// HTTP client for Neon Serverless
const sqlClient = databaseUrl ? neon(databaseUrl) : null;

export interface ContentItem {
  id: number;
  type: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  status: string;
  rating: number;
  notes: string | null;
}

export interface RecommendationItem {
  id: number;
  content_type: string;
  content_title: string;
  comment: string | null;
}

// Fallback Mock Data for local testing/build without DB URL
const mockContent: ContentItem[] = [
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

const mockRecommendations: RecommendationItem[] = [
  {
    id: 1,
    content_type: "pelicula",
    content_title: "The Prestige tes",
    comment: "Te encantará si te gustó Inception. Es del mismo director."
  }
];

function getTypeAliases(type: string): string[] {
  const t = type.toLowerCase().trim();
  if (t === "serie" || t === "series") return ["serie", "series"];
  if (t === "pelicula" || t === "peliculas" || t === "película" || t === "películas") {
    return ["pelicula", "peliculas", "película", "películas"];
  }
  if (t === "anime" || t === "animes") return ["anime", "animes"];
  if (t === "libro" || t === "libros") return ["libro", "libros"];
  return [t];
}

export async function fetchContentByType(type: string): Promise<ContentItem[]> {
  const aliases = getTypeAliases(type);
  if (sqlClient) {
    try {
      const result = await sqlClient`SELECT * FROM content WHERE LOWER(type) = ANY(${aliases}) ORDER BY rating DESC, title ASC`;
      return result as unknown as ContentItem[];
    } catch (e) {
      console.error("Error fetching content from Neon, returning mock data:", e);
      return mockContent.filter(item => aliases.includes(item.type.toLowerCase()));
    }
  } else {
    // Return Mock Data if no connection string is provided
    return mockContent.filter(item => aliases.includes(item.type.toLowerCase()));
  }
}

export async function fetchRecommendations(): Promise<RecommendationItem[]> {
  if (sqlClient) {
    try {
      const result = await sqlClient`SELECT * FROM recommendations ORDER BY id DESC`;
      return result as unknown as RecommendationItem[];
    } catch (e) {
      console.error("Error fetching recommendations from Neon, returning mock data:", e);
      return mockRecommendations;
    }
  } else {
    return mockRecommendations;
  }
}

export async function insertRecommendation(
  contentType: string,
  contentTitle: string,
  comment: string
): Promise<{ success: boolean; error?: string }> {
  if (sqlClient) {
    try {
      // Check current count
      const countResult = await sqlClient`SELECT COUNT(*) as count FROM recommendations`;
      const count = parseInt((countResult[0] as any).count);
      
      if (count >= 10) {
        return { success: false, error: "Límite de 10 recomendaciones alcanzado." };
      }
      
      await sqlClient`INSERT INTO recommendations (content_type, content_title, comment) VALUES (${contentType}, ${contentTitle}, ${comment})`;
      
      return { success: true };
    } catch (e: any) {
      console.error("Error inserting recommendation:", e);
      return { success: false, error: e.message || "Error al insertar en la base de datos." };
    }
  } else {
    // Local memory simulation for build/demo
    if (mockRecommendations.length >= 10) {
      return { success: false, error: "Límite de 10 recomendaciones alcanzado." };
    }
    
    mockRecommendations.unshift({
      id: Date.now(),
      content_type: contentType,
      content_title: contentTitle,
      comment: comment
    });
    
    return { success: true };
  }
}
