import React from "react";
import Link from "next/link";
import "./cv.css";

export default function CVPage() {
  return (
    <div className="cv-body min-h-screen">
      <div className="cv-container">
        
        {/* Back Link */}
        <Link href="/" className="cv-back-link">
          <span>←</span> Volver al Portfolio
        </Link>

        {/* Header Section */}
        <header className="cv-header">
          <h1 className="cv-name">ÁNGEL MAZARÍAS SALGADO</h1>
          <p className="cv-title">Desarrollador de Software</p>
          
          <div className="cv-meta-grid">
            <div className="cv-meta-item">
              <span>📍</span> Madrid, España
            </div>
            <div className="cv-meta-item">
              <span>📞</span> 659 750 262
            </div>
            <div className="cv-meta-item">
              <span>✉️</span> angel.mazarias.salgado@gmail.com
            </div>
            <div className="cv-meta-item">
              <span>📅</span> 13/09/1994
            </div>
          </div>
        </header>

        {/* Two-Column Grid */}
        <div className="cv-grid">
          
          {/* Left Column (Sidebar) */}
          <aside className="cv-sidebar">
            
            {/* Perfil Profesional */}
            <section>
              <h2 className="cv-section-title">Perfil Profesional</h2>
                <p className="cv-profile-text">
                Desarrollador de Software con experiencia en .NET (C#, Blazor) 
                y gestión de bases de datos (SQL Server). Actualmente formo parte de un equipo de 
                soporte de desarrollo, donde mantengo y mejoro sistemas logísticos. 
                </p>
                <p className="cv-profile-text">Aporto además más de 5 años de experiencia en gestión de proyectos, con visión de negocio, capacidad analítica y resolución de problemas.. </p>
                <p className="cv-profile-text"> Por último, se integrar herramientas de Inteligencia Artificial para optimizar mis flujos de trabajo.</p>
            </section>

            {/* Habilidades Técnicas */}
            <section>
              <h2 className="cv-section-title">Habilidades Técnicas</h2>
              <div className="cv-skills-group">
                <div>
                  <h3 className="cv-skill-category-title">Lenguajes y Frameworks</h3>
                  <div className="cv-tags">
                    <span className="cv-tag">C# .NET</span>
                    <span className="cv-tag">Blazor</span>
                    <span className="cv-tag">JavaScript</span>
                    <span className="cv-tag">Python</span>
                    <span className="cv-tag">PHP</span>
                    <span className="cv-tag">HTML5</span>
                    <span className="cv-tag">CSS3</span>
                    <span className="cv-tag">Herramientas de IA</span>
                  </div>
                </div>

                <div>
                  <h3 className="cv-skill-category-title">Bases de Datos</h3>
                  <div className="cv-tags">
                    <span className="cv-tag">SQL Server</span>
                    <span className="cv-tag">MySQL</span>
                    <span className="cv-tag">PostgreSQL</span>
                  </div>
                </div>

                <div>
                  <h3 className="cv-skill-category-title">Herramientas y Versionado</h3>
                  <div className="cv-tags">
                    <span className="cv-tag">Git</span>
                    <span className="cv-tag">SourceTree</span>
                    <span className="cv-tag">GitHub</span>
                    <span className="cv-tag">DevOps</span>
                    <span className="cv-tag">VS Code / VS</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Idiomas y Otros Datos */}
            <section>
              <h2 className="cv-section-title">Idiomas y Otros</h2>
              <div className="cv-languages-list">
                <div className="cv-language-item">
                  <strong>Idiomas:</strong> Español (Nativo) | Inglés (Nivel B2 Acreditado por British Council).
                </div>
                <div className="cv-language-item">
                  <strong>Otros Datos:</strong> Carné de conducir tipo B (Vehículo propio).
                </div>
                <div className="cv-language-item">
                  <strong>Soft Skills:</strong> Gestión de Proyectos, Resolución de Incidencias, Trabajo Bajo Presión y Adaptabilidad.
                </div>
              </div>
            </section>

          </aside>

          {/* Right Column (Main Content) */}
          <main className="cv-main">
            
            {/* Experiencia Laboral */}
            <section>
              <h2 className="cv-section-title">Experiencia Laboral</h2>
              <div className="cv-timeline">
                
                {/* ICP Logística */}
                <div className="cv-timeline-item">
                  <span className="cv-timeline-marker"></span>
                  <div className="cv-timeline-header">
                    <div>
                      <h3 className="cv-job-title">Desarrollador de Software y Soporte (Logística)</h3>
                      <span className="cv-job-company">ICP Logística, Madrid</span>
                    </div>
                    <span className="cv-job-date">Mar 2025 – Actualidad</span>
                  </div>
                  <ul className="cv-job-bullets">
                    <li>Mantenimiento y soporte técnico activo del sistema logístico de la compañía.</li>
                    <li>Desarrollo de nuevas funcionalidades y resolución de bugs utilizando C#, Blazor y SQL Server.</li>
                    <li>Gestión del control de versiones del código fuente mediante repositorios Git y SourceTree.</li>
                    <li>Soporte directo al departamento de producción para la resolución de incidencias técnicas en tiempo real, optimizando el flujo de trabajo logístico.</li>
                  </ul>
                </div>

                {/* Team Queso */}
                <div className="cv-timeline-item">
                  <span className="cv-timeline-marker"></span>
                  <div className="cv-timeline-header">
                    <div>
                      <h3 className="cv-job-title">Project Manager y Administrativo</h3>
                      <span className="cv-job-company">Team Queso eSports SL, Madrid</span>
                    </div>
                    <span className="cv-job-date">May 2017 – Oct 2022</span>
                  </div>
                  <ul className="cv-job-bullets">
                    <li>Gestión integral de proyectos multifuncionales, asegurando el cumplimiento de plazos, presupuesto y objetivos técnicos.</li>
                    <li>Desarrollo, análisis y actualización de bases de datos relacionales y hojas de cálculo avanzadas para facilitar la toma de decisiones.</li>
                    <li>Coordinación constante con diversos departamentos internos (marketing, producción, logística) y proveedores externos.</li>
                  </ul>
                </div>

                {/* Nikai Systems */}
                <div className="cv-timeline-item">
                  <span className="cv-timeline-marker"></span>
                  <div className="cv-timeline-header">
                    <div>
                      <h3 className="cv-job-title">Operario de Taller</h3>
                      <span className="cv-job-company">NIKAI SYSTEMS S.L., La Garena (Madrid)</span>
                    </div>
                    <span className="cv-job-date">Oct 2016 – Abr 2017</span>
                  </div>
                </div>

                {/* Scout Apícula */}
                <div className="cv-timeline-item">
                  <span className="cv-timeline-marker"></span>
                  <div className="cv-timeline-header">
                    <div>
                      <h3 className="cv-job-title">Coordinador y Monitor</h3>
                      <span className="cv-job-company">Grupo Scout Apícula</span>
                    </div>
                    <span className="cv-job-date">Sep 2011 – Sep 2017</span>
                  </div>
                  <ul className="cv-job-bullets">
                    <li>Organización logística de eventos, liderazgo de grupos y desarrollo de dinámicas enfocadas en el trabajo en equipo y la resolución de problemas.</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Formación Académica */}
            <section>
              <h2 className="cv-section-title">Formación Académica</h2>
              <div className="cv-education-grid">
                
                <div className="cv-education-item">
                  <h3 className="cv-education-degree">Grado Superior en Desarrollo de Aplicaciones Web (DAW)</h3>
                  <div className="cv-education-school">
                    IES Arcipreste de Hita, Azuqueca de Henares <span>2023 – 2025</span>
                  </div>
                </div>

                <div className="cv-education-item">
                  <h3 className="cv-education-degree">Grado en Biología</h3>
                  <div className="cv-education-school">
                    Universidad de Umea, Suecia (En Inglés) / Universidad de Alcalá de Henares <span>2013 – 2016</span>
                  </div>
                </div>

              </div>
            </section>

          </main>

        </div>

      </div>
    </div>
  );
}
