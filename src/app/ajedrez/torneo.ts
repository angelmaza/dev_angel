// Lógica pura del torneo: clasificación con desempates, emparejamientos suizos y cuadro.
// No toca la base de datos; la usan tanto la vista pública como el panel.

export type Resultado = "1-0" | "0-1" | "1/2-1/2";
export type Fase = "cuartos" | "semis" | "final";

export interface Jugador {
  id: number;
  name: string;
  active: boolean;
}

export interface Ronda {
  id: number;
  number: number;
}

export interface Partida {
  id: number;
  round_id: number;
  ronda: number;
  board: number;
  white_id: number;
  black_id: number | null;
  result: Resultado | null;
}

export interface Cruce {
  id: number;
  stage: Fase;
  slot: number;
  player_a_id: number | null;
  player_b_id: number | null;
  seed_a: number | null;
  seed_b: number | null;
  winner_id: number | null;
  note: string | null;
}

export interface FilaClasificacion {
  puesto: number;
  jugador: Jugador;
  puntos: number;
  jugadas: number;
  victorias: number;
  buchholz: number;
  sonneborn: number;
}

export const FASES: Fase[] = ["cuartos", "semis", "final"];

export const NOMBRE_FASE: Record<Fase, string> = {
  cuartos: "Cuartos",
  semis: "Semifinales",
  final: "Final",
};

// Puntos del descanso (bye)
const PUNTOS_BYE = 1;

export function mostrarPuntos(puntos: number): string {
  const entero = Math.floor(puntos);
  const medio = puntos - entero >= 0.5;
  if (!medio) return String(entero);
  return entero === 0 ? "½" : `${entero}½`;
}

export function mostrarResultado(resultado: Resultado | null): string {
  if (resultado === "1/2-1/2") return "½ – ½";
  if (resultado === "1-0") return "1 – 0";
  if (resultado === "0-1") return "0 – 1";
  return "–";
}

// Puntos que obtiene cada color con un resultado
function puntosDe(resultado: Resultado): [number, number] {
  if (resultado === "1-0") return [1, 0];
  if (resultado === "0-1") return [0, 1];
  return [0.5, 0.5];
}

// Historial de un jugador a partir de las partidas
interface Historial {
  puntos: number;
  jugadas: number;
  victorias: number;
  byes: number;
  rivales: Set<number>;
  // Resultados contra cada rival para el Sonneborn-Berger: [rival, puntos obtenidos]
  enfrentamientos: [number, number][];
  // Blancas menos negras, y último color jugado
  balanceColor: number;
  ultimoColor: "b" | "n" | null;
}

function calcularHistoriales(jugadores: Jugador[], partidas: Partida[]): Map<number, Historial> {
  const historiales = new Map<number, Historial>();
  for (const j of jugadores) {
    historiales.set(j.id, {
      puntos: 0, jugadas: 0, victorias: 0, byes: 0,
      rivales: new Set(), enfrentamientos: [], balanceColor: 0, ultimoColor: null,
    });
  }

  const ordenadas = [...partidas].sort((a, b) => a.ronda - b.ronda || a.board - b.board);
  for (const p of ordenadas) {
    const blancas = historiales.get(p.white_id);
    if (!blancas) continue;

    if (p.black_id === null) {
      blancas.byes++;
      blancas.puntos += PUNTOS_BYE;
      continue;
    }

    const negras = historiales.get(p.black_id);
    if (!negras) continue;

    // El emparejamiento cuenta (rivales y colores) aunque no haya resultado todavía
    blancas.rivales.add(p.black_id);
    negras.rivales.add(p.white_id);
    blancas.balanceColor++;
    negras.balanceColor--;
    blancas.ultimoColor = "b";
    negras.ultimoColor = "n";

    if (!p.result) continue;
    const [pb, pn] = puntosDe(p.result);
    blancas.puntos += pb;
    negras.puntos += pn;
    blancas.jugadas++;
    negras.jugadas++;
    if (pb === 1) blancas.victorias++;
    if (pn === 1) negras.victorias++;
    blancas.enfrentamientos.push([p.black_id, pb]);
    negras.enfrentamientos.push([p.white_id, pn]);
  }
  return historiales;
}

// Clasificación ordenada por: puntos, Buchholz, Sonneborn-Berger, victorias, nombre
export function calcularClasificacion(jugadores: Jugador[], partidas: Partida[]): FilaClasificacion[] {
  const historiales = calcularHistoriales(jugadores, partidas);
  const puntosDeJugador = (id: number) => historiales.get(id)?.puntos ?? 0;

  const filas = jugadores.map((jugador) => {
    const h = historiales.get(jugador.id)!;
    const buchholz = h.enfrentamientos.reduce((suma, [rival]) => suma + puntosDeJugador(rival), 0);
    const sonneborn = h.enfrentamientos.reduce((suma, [rival, obtenidos]) => suma + obtenidos * puntosDeJugador(rival), 0);
    return { puesto: 0, jugador, puntos: h.puntos, jugadas: h.jugadas, victorias: h.victorias, buchholz, sonneborn };
  });

  filas.sort((a, b) =>
    b.puntos - a.puntos ||
    b.buchholz - a.buchholz ||
    b.sonneborn - a.sonneborn ||
    b.victorias - a.victorias ||
    a.jugador.name.localeCompare(b.jugador.name)
  );

  filas.forEach((fila, i) => {
    const anterior = filas[i - 1];
    const empatado = anterior &&
      anterior.puntos === fila.puntos &&
      anterior.buchholz === fila.buchholz &&
      anterior.sonneborn === fila.sonneborn &&
      anterior.victorias === fila.victorias;
    fila.puesto = empatado ? anterior.puesto : i + 1;
  });
  return filas;
}

