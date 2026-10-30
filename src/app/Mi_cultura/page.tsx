"use client";

import React, { useState, useEffect } from "react";
import { ElementoContenido, Recomendacion } from "@/lib/basedatos";
import {
  obtenerContenidoCultura,
  obtenerListaRecomendaciones,
  agregarRecomendacion
} from "./acciones";
import "./cultura.css";

const PESTANAS = [
  { id: "pelicula", etiqueta: "Películas" },
  { id: "serie", etiqueta: "serie" },
  { id: "anime", etiqueta: "anime" },
  { id: "libro", etiqueta: "Libros" }
];

export default function MiCultura() {
  const [pestanaActiva, setPestanaActiva] = useState<string>("pelicula");
  const [listaContenido, setListaContenido] = useState<ElementoContenido[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [cargandoContenido, setCargandoContenido] = useState<boolean>(true);
  
  // Estado del modal
  const [elementoSeleccionado, setElementoSeleccionado] = useState<ElementoContenido | null>(null);
  
  // Estado del formulario
  const [tipoFormulario, setTipoFormulario] = useState<string>("pelicula");
  const [tituloFormulario, setTituloFormulario] = useState<string>("");
  const [comentarioFormulario, setComentarioFormulario] = useState<string>("");
  const [mensajeFormulario, setMensajeFormulario] = useState<{ texto: string; tipo: "success" | "error" | "" }>({
    texto: "",
    tipo: ""
  });
  const [enviando, setEnviando] = useState<boolean>(false);

  // Cargar el contenido al cambiar de pestaña
  useEffect(() => {
    let activo = true;
    async function cargarContenido() {
      setCargandoContenido(true);
      const datos = await obtenerContenidoCultura(pestanaActiva);
      if (activo) {
        setListaContenido(datos);
        setCargandoContenido(false);
      }
    }
    cargarContenido();
    return () => {
      activo = false;
    };
  }, [pestanaActiva]);

  // Cargar las recomendaciones al montar
  useEffect(() => {
    async function cargarRecomendaciones() {
      const datos = await obtenerListaRecomendaciones();
      setRecomendaciones(datos);
    }
    cargarRecomendaciones();
  }, []);

  // Envío del formulario
  async function manejarEnvioRecomendacion(e: React.FormEvent) {
    e.preventDefault();
    if (!tituloFormulario.trim() || !comentarioFormulario.trim()) {
      setMensajeFormulario({ texto: "Todos los campos son obligatorios.", tipo: "error" });
      return;
    }

    if (recomendaciones.length >= 10) {
      setMensajeFormulario({ texto: "No se pueden añadir más recomendaciones (Límite: 10).", tipo: "error" });
      return;
    }

    setEnviando(true);
    setMensajeFormulario({ texto: "", tipo: "" });

    const resultado = await agregarRecomendacion(tipoFormulario, tituloFormulario, comentarioFormulario);

    setEnviando(false);

    if (resultado.exito) {
      setMensajeFormulario({ texto: "¡Recomendación enviada con éxito!", tipo: "success" });
      setTituloFormulario("");
      setComentarioFormulario("");
      
      // Recargar la lista de recomendaciones
      const listaActualizada = await obtenerListaRecomendaciones();
      setRecomendaciones(listaActualizada);
    } else {
      setMensajeFormulario({ texto: resultado.error || "Ocurrió un error inesperado.", tipo: "error" });
    }
  }

  // Clase CSS según el estado
  function obtenerClaseEstado(estado: string | null) {
    if (!estado) return "pendiente";
    const limpio = estado.toLowerCase().trim().replace(/\s+/g, "_");
    if (limpio === "vista" || limpio === "visto") return "vista";
    if (limpio === "pendiente") return "pendiente";
    if (limpio === "en_emision" || limpio === "emision" || limpio === "en emision") return "en_emision";
    if (limpio === "abandonada" || limpio === "abandonado") return "abandonada";
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
            
            {/* Pestañas */}
            <nav className="cultura-nav" aria-label="Menú de categorías">
              {PESTANAS.map((pestana) => (
                <button
                  key={pestana.id}
                  className={`cultura-tab ${pestanaActiva === pestana.id ? "active" : ""}`}
                  onClick={() => setPestanaActiva(pestana.id)}
                >
                  {pestana.etiqueta}
                </button>
              ))}
            </nav>

            {/* Listado */}
            <div className="list-container">
              {cargandoContenido ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--texto-apagado)" }}>
                  Cargando elementos...
                </div>
              ) : listaContenido.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--texto-apagado)" }}>
                  No hay elementos de este tipo en la lista.
                </div>
              ) : (
                <div className="list-wrapper">
                  {listaContenido.map((elemento) => (
                    <div
                      key={elemento.id}
                      className="cultura-item-row"
                      onClick={() => setElementoSeleccionado(elemento)}
                    >
                      <div className="item-left">
                        <span className="item-rating">{elemento.rating || "-"}</span>
                        <span className="item-title">{elemento.title}</span>
                      </div>
                      
                      <div className="item-right">
                        <span className={`status-badge ${obtenerClaseEstado(elemento.status)}`}>
                          {elemento.status || "pendiente"}
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
              <span>{recomendaciones.length} / 10</span>
            </h2>

            <div className="rec-list">
              {recomendaciones.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--texto-apagado)", fontStyle: "italic", textAlign: "center", padding: "1rem" }}>
                  Aún no hay recomendaciones de usuarios. ¡Sé el primero!
                </p>
              ) : (
                recomendaciones.map((recomendacion) => (
                  <div key={recomendacion.id} className="rec-card">
                    <div className="rec-header">
                      <span className="rec-title">{recomendacion.content_title}</span>
                      <span className="rec-type">{recomendacion.content_type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form className="rec-form" onSubmit={manejarEnvioRecomendacion}>
              <h3 style={{ fontSize: "1rem", color: "var(--acento-dorado)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Recomiéndame algo
              </h3>
              
              <div className="form-group">
                <label htmlFor="rec-type">Tipo</label>
                <select
                  id="rec-type"
                  className="form-select"
                  value={tipoFormulario}
                  onChange={(e) => setTipoFormulario(e.target.value)}
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
                  value={tituloFormulario}
                  onChange={(e) => setTituloFormulario(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="rec-comment">Comentario / Por qué</label>
                <textarea
                  id="rec-comment"
                  className="form-textarea"
                  placeholder="Por qué debería verlo/leerlo..."
                  value={comentarioFormulario}
                  onChange={(e) => setComentarioFormulario(e.target.value)}
                  maxLength={300}
                />
              </div>

              {mensajeFormulario.texto && (
                <div className={`form-msg ${mensajeFormulario.tipo}`}>
                  {mensajeFormulario.texto}
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={enviando || recomendaciones.length >= 10}
              >
                {enviando ? "Enviando..." : "Enviar recomendación"}
              </button>
            </form>
          </aside>

        </div>

        {elementoSeleccionado && (
          <div className="modal-overlay" onClick={() => setElementoSeleccionado(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setElementoSeleccionado(null)}>
                ×
              </button>
              
              <div className="modal-title-area">
                <h2 className="modal-title">{elementoSeleccionado.title}</h2>
                <div className="modal-meta">
                  <span className="item-rating">{elementoSeleccionado.rating || "-"}</span>
                  <span className={`status-badge ${obtenerClaseEstado(elementoSeleccionado.status)}`}>
                    {elementoSeleccionado.status || "pendiente"}
                  </span>
                  <span style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--acento-azul)", fontWeight: "bold" }}>
                    {elementoSeleccionado.type}
                  </span>
                </div>
              </div>

              {elementoSeleccionado.description && (
                <div className="modal-body-section">
                  <h3 className="modal-section-title">Descripción</h3>
                  <p>{elementoSeleccionado.description}</p>
                </div>
              )}

              {elementoSeleccionado.notes && (
                <div className="modal-body-section">
                  <h3 className="modal-section-title">Mis notas / Comentario personal</h3>
                  <p style={{ fontStyle: "italic", borderLeft: "2px solid var(--acento-dorado)", paddingLeft: "0.8rem" }}>
                    "{elementoSeleccionado.notes}"
                  </p>
                </div>
              )}

              {!elementoSeleccionado.description && !elementoSeleccionado.notes && (
                <p style={{ fontStyle: "italic", color: "var(--texto-apagado)" }}>
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
