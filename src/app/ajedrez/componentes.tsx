import type { ReactNode } from "react";
import {
  FASES, NOMBRE_FASE, mostrarPuntos, mostrarResultado,
  type Cruce, type FilaClasificacion, type Jugador, type Partida, type Ronda,
} from "./torneo";

// Piezas de solo lectura compartidas por la vista pública y el panel

export type NombrePorId = (id: number | null) => string;

export function crearNombrePorId(jugadores: Jugador[]): NombrePorId {
  const mapa = new Map(jugadores.map((j) => [j.id, j.name]));
  return (id) => (id === null ? "" : mapa.get(id) ?? "¿?");
}

export function Seccion({ id, titulo, extra, children }: { id: string; titulo: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="seccion-ajedrez">
      <div className="cabecera-seccion">
        <h2>{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function TablaClasificacion({ filas }: { filas: FilaClasificacion[] }) {
  if (filas.length === 0) return <p className="vacio">Todavía no hay jugadores inscritos.</p>;

  return (
    <div className="tabla-desplazable">
      <table className="tabla">
        <thead>
          <tr>
            <th className="num">#</th>
            <th>Jugador</th>
            <th className="num" title="Puntos">Pts</th>
            <th className="num" title="Partidas jugadas">PJ</th>
            <th className="num" title="Victorias">V</th>
            <th className="num" title="Buchholz: suma de puntos de los rivales">Buch.</th>
            <th className="num" title="Sonneborn-Berger">S-B</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.jugador.id} className={f.jugador.active ? "" : "retirado"}>
              <td className="num">{f.puesto}</td>
              <td>
                {f.jugador.name}
                {!f.jugador.active && <span className="marca">retirado</span>}
              </td>
              <td className="num fuerte">{mostrarPuntos(f.puntos)}</td>
              <td className="num">{f.jugadas}</td>
              <td className="num">{f.victorias}</td>
              <td className="num">{mostrarPuntos(f.buchholz)}</td>
              <td className="num">{mostrarPuntos(f.sonneborn)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nota-tabla">
        Desempates por orden: Buchholz, Sonneborn-Berger y número de victorias. Un descanso vale 1 punto.
      </p>
    </div>
  );
}

export function TablaRonda({ partidas, nombre }: { partidas: Partida[]; nombre: NombrePorId }) {
  return (
    <div className="tabla-desplazable">
      <table className="tabla tabla-ronda">
        <thead>
          <tr>
            <th className="num">Mesa</th>
            <th className="derecha">Blancas</th>
            <th className="centro">Resultado</th>
            <th>Negras</th>
          </tr>
        </thead>
        <tbody>
          {partidas.map((p) => (
            <tr key={p.id}>
              <td className="num suave">{p.board}</td>
              <td className={`derecha ${p.result === "1-0" ? "fuerte" : ""}`}>{nombre(p.white_id)}</td>
              <td className="centro resultado">
                {p.black_id === null ? <span className="suave">descansa</span> : mostrarResultado(p.result)}
              </td>
              <td className={p.result === "0-1" ? "fuerte" : ""}>{p.black_id === null ? "" : nombre(p.black_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ListaRondas({ rondas, partidas, nombre }: { rondas: Ronda[]; partidas: Partida[]; nombre: NombrePorId }) {
  if (rondas.length === 0) return <p className="vacio">Aún no se ha jugado ninguna ronda.</p>;

  const ultima = rondas.at(-1)!.number;
  return (
    <div className="lista-rondas">
      {[...rondas].reverse().map((r) => {
        const deRonda = partidas.filter((p) => p.round_id === r.id);
        const pendientes = deRonda.filter((p) => p.black_id !== null && !p.result).length;
        return (
          <details key={r.id} className="ronda" open={r.number === ultima}>
            <summary>
              Ronda {r.number}
              <span className="suave">{pendientes > 0 ? `${pendientes} por jugar` : "terminada"}</span>
            </summary>
            <TablaRonda partidas={deRonda} nombre={nombre} />
          </details>
        );
      })}
    </div>
  );
}

// Cuadro de la eliminatoria por columnas. "renderCruce" permite al panel añadir su formulario.
export function CuadroEliminatoria({
  cuadro, nombre, renderCruce,
}: { cuadro: Cruce[]; nombre: NombrePorId; renderCruce?: (cruce: Cruce) => ReactNode }) {
  const fases = FASES.filter((f) => cuadro.some((c) => c.stage === f));

  return (
    <div className="cuadro">
      {fases.map((fase) => (
        <div key={fase} className="columna-cuadro">
          <h3>{NOMBRE_FASE[fase]}</h3>
          <div className="cruces">
            {cuadro.filter((c) => c.stage === fase).map((c) => (
              <div key={c.id} className="cruce">
                <LineaCruce id={c.player_a_id} semilla={c.seed_a} cruce={c} nombre={nombre} />
                <LineaCruce id={c.player_b_id} semilla={c.seed_b} cruce={c} nombre={nombre} />
                {c.note && <p className="nota-cruce">{c.note}</p>}
                {renderCruce?.(c)}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Campeon cuadro={cuadro} nombre={nombre} />
    </div>
  );
}

function LineaCruce({ id, semilla, cruce, nombre }: { id: number | null; semilla: number | null; cruce: Cruce; nombre: NombrePorId }) {
  const gana = id !== null && cruce.winner_id === id;
  const pierde = id !== null && cruce.winner_id !== null && !gana;
  return (
    <div className={`linea-cruce ${gana ? "gana" : ""} ${pierde ? "pierde" : ""}`}>
      <span className="semilla">{semilla ?? ""}</span>
      <span className="nombre-cruce">{id === null ? <span className="suave">por decidir</span> : nombre(id)}</span>
    </div>
  );
}

function Campeon({ cuadro, nombre }: { cuadro: Cruce[]; nombre: NombrePorId }) {
  const final = cuadro.find((c) => c.stage === "final");
  if (!final?.winner_id) return null;
  return (
    <div className="columna-cuadro">
      <h3>Campeón</h3>
      <div className="cruces">
        <p className="campeon">{nombre(final.winner_id)}</p>
      </div>
    </div>
  );
}