export interface Emparejamiento {
  blancas: number;
  negras: number | null;
}

// Emparejamientos de la siguiente ronda (sistema suizo simplificado):
// - ronda 1: por orden de inscripción, mitad superior contra mitad inferior;
// - después: por puntos, sin repetir rival si es posible (con vuelta atrás);
// - si son impares, descansa el peor clasificado que aún no haya descansado;
// - color: juega con blancas quien haya llevado menos veces blancas.
export function generarEmparejamientos(jugadores: Jugador[], partidas: Partida[]): Emparejamiento[] {
  const activos = jugadores.filter((j) => j.active);
  const historiales = calcularHistoriales(jugadores, partidas);
  const esPrimeraRonda = partidas.length === 0;

  // Orden de emparejamiento
  const orden = esPrimeraRonda
    ? [...activos].sort((a, b) => a.id - b.id)
    : calcularClasificacion(activos, partidas).map((f) => f.jugador);
  const ids = orden.map((j) => j.id);

  // Descanso
  let descansa: number | null = null;
  if (ids.length % 2 === 1) {
    const candidatos = [...ids].reverse();
    descansa = candidatos.find((id) => historiales.get(id)!.byes === 0) ?? candidatos[0];
    ids.splice(ids.indexOf(descansa), 1);
  }

  let parejas: [number, number][];
  if (esPrimeraRonda) {
    const mitad = ids.length / 2;
    parejas = ids.slice(0, mitad).map((id, i) => [id, ids[mitad + i]]);
  } else {
    parejas =
      emparejarSinRepetir(ids, (a, b) => !historiales.get(a)!.rivales.has(b)) ??
      emparejarSinRepetir(ids, () => true)!;
  }

  const resultado: Emparejamiento[] = parejas.map(([a, b], i) => {
    if (esPrimeraRonda) {
      // Alternar colores por tablero
      return i % 2 === 0 ? { blancas: a, negras: b } : { blancas: b, negras: a };
    }
    return asignarColores(a, b, historiales);
  });

  if (descansa !== null) resultado.push({ blancas: descansa, negras: null });
  return resultado;
}

// Empareja la lista en orden con vuelta atrás: el primero libre con el siguiente compatible
function emparejarSinRepetir(ids: number[], compatibles: (a: number, b: number) => boolean): [number, number][] | null {
  let intentos = 0;
  const LIMITE = 200000;

  function buscar(libres: number[]): [number, number][] | null {
    if (libres.length === 0) return [];
    if (++intentos > LIMITE) return null;
    const [primero, ...resto] = libres;
    for (let i = 0; i < resto.length; i++) {
      if (!compatibles(primero, resto[i])) continue;
      const sub = buscar([...resto.slice(0, i), ...resto.slice(i + 1)]);
      if (sub) return [[primero, resto[i]], ...sub];
    }
    return null;
  }

  return buscar(ids);
}

function asignarColores(a: number, b: number, historiales: Map<number, Historial>): Emparejamiento {
  const ha = historiales.get(a)!;
  const hb = historiales.get(b)!;
  if (ha.balanceColor !== hb.balanceColor) {
    return ha.balanceColor < hb.balanceColor ? { blancas: a, negras: b } : { blancas: b, negras: a };
  }
  if (ha.ultimoColor !== hb.ultimoColor) {
    if (ha.ultimoColor === "n" || hb.ultimoColor === "b") return { blancas: a, negras: b };
    return { blancas: b, negras: a };
  }
  // Mismo historial de colores: blancas para el mejor clasificado
  return { blancas: a, negras: b };
}

// Cruces iniciales de la eliminatoria con siembra clásica (1-8, 4-5, 3-6, 2-7 / 1-4, 2-3)
export function sembrarCuadro(clasificados: number): { stage: Fase; seeds: [number, number][] } {
  if (clasificados === 8) return { stage: "cuartos", seeds: [[1, 8], [4, 5], [3, 6], [2, 7]] };
  if (clasificados === 4) return { stage: "semis", seeds: [[1, 4], [2, 3]] };
  return { stage: "final", seeds: [[1, 2]] };
}

export function faseSiguiente(fase: Fase): Fase | null {
  const i = FASES.indexOf(fase);
  return i < FASES.length - 1 ? FASES[i + 1] : null;
}
