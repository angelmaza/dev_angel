import { neon } from "@neondatabase/serverless";
import type { Cruce, Jugador, Partida, Ronda } from "./torneo";

// Consultas del torneo en Neon. Las tablas se crean con tablas.sql.

export function obtenerSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL: el torneo necesita la base de datos.");
  return neon(url);
}

export interface EstadoTorneo {
  jugadores: Jugador[];
  rondas: Ronda[];
  partidas: Partida[];
  cuadro: Cruce[];
}

export async function cargarTorneo(): Promise<EstadoTorneo> {
  const consulta = obtenerSql();
  const [jugadores, rondas, partidas, cuadro] = await consulta.transaction([
    consulta`SELECT id, name, active FROM chess_players ORDER BY name`,
    consulta`SELECT id, number FROM chess_rounds ORDER BY number`,
    consulta`SELECT g.id, g.round_id, r.number AS ronda, g.board, g.white_id, g.black_id, g.result
             FROM chess_games g JOIN chess_rounds r ON r.id = g.round_id
             ORDER BY r.number, g.board`,
    consulta`SELECT id, stage, slot, player_a_id, player_b_id, seed_a, seed_b, winner_id, note
             FROM chess_bracket ORDER BY slot`,
  ], { readOnly: true });

  return {
    jugadores: jugadores as Jugador[],
    rondas: rondas as Ronda[],
    partidas: partidas as Partida[],
    cuadro: cuadro as Cruce[],
  };
}
