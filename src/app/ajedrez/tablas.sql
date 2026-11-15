-- Tablas del torneo de ajedrez (sección /ajedrez).
-- Se pueden ejecutar varias veces: solo crean lo que falta.

-- Jugadores inscritos. "active" = false si se retira (no entra en nuevos emparejamientos).
CREATE TABLE IF NOT EXISTS chess_players (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rondas del suizo.
CREATE TABLE IF NOT EXISTS chess_rounds (
  id         SERIAL PRIMARY KEY,
  number     INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partidas del suizo. black_id NULL = el blanco descansa (bye, 1 punto).
-- result: '1-0', '0-1', '1/2-1/2' o NULL si aún no se ha jugado.
CREATE TABLE IF NOT EXISTS chess_games (
  id       SERIAL PRIMARY KEY,
  round_id INTEGER NOT NULL REFERENCES chess_rounds(id) ON DELETE CASCADE,
  board    INTEGER NOT NULL,
  white_id INTEGER NOT NULL REFERENCES chess_players(id),
  black_id INTEGER REFERENCES chess_players(id),
  result   TEXT CHECK (result IN ('1-0', '0-1', '1/2-1/2'))
);

CREATE INDEX IF NOT EXISTS chess_games_round_idx ON chess_games(round_id);

-- Eliminatoria. stage: 'cuartos', 'semis' o 'final'. slot: posición dentro de la fase (0, 1, ...).
-- El ganador de (stage, slot) pasa a la fase siguiente, slot / 2.
-- seed_a / seed_b: puesto en la clasificación del suizo. note: texto libre (p. ej. "1½-½").
CREATE TABLE IF NOT EXISTS chess_bracket (
  id          SERIAL PRIMARY KEY,
  stage       TEXT NOT NULL CHECK (stage IN ('cuartos', 'semis', 'final')),
  slot        INTEGER NOT NULL,
  player_a_id INTEGER REFERENCES chess_players(id),
  player_b_id INTEGER REFERENCES chess_players(id),
  seed_a      INTEGER,
  seed_b      INTEGER,
  winner_id   INTEGER REFERENCES chess_players(id),
  note        TEXT,
  UNIQUE (stage, slot)
);
