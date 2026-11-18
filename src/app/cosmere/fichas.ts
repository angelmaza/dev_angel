// Ficha de cada libro que sale al pasar el ratón: páginas y un resumen muy breve, sin destripes.
// La clave es el título en inglés (tituloEn de LIBROS).
// paginas: aproximadas, primera edición en inglés. Sin paginas, la ficha dice que aún no ha salido.

export interface Ficha {
  paginas?: number;
  resumen: string;
  resumenEn: string;
}

export const FICHAS: Record<string, Ficha> = {
  "Elantris": {
    paginas: 496,
    resumen: "Un príncipe es maldecido y encerrado en Elantris, la ciudad de los dioses caídos.",
    resumenEn: "A prince is cursed and cast into Elantris, the city of fallen gods.",
  },
  "The Final Empire": {
    paginas: 541,
    resumen: "Una ladrona callejera se une a una banda que quiere derrocar a un emperador inmortal.",
    resumenEn: "A street thief joins a crew planning to overthrow an immortal emperor.",
  },
  "Warbreaker": {
    paginas: 592,
    resumen: "Dos princesas, dioses que vuelven a la vida y una magia que se alimenta de color.",
    resumenEn: "Two princesses, returned gods and a magic fuelled by colour.",
  },
  "The Well of Ascension": {
    paginas: 590,
    resumen: "Caído el imperio, toca gobernar una ciudad sitiada por tres ejércitos.",
    resumenEn: "With the empire fallen, a besieged city must somehow be governed.",
  },
  "The Hero of Ages": {
    paginas: 572,
    resumen: "El mundo se apaga y queda poco tiempo para entender qué se ha desatado.",
    resumenEn: "The world is dying, and there is little time to understand what was unleashed.",
  },
  "Secret History": {
    paginas: 180,
    resumen: "La trilogía de Nacidos de la Bruma vista desde detrás del telón.",
    resumenEn: "The Mistborn trilogy seen from behind the curtain.",
  },
  "The Hope of Elantris": {
    paginas: 15,
    resumen: "Relato corto: una escena paralela a la noche más dura de Elantris.",
    resumenEn: "Short story: a side scene during Elantris's darkest night.",
  },
  "The Eleventh Metal": {
    paginas: 20,
    resumen: "Relato corto: Kelsier aprende alomancia tras escapar de los Pozos.",
    resumenEn: "Short story: Kelsier learns Allomancy after escaping the Pits.",
  },
  "Sixth of the Dusk": {
    paginas: 70,
    resumen: "Un trampero de una isla mortal topa con forasteros que traen un mundo nuevo.",
    resumenEn: "A trapper on a deadly island meets outsiders who bring a new world.",
  },
  "Shadows for Silence in the Forests of Hell": {
    paginas: 70,
    resumen: "Una posadera caza recompensas en un bosque donde las sombras matan.",
    resumenEn: "An innkeeper hunts bounties in a forest where shadows kill.",
  },
  "The Emperor's Soul": {
    paginas: 175,
    resumen: "Una falsificadora tiene cien días para recrear el alma de un emperador.",
    resumenEn: "A forger has one hundred days to recreate an emperor's soul.",
  },
  "The Alloy of Law": {
    paginas: 332,
    resumen: "Trescientos años después: alomancia, revólveres y un justiciero de frontera.",
    resumenEn: "Three centuries later: Allomancy, revolvers and a frontier lawman.",
  },
  "The Way of Kings": {
    paginas: 1007,
    resumen: "Un mundo de altas tormentas, una guerra sin fin y los caballeros que se perdieron.",
    resumenEn: "A storm-battered world, an endless war and the knights who were lost.",
  },
  "Allomancer Jak and the Pits of Eltania": {
    paginas: 25,
    resumen: "Relato corto: las exageradas aventuras de un explorador, contadas por él mismo.",
    resumenEn: "Short story: an explorer's tall tales, told by himself.",
  },
  "Words of Radiance": {
    paginas: 1087,
    resumen: "Los antiguos juramentos vuelven mientras se acerca una tormenta nueva.",
    resumenEn: "The ancient oaths return as a new storm approaches.",
  },
  "Shadows of Self": {
    paginas: 383,
    resumen: "Un asesino que cambia de rostro amenaza la paz de Elendel.",
    resumenEn: "A face-changing killer threatens Elendel's fragile peace.",
  },
  "Edgedancer": {
    paginas: 272,
    resumen: "Novela corta: Lift, una ladronzuela muy rápida, en una misión en Tashikk.",
    resumenEn: "Novella: Lift, a very fast little thief, on a mission in Tashikk.",
  },
  "The Bands of Mourning": {
    paginas: 447,
    resumen: "Una expedición en busca de una reliquia legendaria del Lord Legislador.",
    resumenEn: "An expedition after a legendary relic of the Lord Ruler.",
  },
  "Oathbringer": {
    paginas: 1248,
    resumen: "Llega la Desolación y hay que unir a los reinos de Roshar.",
    resumenEn: "The Desolation arrives and Roshar's kingdoms must be united.",
  },
  "Dawnshard": {
    paginas: 208,
    resumen: "Novela corta: un viaje por mar a una isla de la que nadie vuelve.",
    resumenEn: "Novella: a sea voyage to an island no one returns from.",
  },
  "Rhythm of War": {
    paginas: 1232,
    resumen: "Una guerra estancada, una torre ocupada y la ciencia de la luz tormentosa.",
    resumenEn: "A stalled war, an occupied tower and the science of Stormlight.",
  },
  "The Lost Metal": {
    paginas: 528,
    resumen: "Cierre de la segunda era de Nacidos de la Bruma: una conspiración contra Elendel.",
    resumenEn: "The end of Mistborn's second era: a conspiracy against Elendel.",
  },
  "Tress of the Emerald Sea": {
    paginas: 384,
    resumen: "Una chica corriente se echa a un mar de esporas a rescatar a su amigo.",
    resumenEn: "An ordinary girl braves a sea of spores to rescue her friend.",
  },
  "Yumi and the Nightmare Painter": {
    paginas: 352,
    resumen: "Una devota de los espíritus y un pintor de pesadillas intercambian vidas.",
    resumenEn: "A spirit devotee and a nightmare painter swap lives.",
  },
  "The Sunlit Man": {
    paginas: 352,
    resumen: "Un fugitivo de la galaxia, en un planeta donde el sol abrasa al amanecer.",
    resumenEn: "A galactic fugitive on a planet where sunrise burns everything.",
  },
  "Wind and Truth": {
    paginas: 1344,
    resumen: "Diez días para decidir el destino de Roshar. Cierra el primer arco.",
    resumenEn: "Ten days to decide Roshar's fate. Ends the first arc.",
  },
  "Isles of the Emberdark": {
    paginas: 400,
    resumen: "De vuelta al planeta de Sexto: islas, pájaros y viaje entre estrellas.",
    resumenEn: "Back to Sixth's planet: islands, birds and travel between the stars.",
  },
  "The Fires of December": {
    resumen: "Los viajes de Hoid. Aún sin publicar.",
    resumenEn: "Hoid's travels. Not yet published.",
  },
};
