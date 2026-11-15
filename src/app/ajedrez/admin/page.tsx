import Link from "next/link";
import { cargarTorneo } from "../datos";
import { haySesion } from "../sesion";
import {
  borrarCuadro, borrarJugador, borrarUltimaRonda, cerrarSesion, crearCuadro, crearJugador,
  editarJugador, generarRonda, guardarCruce, guardarRonda,
} from "../acciones";
import { calcularClasificacion, type Cruce, type Jugador, type Partida, type Ronda } from "../torneo";
import { CuadroEliminatoria, Seccion, TablaClasificacion, crearNombrePorId, type NombrePorId } from "../componentes";
import FormularioAcceso from "./FormularioAcceso";
import BotonConfirmar from "./BotonConfirmar";

// Pestañas del panel: se ve una sola sección cada vez
const PESTANAS = [
  { id: "jugadores", nombre: "Jugadores" },
  { id: "rondas", nombre: "Rondas suizo" },
  { id: "eliminatoria", nombre: "Eliminatoria" },
  { id: "clasificacion", nombre: "Clasificación" },
] as const;

type Vista = (typeof PESTANAS)[number]["id"];

export default async function PanelAjedrez({ searchParams }: { searchParams: Promise<{ aviso?: string; vista?: string }> }) {
  if (!(await haySesion())) {
    return (
      <main className="pagina-ajedrez estrecha">
        <header className="cabecera-ajedrez">
          <p className="antetitulo">Torneo de ajedrez</p>
          <h1>Acceso</h1>
        </header>
        <FormularioAcceso />
        <footer className="pie-ajedrez">
          <Link href="/ajedrez">Volver a la clasificación</Link>
        </footer>
      </main>
    );
  }

  const parametros = await searchParams;
  const vista: Vista = PESTANAS.find((p) => p.id === parametros.vista)?.id ?? "jugadores";
  const torneo = await cargarTorneo();

  return (
    <main className="pagina-ajedrez">
      <header className="cabecera-ajedrez">
        <form action={cerrarSesion} className="boton-acceso">
          <Link href="/ajedrez" className="enlace-cabecera">Vista pública</Link>
          <button type="submit" className="boton-ajedrez boton-secundario">Salir</button>
        </form>
        <p className="antetitulo">Torneo de ajedrez · organización</p>
        <h1>Panel</h1>
        <nav className="pestanas">
          {PESTANAS.map((p) => (
            <Link key={p.id} href={`/ajedrez/admin?vista=${p.id}`} className={p.id === vista ? "activa" : ""}>
              {p.nombre}
            </Link>
          ))}
        </nav>
      </header>

      {parametros.aviso && (
        <div className="aviso">
          <span>{parametros.aviso}</span>
          <Link href={`/ajedrez/admin?vista=${vista}`}>Cerrar</Link>
        </div>
      )}

      {vista === "jugadores" && <VistaJugadores jugadores={torneo.jugadores} />}
      {vista === "rondas" && <VistaRondas {...torneo} />}
      {vista === "eliminatoria" && <VistaEliminatoria {...torneo} />}
      {vista === "clasificacion" && (
        <Seccion id="clasificacion" titulo="Clasificación del suizo">
          <TablaClasificacion filas={calcularClasificacion(torneo.jugadores, torneo.partidas)} />
        </Seccion>
      )}
    </main>
  );
}

// ---------- Jugadores ----------

function VistaJugadores({ jugadores }: { jugadores: Jugador[] }) {
  const ordenados = [...jugadores].sort((a, b) => a.name.localeCompare(b.name));
  const activos = jugadores.filter((j) => j.active).length;

  return (
    <Seccion id="jugadores" titulo={`Jugadores (${activos} activos)`}>
      <form action={crearJugador} className="formulario-linea">
        <input name="nombre" placeholder="Nombre" required />
        <button type="submit" className="boton-ajedrez">Añadir</button>
      </form>

      {ordenados.length === 0 ? (
        <p className="vacio">Añade los jugadores para empezar.</p>
      ) : (
        <div className="lista-editable">
          {ordenados.map((j) => (
            <FilaJugador key={`${j.id}-${j.name}-${j.active}`} jugador={j} />
          ))}
        </div>
      )}
    </Seccion>
  );
}

function FilaJugador({ jugador }: { jugador: Jugador }) {
  return (
    <div className="fila-editable">
      <form action={editarJugador} className="formulario-linea">
        <input type="hidden" name="id" value={jugador.id} />
        <input name="nombre" defaultValue={jugador.name} required aria-label="Nombre" />
        <label className="casilla">
          <input type="checkbox" name="activo" defaultChecked={jugador.active} />
          activo
        </label>
        <button type="submit" className="boton-ajedrez boton-secundario">Guardar</button>
      </form>
      <form action={borrarJugador}>
        <input type="hidden" name="id" value={jugador.id} />
        <BotonConfirmar mensaje={`¿Borrar a ${jugador.name}?`}>Borrar</BotonConfirmar>
      </form>
    </div>
  );
}

// ---------- Rondas suizo ----------

