import Link from "next/link";
import { connection } from "next/server";
import { cargarTorneo } from "./datos";
import { calcularClasificacion } from "./torneo";
import { CuadroEliminatoria, ListaRondas, Seccion, TablaClasificacion, crearNombrePorId } from "./componentes";

// Vista pública: solo lectura
export default async function PaginaAjedrez() {
  await connection();
  const { jugadores, rondas, partidas, cuadro } = await cargarTorneo();
  const clasificacion = calcularClasificacion(jugadores, partidas);
  const nombre = crearNombrePorId(jugadores);

  return (
    <main className="pagina-ajedrez">
      <header className="cabecera-ajedrez">
        <Link href="/ajedrez/admin" className="boton-ajedrez boton-secundario boton-acceso">Acceso organización</Link>
        <p className="antetitulo">Torneo de ajedrez</p>
        <h1>Suizo y eliminatoria</h1>
        <p className="resumen">
          {jugadores.length} jugadores · {rondas.length} {rondas.length === 1 ? "ronda" : "rondas"} jugadas
          {cuadro.length > 0 && " · fase final en curso"}
        </p>
        <nav className="navegacion">
          {cuadro.length > 0 && <a href="#cuadro">Eliminatoria</a>}
          <a href="#clasificacion">Clasificación</a>
          <a href="#rondas">Rondas</a>
        </nav>
      </header>

      {cuadro.length > 0 && (
        <Seccion id="cuadro" titulo="Eliminatoria">
          <CuadroEliminatoria cuadro={cuadro} nombre={nombre} />
        </Seccion>
      )}

      <Seccion id="clasificacion" titulo={cuadro.length > 0 ? "Clasificación final del suizo" : "Clasificación"}>
        <TablaClasificacion filas={clasificacion} />
      </Seccion>

      <Seccion id="rondas" titulo="Rondas">
        <ListaRondas rondas={rondas} partidas={partidas} nombre={nombre} />
      </Seccion>
    </main>
  );
}

