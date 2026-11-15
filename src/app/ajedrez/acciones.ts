"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cargarTorneo, obtenerSql } from "./datos";
import {
  CLAVE_ADMIN, NOMBRE_COOKIE, USUARIO_ADMIN, VALOR_COOKIE, haySesion,
} from "./sesion";
import {
  calcularClasificacion, faseSiguiente, generarEmparejamientos, sembrarCuadro,
  type Cruce, type Fase, type Resultado,
} from "./torneo";

const RUTA_PANEL = "/ajedrez/admin";

// ---------- Utilidades ----------

async function exigirSesion() {
  if (!(await haySesion())) redirect(RUTA_PANEL);
}

// Pestañas del panel
type VistaPanel = "jugadores" | "rondas" | "eliminatoria" | "clasificacion";

// Vuelve a la pestaña del panel mostrando un aviso
function avisar(vista: VistaPanel, mensaje: string): never {
  redirect(`${RUTA_PANEL}?vista=${vista}&aviso=${encodeURIComponent(mensaje)}`);
}

function actualizarVistas() {
  revalidatePath("/ajedrez", "layout");
}

function leerTexto(datos: FormData, campo: string): string {
  return String(datos.get(campo) ?? "").trim();
}

function leerEntero(datos: FormData, campo: string): number | null {
  const texto = leerTexto(datos, campo);
  if (texto === "") return null;
  const numero = Number(texto);
  return Number.isInteger(numero) ? numero : null;
}

// ---------- Acceso ----------