function VistaRondas({ jugadores, rondas, partidas, cuadro }: { jugadores: Jugador[]; rondas: Ronda[]; partidas: Partida[]; cuadro: Cruce[] }) {
  const ordenados = [...jugadores].sort((a, b) => a.name.localeCompare(b.name));
  const pendientes = partidas.filter((p) => p.black_id !== null && !p.result).length;
  const activos = jugadores.filter((j) => j.active).length;
  const ultima = rondas.at(-1)?.number;
  const puedeGenerar = cuadro.length === 0 && pendientes === 0 && activos >= 2;

  return (
    <Seccion
      id="rondas"
      titulo="Rondas suizo"
      extra={
        <div className="acciones-seccion">
          <form action={generarRonda}>
            <button type="submit" className="boton-ajedrez" disabled={!puedeGenerar}>
              Emparejar ronda {(ultima ?? 0) + 1}
            </button>
          </form>
          {ultima !== undefined && cuadro.length === 0 && (
            <form action={borrarUltimaRonda}>
              <BotonConfirmar mensaje={`¿Borrar la ronda ${ultima} con todos sus resultados?`}>
                Borrar ronda {ultima}
              </BotonConfirmar>
            </form>
          )}
        </div>
      }
    >
      {pendientes > 0 && <p className="suave">Quedan {pendientes} resultados por meter antes de emparejar la siguiente ronda.</p>}
      {cuadro.length > 0 && <p className="suave">El suizo está cerrado porque ya hay cuadro de eliminatoria.</p>}
      {rondas.length === 0 && <p className="vacio">Sin rondas. Con los jugadores inscritos, empareja la ronda 1.</p>}

      {[...rondas].reverse().map((r) => {
        const deRonda = partidas.filter((p) => p.round_id === r.id);
        // La clave cambia con los datos guardados para que el formulario se rehaga tras guardar
        const clave = deRonda.map((p) => `${p.id}:${p.white_id}:${p.black_id}:${p.result}`).join("|");
        return <FormularioRonda key={clave} ronda={r} partidas={deRonda} jugadores={ordenados} />;
      })}
    </Seccion>
  );
}

function FormularioRonda({ ronda, partidas, jugadores }: { ronda: Ronda; partidas: Partida[]; jugadores: Jugador[] }) {
  return (
    <form action={guardarRonda} className="ronda-editable">
      <div className="cabecera-ronda">
        <h3>Ronda {ronda.number}</h3>
        <button type="submit" className="boton-ajedrez">Guardar ronda {ronda.number}</button>
      </div>
      <div className="lista-editable">
        {partidas.map((p) => (
          <div key={p.id} className="formulario-linea fila-editable">
            <input type="hidden" name="partida" value={p.id} />
            <span className="mesa">Mesa {p.board}</span>
            <select name={`blancas_${p.id}`} defaultValue={p.white_id} aria-label={`Blancas mesa ${p.board}`}>
              {jugadores.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
            <select name={`resultado_${p.id}`} defaultValue={p.result ?? ""} aria-label={`Resultado mesa ${p.board}`}>
              <option value="">sin jugar</option>
              <option value="1-0">1 – 0</option>
              <option value="1/2-1/2">½ – ½</option>
              <option value="0-1">0 – 1</option>
            </select>
            <select name={`negras_${p.id}`} defaultValue={p.black_id ?? ""} aria-label={`Negras mesa ${p.board}`}>
              <option value="">— descansa —</option>
              {jugadores.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>
        ))}
      </div>
    </form>
  );
}

// ---------- Eliminatoria ----------

function VistaEliminatoria({ jugadores, rondas, partidas, cuadro }: { jugadores: Jugador[]; rondas: Ronda[]; partidas: Partida[]; cuadro: Cruce[] }) {
  const nombre = crearNombrePorId(jugadores);
  const pendientes = partidas.filter((p) => p.black_id !== null && !p.result).length;

  return (
    <Seccion
      id="eliminatoria"
      titulo="Eliminatoria"
      extra={
        cuadro.length > 0 && (
          <form action={borrarCuadro}>
            <BotonConfirmar mensaje="¿Borrar el cuadro de la eliminatoria y sus resultados?">Borrar cuadro</BotonConfirmar>
          </form>
        )
      }
    >
      {cuadro.length === 0 ? (
        <form action={crearCuadro} className="formulario-linea">
          <label>
            Pasan los
            <select name="clasificados" defaultValue="4">
              <option value="8">8 primeros (cuartos)</option>
              <option value="4">4 primeros (semifinales)</option>
              <option value="2">2 primeros (final)</option>
            </select>
          </label>
          <button type="submit" className="boton-ajedrez" disabled={rondas.length === 0 || pendientes > 0}>
            Crear cuadro
          </button>
          <span className="suave">Se cruzan 1.º contra último, 2.º contra penúltimo… según la clasificación actual.</span>
        </form>
      ) : (
        <CuadroEliminatoria
          cuadro={cuadro}
          nombre={nombre}
          renderCruce={(c) => <FormularioCruce key={`${c.id}-${c.player_a_id}-${c.player_b_id}-${c.winner_id}-${c.note}`} cruce={c} nombre={nombre} />}
        />
      )}
    </Seccion>
  );
}

function FormularioCruce({ cruce, nombre }: { cruce: Cruce; nombre: NombrePorId }) {
  if (cruce.player_a_id === null || cruce.player_b_id === null) return null;
  return (
    <form action={guardarCruce} className="formulario-cruce">
      <input type="hidden" name="id" value={cruce.id} />
      <select name="ganador" defaultValue={cruce.winner_id ?? ""} aria-label="Ganador">
        <option value="">sin ganador</option>
        <option value={cruce.player_a_id}>{nombre(cruce.player_a_id)}</option>
        <option value={cruce.player_b_id}>{nombre(cruce.player_b_id)}</option>
      </select>
      <input name="nota" defaultValue={cruce.note ?? ""} placeholder="Marcador (p. ej. 1½–½)" aria-label="Nota" />
      <button type="submit" className="boton-ajedrez boton-secundario">Guardar</button>
    </form>
  );
}
