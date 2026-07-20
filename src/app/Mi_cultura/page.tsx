"use client";

import React, { useState, useEffect } from "react";
import { ContentItem, RecommendationItem } from "@/lib/db";
import {
  getCultureContent,
  getRecommendationsList,
  addRecommendationAction
} from "./actions";
import "./cultura.css";

const TABS = [
  { id: "pelicula", label: "Películas" },
  { id: "serie", label: "serie" },
  { id: "anime", label: "anime" },
  { id: "libro", label: "Libros" }
];

export default function MiCultura() {
  const [activeTab, setActiveTab] = useState<string>("pelicula");
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingContent, setLoadingContent] = useState<boolean>(true);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  
  // Form State
  const [formType, setFormType] = useState<string>("pelicula");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formComment, setFormComment] = useState<string>("");
  const [formMsg, setFormMsg] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: ""
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load content when tab changes
  useEffect(() => {
    let active = true;
    async function loadContent() {
      setLoadingContent(true);
      const data = await getCultureContent(activeTab);
      if (active) {
        setContentList(data);
        setLoadingContent(false);
      }
    }
    loadContent();
    return () => {
      active = false;
    };
  }, [activeTab]);

  // Load recommendations on mount
  useEffect(() => {
    async function loadRecommendations() {
      const data = await getRecommendationsList();
      setRecommendations(data);
    }
    loadRecommendations();
  }, []);

  // Form submission handler
  async function handleAddRecommendation(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formComment.trim()) {
      setFormMsg({ text: "Todos los campos son obligatorios.", type: "error" });
      return;
    }

    if (recommendations.length >= 10) {
      setFormMsg({ text: "No se pueden añadir más recomendaciones (Límite: 10).", type: "error" });
      return;
    }

    setSubmitting(true);
    setFormMsg({ text: "", type: "" });

    const result = await addRecommendationAction(formType, formTitle, formComment);

    setSubmitting(false);

    if (result.success) {
      setFormMsg({ text: "¡Recomendación enviada con éxito!", type: "success" });
      setFormTitle("");
      setFormComment("");
      
      // Reload recommendations list
      const updatedList = await getRecommendationsList();
      setRecommendations(updatedList);
    } else {
      setFormMsg({ text: result.error || "Ocurrió un error inesperado.", type: "error" });
    }
  }

  // Format CSS class helper for status
  function getStatusClass(status: string | null) {
    if (!status) return "pendiente";
    const clean = status.toLowerCase().trim().replace(/\s+/g, "_");
    if (clean === "vista" || clean === "visto") return "vista";
    if (clean === "pendiente") return "pendiente";
    if (clean === "en_emision" || clean === "emision" || clean === "en emision") return "en_emision";
    if (clean === "abandonada" || clean === "abandonado") return "abandonada";
    return "pendiente";
  }

  return (
    <div className="cultura-body min-h-screen">
      <div className="cultura-container">
        
        <header className="cultura-header">
          <div className="cultura-title-wrapper">
            <h1 className="cultura-title">
              Mi Archivo
              <span>Incompleta = Faltan temporadas | Sin Terminar = No me la he visto entera</span>
            </h1>
          </div>
        </header>

        <div className="cultura-layout">
          <main className="content-side">
            
            {/* Tabs */}
            <nav className="cultura-nav" aria-label="Menú de categorías">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`cultura-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Listado */}
            <div className="list-container">
              {loadingContent ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  Cargando elementos...
                </div>
              ) : contentList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  No hay elementos de este tipo en la lista.
                </div>
              ) : (
                <div className="list-wrapper">
                  {contentList.map((item) => (
                    <div
                      key={item.id}
                      className="cultura-item-row"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="item-left">
                        <span className="item-rating">{item.rating || "-"}</span>
                        <span className="item-title">{item.title}</span>
                      </div>
                      
                      <div className="item-right">
                        <span className={`status-badge ${getStatusClass(item.status)}`}>
                          {item.status || "pendiente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          <aside className="recommendations-panel">
            <h2 className="panel-title">
              Recomendaciones
              <span>{recommendations.length} / 10</span>
            </h2>

            <div className="rec-list">
              {recommendations.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "1rem" }}>
                  Aún no hay recomendaciones de usuarios. ¡Sé el primero!
                </p>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.id} className="rec-card">
                    <div className="rec-header">
                      <span className="rec-title">{rec.content_title}</span>
                      <span className="rec-type">{rec.content_type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form className="rec-form" onSubmit={handleAddRecommendation}>
              <h3 style={{ fontSize: "1rem", color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Recomiéndame algo
              </h3>
              
              <div className="form-group">
                <label htmlFor="rec-type">Tipo</label>
                <select
                  id="rec-type"
                  className="form-select"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  <option value="pelicula">Película</option>
                  <option value="serie">Serie</option>
                  <option value="anime">Anime</option>
                  <option value="libro">Libro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rec-title">Título</label>
                <input
                  type="text"
                  id="rec-title"
                  className="form-input"
                  placeholder="Ej. El padrino"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="rec-comment">Comentario / Por qué</label>
                <textarea
                  id="rec-comment"
                  className="form-textarea"
                  placeholder="Por qué debería verlo/leerlo..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  maxLength={300}
                />
              </div>

              {formMsg.text && (
                <div className={`form-msg ${formMsg.type}`}>
                  {formMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={submitting || recommendations.length >= 10}
              >
                {submitting ? "Enviando..." : "Enviar recomendación"}
              </button>
            </form>
          </aside>

        </div>

        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setSelectedItem(null)}>
                ×
              </button>
              
              <div className="modal-title-area">
                <h2 className="modal-title">{selectedItem.title}</h2>
                <div className="modal-meta">
                  <span className="item-rating">{selectedItem.rating || "-"}</span>
                  <span className={`status-badge ${getStatusClass(selectedItem.status)}`}>
                    {selectedItem.status || "pendiente"}
                  </span>
                  <span style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--accent-blue)", fontWeight: "bold" }}>
                    {selectedItem.type}
                  </span>
                </div>
              </div>

              {selectedItem.description && (
                <div className="modal-body-section">
                  <h3 className="modal-section-title">Descripción</h3>
                  <p>{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.notes && (
                <div className="modal-body-section">
                  <h3 className="modal-section-title">Mis notas / Comentario personal</h3>
                  <p style={{ fontStyle: "italic", borderLeft: "2px solid var(--accent-gold)", paddingLeft: "0.8rem" }}>
                    "{selectedItem.notes}"
                  </p>
                </div>
              )}

              {!selectedItem.description && !selectedItem.notes && (
                <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                  No hay detalles adicionales ni comentarios guardados para este elemento.
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