export async function iniciarSesion(_estado: { error: string }, datos: FormData): Promise<{ error: string }> {
  const usuario = leerTexto(datos, "usuario");
  const clave = String(datos.get("clave") ?? "");
  if (usuario !== USUARIO_ADMIN || clave !== CLAVE_ADMIN) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const almacen = await cookies();
  almacen.set(NOMBRE_COOKIE, VALOR_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/ajedrez",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(RUTA_PANEL);
}

export async function cerrarSesion() {
  const almacen = await cookies();
  almacen.delete({ name: NOMBRE_COOKIE, path: "/ajedrez" });
  redirect("/ajedrez");
}

// ---------- Jugadores ----------

export async function crearJugador(datos: FormData) {
  await exigirSesion();
  const nombre = leerTexto(datos, "nombre");
  if (!nombre) avisar("jugadores", "El nombre es obligatorio.");

  await obtenerSql()`INSERT INTO chess_players (name) VALUES (${nombre})`;
  actualizarVistas();
}

export async function editarJugador(datos: FormData) {
  await exigirSesion();
  const id = leerEntero(datos, "id");
  const nombre = leerTexto(datos, "nombre");
  const activo = datos.get("activo") === "on";
  if (id === null || !nombre) avisar("jugadores", "El nombre es obligatorio.");

  await obtenerSql()`UPDATE chess_players SET name = ${nombre}, active = ${activo} WHERE id = ${id}`;
  actualizarVistas();
}

export async function borrarJugador(datos: FormData) {
  await exigirSesion();
  const id = leerEntero(datos, "id");
  const consulta = obtenerSql();
  const usos = await consulta`
    SELECT
      (SELECT COUNT(*) FROM chess_games WHERE white_id = ${id} OR black_id = ${id}) +
      (SELECT COUNT(*) FROM chess_bracket WHERE player_a_id = ${id} OR player_b_id = ${id}) AS total`;
  if (Number(usos[0].total) > 0) {
    avisar("jugadores", "Ese jugador ya tiene partidas. Desmárcalo como activo en lugar de borrarlo.");
  }

  await consulta`DELETE FROM chess_players WHERE id = ${id}`;
  actualizarVistas();
}

// ---------- Rondas del suizo ----------

export async function generarRonda() {
  await exigirSesion();
  const { jugadores, rondas, partidas, cuadro } = await cargarTorneo();

  if (cuadro.length > 0) avisar("rondas", "La eliminatoria ya ha empezado: borra el cuadro para añadir rondas.");
  if (partidas.some((p) => p.black_id !== null && !p.result)) {
    avisar("rondas", "Faltan resultados de la ronda actual.");
  }
  if (jugadores.filter((j) => j.active).length < 2) avisar("rondas", "Hacen falta al menos dos jugadores activos.");

  const emparejamientos = generarEmparejamientos(jugadores, partidas);
  const numero = (rondas.at(-1)?.number ?? 0) + 1;

  const consulta = obtenerSql();
  await consulta.transaction((tx) => [
    tx`INSERT INTO chess_rounds (number) VALUES (${numero})`,
    ...emparejamientos.map((e, i) => tx`
      INSERT INTO chess_games (round_id, board, white_id, black_id)
      SELECT id, ${i + 1}, ${e.blancas}, ${e.negras} FROM chess_rounds WHERE number = ${numero}`),
  ]);
  actualizarVistas();
}

export async function borrarUltimaRonda() {
  await exigirSesion();
  const consulta = obtenerSql();
  const cuadro = await consulta`SELECT COUNT(*) AS total FROM chess_bracket`;
  if (Number(cuadro[0].total) > 0) avisar("rondas", "Borra antes el cuadro de la eliminatoria.");

  await consulta`DELETE FROM chess_rounds WHERE number = (SELECT MAX(number) FROM chess_rounds)`;
  actualizarVistas();
}

const RESULTADOS_VALIDOS: Resultado[] = ["1-0", "0-1", "1/2-1/2"];

// Guarda de golpe todas las partidas de una ronda
export async function guardarRonda(datos: FormData) {
  await exigirSesion();
  const ids = datos.getAll("partida").map(Number).filter(Number.isInteger);

  const partidas = ids.map((id) => {
    const textoResultado = leerTexto(datos, `resultado_${id}`);
    const negras = leerEntero(datos, `negras_${id}`);
    return {
      id,
      blancas: leerEntero(datos, `blancas_${id}`),
      negras,
      // En un descanso no hay resultado
      resultado: negras !== null && RESULTADOS_VALIDOS.includes(textoResultado as Resultado) ? textoResultado : null,
    };
  });

  const usados = new Set<number>();
  for (const p of partidas) {
    if (p.blancas === null) avisar("rondas", "Falta el jugador de blancas en alguna mesa.");
    if (p.blancas === p.negras) avisar("rondas", "Un jugador no puede jugar contra sí mismo.");
    for (const jugador of [p.blancas, p.negras]) {
      if (jugador === null) continue;
      if (usados.has(jugador)) avisar("rondas", "Hay un jugador en dos mesas de la misma ronda.");
      usados.add(jugador);
    }
  }

  const consulta = obtenerSql();
  await consulta.transaction((tx) => partidas.map((p) => tx`
    UPDATE chess_games
    SET white_id = ${p.blancas}, black_id = ${p.negras}, result = ${p.resultado}
    WHERE id = ${p.id}`));
  actualizarVistas();
}

// ---------- Eliminatoria ----------

export async function crearCuadro(datos: FormData) {
  await exigirSesion();
  const clasificados = leerEntero(datos, "clasificados");
  if (clasificados !== 2 && clasificados !== 4 && clasificados !== 8) avisar("eliminatoria", "Tamaño de cuadro no válido.");

  const { jugadores, partidas, cuadro } = await cargarTorneo();
  if (cuadro.length > 0) avisar("eliminatoria", "Ya hay un cuadro creado.");
  if (partidas.length === 0) avisar("eliminatoria", "Juega al menos una ronda del suizo antes.");
  if (partidas.some((p) => p.black_id !== null && !p.result)) avisar("eliminatoria", "Faltan resultados del suizo.");

  const clasificacion = calcularClasificacion(jugadores.filter((j) => j.active), partidas);
  if (clasificacion.length < clasificados) avisar("eliminatoria", `Hacen falta ${clasificados} jugadores activos.`);

  const { stage, seeds } = sembrarCuadro(clasificados);
  const jugadorEnPuesto = (puesto: number) => clasificacion[puesto - 1].jugador.id;

  // Cruces de la primera fase con jugadores, y las fases siguientes vacías
  const consulta = obtenerSql();
  const inserciones = seeds.map(([a, b], slot) => consulta`
    INSERT INTO chess_bracket (stage, slot, player_a_id, player_b_id, seed_a, seed_b)
    VALUES (${stage}, ${slot}, ${jugadorEnPuesto(a)}, ${jugadorEnPuesto(b)}, ${a}, ${b})`);

  let fase = faseSiguiente(stage);
  let cruces = seeds.length / 2;
  while (fase) {
    for (let slot = 0; slot < cruces; slot++) {
      inserciones.push(consulta`INSERT INTO chess_bracket (stage, slot) VALUES (${fase}, ${slot})`);
    }
    fase = faseSiguiente(fase);
    cruces /= 2;
  }

  await consulta.transaction(inserciones);
  actualizarVistas();
}

export async function guardarCruce(datos: FormData) {
  await exigirSesion();
  const id = leerEntero(datos, "id");
  const ganador = leerEntero(datos, "ganador");
  const nota = leerTexto(datos, "nota") || null;

  const consulta = obtenerSql();
  const filas = (await consulta`SELECT * FROM chess_bracket WHERE id = ${id}`) as Cruce[];
  const cruce = filas[0];
  if (!cruce) avisar("eliminatoria", "Ese cruce no existe.");
  if (ganador !== null && ganador !== cruce.player_a_id && ganador !== cruce.player_b_id) {
    avisar("eliminatoria", "El ganador tiene que ser uno de los dos jugadores del cruce.");
  }

  await consulta`UPDATE chess_bracket SET winner_id = ${ganador}, note = ${nota} WHERE id = ${id}`;
  const semilla = ganador === null ? null : ganador === cruce.player_a_id ? cruce.seed_a : cruce.seed_b;
  await pasarDeRonda(cruce.stage, cruce.slot, ganador, semilla);
  actualizarVistas();
}

// Coloca al ganador en el cruce de la fase siguiente. Si cambia quién estaba,
// el resultado y el marcador de ese cruce dejan de valer y se limpian hacia delante.
async function pasarDeRonda(fase: Fase, slot: number, jugador: number | null, semilla: number | null) {
  const siguiente = faseSiguiente(fase);
  if (!siguiente) return;

  const consulta = obtenerSql();
  const destino = Math.floor(slot / 2);
  const filas = (await consulta`SELECT * FROM chess_bracket WHERE stage = ${siguiente} AND slot = ${destino}`) as Cruce[];
  const cruce = filas[0];
  if (!cruce) return;

  const enA = slot % 2 === 0;
  const actual = enA ? cruce.player_a_id : cruce.player_b_id;
  if (actual === jugador) return;

  if (enA) {
    await consulta`UPDATE chess_bracket SET player_a_id = ${jugador}, seed_a = ${semilla}, winner_id = NULL, note = NULL WHERE id = ${cruce.id}`;
  } else {
    await consulta`UPDATE chess_bracket SET player_b_id = ${jugador}, seed_b = ${semilla}, winner_id = NULL, note = NULL WHERE id = ${cruce.id}`;
  }
  if (cruce.winner_id !== null) await pasarDeRonda(siguiente, destino, null, null);
}

export async function borrarCuadro() {
  await exigirSesion();
  await obtenerSql()`DELETE FROM chess_bracket`;
  actualizarVistas();
}
