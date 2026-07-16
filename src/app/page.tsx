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
                Ranking CRUD
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

            <a className="tarjeta-proyecto borde-pixel" href="#" target="_blank" rel="noopener noreferrer">
              <div className="cabecera-tarjeta">
                <span className="etiqueta-proyecto">[ 03 ]</span>
                <span className="tipo-proyecto">CV</span>
              </div>
              <h3>Curriculum Vitae</h3>
              <p>
                Curriculum Vitae
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
              Hola, soy <strong>Tu Nombre</strong>. Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
              Recusandae magni amet natus explicabo quis molestiae accusantium quae, est soluta doloribus aliquid ducimus assumenda tempore eaque corrupti reiciendis aut rerum accusamus!
            </p>

            <p>
              Recusandae magni amet natus explicabo quis molestiae accusantium quae, est soluta doloribus aliquid ducimus assumenda tempore eaque corrupti reiciendis aut rerum accusamus!
            </p>

            <div className="etiquetas-sobre-mi">
              <span>Ingles</span>
              <span>Blazor</span>
              <span>PHP</span>
              <span>JavaScript</span>
              <span>React</span>
              <span>GIT</span>
              <span>CSS</span>
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
