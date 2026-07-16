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
    type: "pelicula",
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
    title: "Breaking Bad",
    description: "Un profesor de química de secundaria diagnosticado con cáncer de pulmón inoperable se asocia con un exalumno para asegurar el futuro de su familia fabricando y vendiendo metanfetamina.",
    poster_url: null,
    status: "vista",
    rating: 10,
    notes: "La mejor serie de la historia. El desarrollo de Walter White es inigualable."
  },
  {
    id: 3,
    type: "anime",
    title: "Shingeki no Kyojin",
    description: "Después de que su ciudad natal es destruida y su madre es asesinada, el joven Eren Jaeger se compromete a limpiar la Tierra de los gigantescos Titanes humanoides que han llevado a la humanidad al borde de la extinción.",
    poster_url: null,
    status: "en emision",
    rating: 9,
    notes: "Giros argumentales increíbles."
  },
  {
    id: 4,
    type: "libro",
    title: "Cien años de soledad",
    description: "La novela narra la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.",
    poster_url: null,
    status: "pendiente",
    rating: 8,
    notes: "Tengo pendiente terminarlo, pero el estilo de García Márquez es pura magia."
  },
  {
    id: 5,
    type: "pelicula",
    title: "Interstellar",
    description: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por asegurar la supervivencia de la humanidad.",
    poster_url: null,
    status: "vista",
    rating: 10,
    notes: "Visualmente perfecta y muy emotiva."
  },
  {
    id: 6,
    type: "anime",
    title: "Monster",
    description: "Un brillante neurocirujano japonés se ve envuelto en una red de misterio y asesinatos tras salvar la vida de un niño que resulta ser un psicópata carismático.",
    poster_url: null,
    status: "abandonada",
    rating: 7,
    notes: "Lenta al principio, tal vez le dé otra oportunidad."
  }
];

const mockRecommendations: RecommendationItem[] = [
  {
    id: 1,
    content_type: "pelicula",
    content_title: "The Prestige",
    comment: "Te encantará si te gustó Inception. Es del mismo director."
  },
  {
    id: 2,
    content_type: "serie",
    content_title: "Better Call Saul",
    comment: "Spin-off a la altura de Breaking Bad."
  }
];

export async function fetchContentByType(type: string): Promise<ContentItem[]> {
  if (sqlClient) {
    try {
      const result = await sqlClient`SELECT * FROM content WHERE LOWER(type) = LOWER(${type}) ORDER BY rating DESC, title ASC`;
      return result as unknown as ContentItem[];
    } catch (e) {
      console.error("Error fetching content from Neon, returning mock data:", e);
      return mockContent.filter(item => item.type.toLowerCase() === type.toLowerCase());
    }
  } else {
    // Return Mock Data if no connection string is provided
    return mockContent.filter(item => item.type.toLowerCase() === type.toLowerCase());
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
