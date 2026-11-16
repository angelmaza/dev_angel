import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nunito } from "next/font/google";
import { FASES, LIBROS, SISTEMAS, type Libro } from "./datos";
import SelectorOrden from "./SelectorOrden";
import "./cosmere.css";

export const metadata: Metadata = {
  title: "Cosmere · Guía de lectura",
  description: "Libros del Cosmere de Brandon Sanderson por sistema y orden de lectura",
};

const fuente = Nunito({ subsets: ["latin"], weight: ["400", "700", "800", "900"], style: ["normal", "italic"] });

// Un grupo es una franja con etiqueta vertical a la izquierda (una fase, o un año de publicación)
interface Grupo {
  id: string;
  etiqueta: ReactNode;
}

// Una fila del mapa: un hueco (solo línea) o una fila con libros
interface Fila {
  grupo: string;
  tipo: "hueco" | "libros";
  libros: Libro[];
  ultimaDeGrupo: boolean;
  clase?: string;
}

const columnas = `var(--ancho-etiqueta) repeat(${SISTEMAS.length}, minmax(0, 1fr))`;

function Mapa({ grupos, filas }: { grupos: Grupo[]; filas: Fila[] }) {
  const ultimaFila = filas.length - 1;

  // Tramo de cada sistema: desde su primer libro hasta el último (o hasta el final si sigue abierto)
  const tramos = SISTEMAS.map((sistema) => {
    const conLibro = filas.map((f, i) => (f.libros.some((l) => l.sistema === sistema.id) ? i : -1)).filter((i) => i >= 0);
    const primero = conLibro.length ? conLibro[0] : -1;
    const ultimoLibro = conLibro.length ? conLibro[conLibro.length - 1] : -1;
    return { primero, ultimoLibro, fin: sistema.continua ? ultimaFila : ultimoLibro };
  });

  return (
    <div className="cosmere-mapa" style={{ gridTemplateColumns: columnas, ["--columnas" as string]: SISTEMAS.length }}>
      {/* Cabecera fija al desplazarse: planeta (grande) y sistema */}
      <div className="cosmere-cabecera-sistemas" style={{ gridTemplateColumns: columnas }}>
        {SISTEMAS.map((sistema, s) => (
          <div key={sistema.id} className="cosmere-sistema" style={{ gridColumn: s + 2, color: sistema.color }}>
            <span>
              <strong>{sistema.planeta}</strong>
              <small>Sistema {sistema.nombre}</small>
            </span>
          </div>
        ))}
      </div>

      {/* Etiquetas de grupo */}
      {grupos.map((grupo, g) => {
        const inicio = filas.findIndex((fila) => fila.grupo === grupo.id);
        const fin = filas.findLastIndex((fila) => fila.grupo === grupo.id);
        return (
          <div
            key={grupo.id}
            className={`cosmere-fase ${g < grupos.length - 1 ? "con-separador" : ""}`}
            style={{ gridColumn: 1, gridRow: `${inicio + 2} / ${fin + 3}` }}
          >
            <span>{grupo.etiqueta}</span>
          </div>
        );
      })}

      {/* Celdas: tramos de línea y libros */}
      {filas.map((fila, r) =>
        SISTEMAS.map((sistema, s) => {
          const { primero, ultimoLibro, fin } = tramos[s];
          const arriba = primero >= 0 && primero < r && r <= fin;
          const abajo = primero >= 0 && primero <= r && r < fin;
          const libro = fila.libros.find((l) => l.sistema === sistema.id);
          const separador = fila.ultimaDeGrupo && r < ultimaFila;
          return (
            <div
              key={`${r}-${sistema.id}`}
              className={`cosmere-celda ${fila.tipo === "hueco" ? "es-hueco" : ""} ${separador ? "con-separador" : ""} ${fila.clase ?? ""}`}
              style={{ gridColumn: s + 2, gridRow: r + 2, ["--color" as string]: sistema.color }}
            >
              {arriba && <span className={`tramo tramo-arriba ${r > ultimoLibro ? "punteado" : ""}`} />}
              {abajo && <span className={`tramo tramo-abajo ${r >= ultimoLibro ? "punteado" : ""}`} />}
              {libro && (
                <div className={`cosmere-libro ${libro.alternativa ? "alternativa" : ""}`}>
                  <span className="punto" aria-hidden="true" />
                  <span className="titulo">
                    {libro.titulo}
                    {libro.nota && !libro.alternativa && <sup title={libro.nota}>*</sup>}
                    {libro.alternativa && libro.nota && <small>{libro.nota}</small>}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// Orden de lectura: cada fase es un grupo, con un hueco arriba, sus filas de libros y un hueco abajo
function vistaLectura() {
  const grupos: Grupo[] = FASES.map((fase) => ({
    id: fase.id,
    etiqueta: (
      <>
        <strong>{fase.nombre}</strong>
        {fase.enProceso && <em> (en proceso)</em>}
      </>
    ),
  }));

  const filas: Fila[] = [];
  for (const fase of FASES) {
    const libros = LIBROS.filter((l) => l.fase === fase.id);
    const maxFila = Math.max(1, ...libros.map((l) => l.fila));
    // Fases con una sola fila o sin libros: más altas para que quepa su etiqueta vertical
    const clase = libros.length === 0 ? "fase-vacia" : maxFila === 1 ? "fila-unica" : undefined;
    filas.push({ grupo: fase.id, tipo: "hueco", libros: [], ultimaDeGrupo: false });
    for (let n = 1; n <= maxFila; n++) {
      filas.push({ grupo: fase.id, tipo: "libros", libros: libros.filter((l) => l.fila === n), ultimaDeGrupo: false, clase });
    }
    filas.push({ grupo: fase.id, tipo: "hueco", libros: [], ultimaDeGrupo: true });
  }

  return <Mapa grupos={grupos} filas={filas} />;
}

// Orden de publicación: un libro por fila, agrupados por año
function vistaPublicacion() {
  const publicados = LIBROS.filter((l) => l.publicado && !l.alternativa).sort((a, b) =>
    a.publicado!.localeCompare(b.publicado!)
  );
  const anio = (l: Libro) => l.publicado!.slice(0, 4);

  const grupos: Grupo[] = [...new Set(publicados.map(anio))].map((a) => ({ id: a, etiqueta: <strong>{a}</strong> }));
  const filas: Fila[] = publicados.map((libro, i) => ({
    grupo: anio(libro),
    tipo: "libros",
    libros: [libro],
    ultimaDeGrupo: i === publicados.length - 1 || anio(publicados[i + 1]) !== anio(libro),
  }));

  return <Mapa grupos={grupos} filas={filas} />;
}

export default function PaginaCosmere() {
  return (
    <div className={`${fuente.className} cosmere`} lang="es">
      <header className="cosmere-cabecera">
        <h1>Cosmere: Guía de lectura</h1>
        <p>Los libros de Brandon Sanderson, el sistema donde transcurren y en qué orden leerlos</p>
      </header>

      <main className="cosmere-contenido">
        <div className="cosmere-desplazable">
          <SelectorOrden lectura={vistaLectura()} publicacion={vistaPublicacion()} />
        </div>
      </main>
    </div>
  );
}
