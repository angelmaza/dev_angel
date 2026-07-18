"use client";

import React, { useEffect } from "react";
import "./landing.css";

export default function Home() {
  useEffect(() => {
    const tarjetasProyecto = document.querySelectorAll(".tarjeta-proyecto");

    tarjetasProyecto.forEach((tarjeta) => {
      const el = tarjeta as HTMLElement;
      el.addEventListener("mouseenter", () => {
        el.style.filter = "brightness(1.05)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.filter = "brightness(1)";
      });
    });
  }, []);

  return (
    <>
      <div className="ruido"></div>

      <header className="hero">
        <div className="caja-hero borde-pixel">
          <p className="etiqueta">PORTFOLIO // DESAROLLADOR</p>
          <h1>Angel Mazarías Salgado</h1>
          <p className="subtitulo">
            Contacto: angel.mazarias.salgado@gmail.com 
          </p>

          <div className="acciones-hero">
            <a href="#proyectos" className="boton">Ver proyectos</a>
            <a href="#sobre-mi" className="boton boton-alterno">Sobre mí</a>
            <a href="https://github.com/angelmaza?tab=repositories" className="boton" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </header>

      <main className="contenedor">
        <section id="proyectos" className="seccion">
          <div className="titulo-seccion">
            <span className="punto-pixel"></span>
            <h2>Mis proyectos</h2>
          </div>

          <div className="rejilla-proyectos">
            <a className="tarjeta-proyecto borde-pixel" href="/Mtg_Download/Descargador__pngs_eng" target="_blank" rel="noopener noreferrer">
              <div className="cabecera-tarjeta">
                <span className="etiqueta-proyecto">[ 01 ]</span>
                <span className="tipo-proyecto">APP</span>
              </div>
              <h3>Descargador PNGs MTG</h3>
              <p>
                Conecta con la API de Scryfall para descargar las imagenes de cartas MTG en un archivo ZIP.
              </p>
            </a>

            <a className="tarjeta-proyecto borde-pixel" href="/Mi_cultura" target="_blank" rel="noopener noreferrer">
              <div className="cabecera-tarjeta">
                <span className="etiqueta-proyecto">[ 02 ]</span>
                <span className="tipo-proyecto">WEB</span>
              </div>
              <h3>Mi_cultura</h3>
              <p>
                Espacio personal con mi listado de películas, series, anime y libros preferidos. Incluye un panel interactivo para sugerencias públicas.
              </p>
            </a>

            <a className="tarjeta-proyecto borde-pixel" href="/Vane" target="_blank" rel="noopener noreferrer">
              <div className="cabecera-tarjeta">
                <span className="etiqueta-proyecto">[ 02 ]</span>
                <span className="tipo-proyecto">WEB</span>
              </div>
              <h3>lorem</h3>
              <p>
                lorem.
              </p>
            </a>

            <a className="tarjeta-proyecto borde-pixel" href="/Vane" target="_blank" rel="noopener noreferrer">
              <div className="cabecera-tarjeta">
                <span className="etiqueta-proyecto">[ 02 ]</span>
                <span className="tipo-proyecto">WEB</span>
              </div>
              <h3>Shop Landing Page</h3>
              <p>
                Landing page simple para un comercio local.
              </p>
            </a>

            <a className="tarjeta-proyecto borde-pixel" href="/cv" target="_blank" rel="noopener noreferrer">
              <div className="cabecera-tarjeta">
                <span className="etiqueta-proyecto">[ 03 ]</span>
                <span className="tipo-proyecto">CV</span>
              </div>
              <h3>Curriculum Vitae</h3>
              <p>
                Mi trayectoria profesional y académica detallada. Experiencia en desarrollo .NET, gestión de proyectos y soporte técnico.
              </p>
            </a>

            <a className="tarjeta-proyecto borde-pixel" href="#" target="_blank" rel="noopener noreferrer">
              <div className="cabecera-tarjeta">
                <span className="etiqueta-proyecto">[ 04 ]</span>
                <span className="tipo-proyecto">CODE</span>
              </div>
              <h3>Proyecto Logístico</h3>
              <p>
                Aplicación que simula una logística. Recepciones, salida pedidos, stock, referencias...
              </p>
            </a>
          </div>
        </section>

        <section id="sobre-mi" className="seccion sobre-mi">
          <div className="titulo-seccion">
            <span className="punto-pixel"></span>
            <h2>Sobre mí</h2>
          </div>

          <div className="tarjeta-sobre-mi borde-pixel">
            <p>
              Hola, soy <strong>Ángel Mazarías Salgado</strong>. Desarrollador de Software con una sólida base técnica en el ecosistema .NET (C#, Blazor) y bases de datos relacionales como SQL Server. Actualmente trabajo en soporte de desarrollo para sistemas logísticos de alta criticidad, gestionando control de versiones mediante Git y SourceTree.
            </p>

            <p>
              Cuento con más de 5 años de experiencia previa en la gestión de proyectos multifuncionales, lo que me ha aportado una mentalidad analítica, gran adaptabilidad y una excelente capacidad para resolver incidencias técnicas complejas bajo presión. Además, integro herramientas de Inteligencia Artificial de vanguardia para optimizar mis flujos de trabajo de desarrollo y agilizar la resolución de problemas.
            </p>

            <div className="etiquetas-sobre-mi">
              <span>Inglés (B2)</span>
              <span>C# .NET</span>
              <span>Blazor</span>
              <span>SQL Server</span>
              <span>PHP</span>
              <span>JavaScript</span>
              <span>Python</span>
              <span>GIT</span>
              <span>Herramientas IA</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="pie">
        <p id="texto-pie">© <span id="anio">{new Date().getFullYear()}</span> Ángel Mazarías Salgado.</p>
      </footer>
    </>
  );
}
