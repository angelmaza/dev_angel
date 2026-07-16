"use server";

import {
  fetchContentByType,
  fetchRecommendations,
  insertRecommendation,
  ContentItem,
  RecommendationItem
} from "@/lib/db";

export async function getCultureContent(type: string): Promise<ContentItem[]> {
  try {
    return await fetchContentByType(type);
  } catch (e) {
    console.error("getCultureContent server action error:", e);
    return [];
  }
}

export async function getRecommendationsList(): Promise<RecommendationItem[]> {
  try {
    return await fetchRecommendations();
  } catch (e) {
    console.error("getRecommendationsList server action error:", e);
    return [];
  }
}

export async function addRecommendationAction(
  contentType: string,
  contentTitle: string,
  comment: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!contentType || !contentTitle || !comment) {
      return { success: false, error: "Todos los campos son obligatorios." };
    }
    
    return await insertRecommendation(contentType, contentTitle, comment);
  } catch (e: any) {
    console.error("addRecommendationAction server action error:", e);
    return { success: false, error: e.message || "Error al añadir la recomendación." };
  }
}
