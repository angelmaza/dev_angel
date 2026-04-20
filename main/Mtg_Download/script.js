const api = "https://api.scryfall.com";

const state = {
  lang: document.body.dataset.langDefault || "en",
};

const textos = {
  en: {
    titulo: "MTG PNG Downloader",
    aviso: "If something breaks, I am not responsible :)",
    instrucciones: "Paste Moxfield list. If sideboard is included, it will be downloaded.",
    botonBuscar: "Search and download",
    botonDescargar: "Download all cards",
    lateralIzqTitulo: "How to use it",
    lateralIzqTexto: "Go to Moxfield. Click to export your deck list. Copy for moxfield.",
    lateralDerTitulo: "Notes",
    lateralDerTexto: "Images downloaded using the Scryfall API.",
    placeholder:
      "1 Giada, Font of Hope (FDN) 141\n1 Akroma's Will (M3C) 165\n1 Angel of Destiny (PZNR) 2p *F*",
    esperando: "Waiting...",
    generando: "Generating ZIP...",
    completado: "Download completed.",
    descargando: (nombre, actual, total) => `Downloading ${nombre} (${actual}/${total})...`,
    total: (n) => `Total of <strong>${n} cards</strong>. Double-faced cards count as 2.`,
    noEncontrada: (nombre) => `<h4>Warning: ${nombre} was not found. Download it manually.</h4>`,
    sinImagen: (nombre) => `<p>No images available for <em>${nombre}</em>.</p>`,
  },
  es: {
    titulo: "Descargador PNG MTG",
    aviso: "Si algo malo pasa, no me hago responsable :)",
    instrucciones: "Pegad lista de moxfield. Si dejas sideboard también lo descarga.",
    botonBuscar: "Búsqueda descargar",
    botonDescargar: "Descargar todas (máxima calidad)",
    lateralIzqTitulo: "Cómo usarlo",
    lateralIzqTexto: "Ve a moxfield, click en exportar en la página de tu mazo luego clicka en copiar para moxfield.",
    lateralDerTitulo: "Notas",
    lateralDerTexto: "Imagenes descargadas usando la API de Scryfall. Si una carta no tiene una imagen buena en español, intentará usar una versión inglesa de mayor calidad. Si optas por ingles todas se descargaran en ENG",
    placeholder:
      "1 Giada, Font of Hope (FDN) 141\n1 Akroma's Will (M3C) 165\n1 Angel of Destiny (PZNR) 2p *F*",
    esperando: "Esperando descarga...",
    generando: "Generando archivo ZIP...",
    completado: "Descarga completada.",
    descargando: (nombre, actual, total) => `Descargando ${nombre} (${actual}/${total})...`,
    total: (n) => `Total de <strong>${n}</strong> cartas (las dobles cuentan como 2)`,
    noEncontrada: (nombre) => `<h4>Te aviso, no se ha encontrado ${nombre}, descárgate el png a mano</h4>`,
    sinImagen: (nombre) => `<p>Sin imágenes disponibles para <em>${nombre}</em>.</p>`,
    noExisteES: (nombre) =>
      `<p>No existe impresión en <strong>ES</strong> para <em>${nombre}</em>. Se usa la impresión por defecto.</p>`,
    fallbackEN: (nombre) =>
      `<p>Para <em>${nombre}</em>, la imagen en ES era de baja calidad. Se sustituyó por una imagen en <strong>EN</strong>.</p>`,
  },
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

document.addEventListener("DOMContentLoaded", () => {
  aplicarIdioma(state.lang);
});

function cambiarIdioma(lang) {
  state.lang = lang;
  aplicarIdioma(lang);
}
window.cambiarIdioma = cambiarIdioma;

function aplicarIdioma(lang) {
  const t = textos[lang];

  document.documentElement.lang = lang === "es" ? "es" : "en";
  document.getElementById("titulo-app").textContent = t.titulo;
  document.getElementById("aviso-app").textContent = t.aviso;
  document.getElementById("instrucciones-app").textContent = t.instrucciones;
  document.getElementById("boton-busqueda").textContent = t.botonBuscar;
  document.getElementById("titulo-lateral-izq").textContent = t.lateralIzqTitulo;
  document.getElementById("texto-lateral-izq").textContent = t.lateralIzqTexto;
  document.getElementById("titulo-lateral-der").textContent = t.lateralDerTitulo;
  document.getElementById("texto-lateral-der").textContent = t.lateralDerTexto;
  document.getElementById("cartas").placeholder = t.placeholder;
  document.getElementById("estado").textContent = t.esperando;

  const botonEn = document.getElementById("boton-en");
  const botonEs = document.getElementById("boton-es");

  botonEn.classList.toggle("activo", lang === "en");
  botonEs.classList.toggle("activo", lang === "es");

  botonEn.setAttribute("aria-pressed", String(lang === "en"));
  botonEs.setAttribute("aria-pressed", String(lang === "es"));
}

async function buscarimg() {
  if (state.lang === "es") {
    await buscarimgES();
    return;
  }

  await buscarimgEN();
}
window.buscarimg = buscarimg;

function limpiarUI() {
  document.getElementById("error").innerHTML = "";
  document.getElementById("num_cartas").innerHTML = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("zonaboton").innerHTML = "";
  document.getElementById("divprogreso").style.display = "none";
  document.getElementById("estado").textContent = textos[state.lang].esperando;
}

function procesarCartas() {
  const texto = document.getElementById("cartas").value.trim();
  const lineas = texto.split("\n");

  return lineas
    .map((linea) => {
      const linea_bien = linea.replace(/\*\S+\*/g, "").trim();
      const match = linea_bien.match(/^\d+\s+(.+?)\s+\(([^)]+)\)\s+(\S+)$/);

      if (match) {
        return {
          nombre: match[1].trim(),
          codigo: match[2].trim(),
          numero: match[3].trim(),
        };
      }

      if (linea_bien) {
        return {
          nombre: linea_bien,
          codigo: "",
          numero: "",
        };
      }

      return null;
    })
    .filter(Boolean);
}

async function buscarimgEN() {
  limpiarUI();

  const cartas = procesarCartas();
  const cartas_final = [];
  const cajaerror = document.getElementById("error");
  const cajaContador = document.getElementById("num_cartas");
  let contadorPngs = 0;

  await Promise.all(
    cartas.map(async (carta) => {
      const codigo_set = carta.codigo;
      const numero_carta = carta.numero;

      if (!codigo_set || !numero_carta) {
        cajaerror.innerHTML += textos.en.noEncontrada(carta.nombre);
        return;
      }

      const endpoint = `${api}/cards/${encodeURIComponent(codigo_set)}/${encodeURIComponent(numero_carta)}`;

      try {
        await delay(100);

        const response = await fetch(endpoint, {
          headers: {
            "User-Agent": "MTGSearchApp/1.0",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error en la búsqueda: " + response.statusText);
        }

        const data = await response.json();

        if (data.card_faces && (data.layout === "transform" || data.layout === "modal_dfc")) {
          data.card_faces.forEach((face) => {
            cartas_final.push([
              face.name,
              face.image_uris?.normal || face.image_uris?.large || face.image_uris?.small,
              face.image_uris?.png || face.image_uris?.large || face.image_uris?.normal,
            ]);
            contadorPngs++;
          });
        } else {
          cartas_final.push([
            data.name,
            data.image_uris?.normal || data.image_uris?.large || data.image_uris?.small,
            data.image_uris?.png || data.image_uris?.large || data.image_uris?.normal,
          ]);
          contadorPngs++;
        }
      } catch (error) {
        console.error(`❌ Fallo con ${carta.nombre}: ${error.message}`);
        cajaerror.innerHTML += textos.en.noEncontrada(carta.nombre);
      }
    })
  );

  cajaContador.innerHTML = textos.en.total(contadorPngs);
  mostrarlistacartas(cartas_final);
}

const preferredLang = "es";
const politeDelayMs = 120;

function imageQualityRank(image_uris) {
  if (!image_uris) return 0;
  if (image_uris.png) return 3;
  if (image_uris.large) return 2;
  if (image_uris.normal) return 1;
  return 0;
}

function pickBestImage(image_uris) {
  const display = image_uris?.large || image_uris?.normal || image_uris?.small || null;
  const download = image_uris?.png || image_uris?.large || image_uris?.normal || image_uris?.small || null;
  return { display, download, rank: imageQualityRank(image_uris) };
}

function normalizeCardToEntriesWithFallback(esCard, enFallbackCard) {
  const entries = [];
  const isDFC =
    esCard.card_faces &&
    (esCard.layout === "transform" || esCard.layout === "modal_dfc" || esCard.layout === "double_faced_token");

  if (isDFC) {
    const esFaces = esCard.card_faces;
    const enFaces = enFallbackCard?.card_faces || null;

    esFaces.forEach((face, idx) => {
      const esPick = pickBestImage(face.image_uris || {});
      let display = esPick.display;
      let download = esPick.download;

      if (esPick.rank === 0 && enFallbackCard) {
        const enFace = enFaces ? enFaces[idx] : null;
        const enPick = pickBestImage((enFace ? enFace.image_uris : enFallbackCard.image_uris) || {});
        if (enPick.rank > esPick.rank) {
          display = enPick.display;
          download = enPick.download;
        }
      }

      const shownName = face.printed_name || face.name;
      if (display || download) {
        entries.push([shownName, display, download || display]);
      }
    });
  } else {
    const esPick = pickBestImage(esCard.image_uris || esCard.card_faces?.[0]?.image_uris || {});
    let display = esPick.display;
    let download = esPick.download;

    if (esPick.rank === 0 && enFallbackCard) {
      const enPick = pickBestImage(enFallbackCard.image_uris || enFallbackCard.card_faces?.[0]?.image_uris || {});
      if (enPick.rank > esPick.rank) {
        display = enPick.display;
        download = enPick.download;
      }
    }

    const shownName = esCard.printed_name || esCard.name;
    if (display || download) {
      entries.push([shownName, display, download || display]);
    }
  }

  return entries;
}

async function fetchByExactName(name) {
  const url = `${api}/cards/named?exact=${encodeURIComponent(name)}`;
  const resp = await fetch(url, { headers: { Accept: "application/json" } });
  if (!resp.ok) throw new Error(`named?exact fallo: ${resp.status} ${resp.statusText}`);
  return resp.json();
}

async function fetchPrintsByOracleAndLang(oracleId, lang) {
  const results = [];
  let next = `${api}/cards/search?q=${encodeURIComponent(`oracleid:${oracleId} lang:${lang}`)}&unique=prints`;

  while (next) {
    const resp = await fetch(next, { headers: { Accept: "application/json" } });
    if (!resp.ok) throw new Error(`search ${lang} fallo: ${resp.status} ${resp.statusText}`);
    const data = await resp.json();
    (data.data || []).forEach((c) => results.push(c));
    next = data.has_more ? data.next_page : null;
    if (next) await delay(80);
  }

  return results;
}

function chooseBestPrint(cards) {
  if (!cards || cards.length === 0) return null;

  const scored = cards.map((c) => {
    const iu = c.image_uris || c.card_faces?.[0]?.image_uris || {};
    const rank = imageQualityRank(iu);
    const highres = !!c.highres_image;
    const isPromo = c.set_type === "promo";
    const released = c.released_at || "1900-01-01";
    const score = rank + (highres ? 1 : 0) - (isPromo ? 0.5 : 0);
    return { c, score, released };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.released || "").localeCompare(a.released || "");
  });

  return scored[0].c;
}

async function buscarimgES() {
  limpiarUI();

  const cartas = procesarCartas();
  const cartas_final = [];
  const cajaerror = document.getElementById("error");
  const cajaContador = document.getElementById("num_cartas");
  let contadorPngs = 0;

  await Promise.all(
    cartas.map(async (carta) => {
      const { nombre } = carta;

      try {
        await delay(politeDelayMs);

        const base = await fetchByExactName(nombre);
        const oracleId = base.oracle_id;

        const printsEs = await fetchPrintsByOracleAndLang(oracleId, preferredLang);
        let chosenES = chooseBestPrint(printsEs);

        if (!chosenES) {
          chosenES = base;
          cajaerror.innerHTML += textos.es.noExisteES(nombre);
        }

        let needEN = false;

        if (
          chosenES.card_faces &&
          (chosenES.layout === "transform" || chosenES.layout === "modal_dfc" || chosenES.layout === "double_faced_token")
        ) {
          for (const face of chosenES.card_faces) {
            const rank = imageQualityRank(face.image_uris || {});
            if (rank === 0) {
              needEN = true;
              break;
            }
          }
        } else {
          const rank = imageQualityRank(chosenES.image_uris || chosenES.card_faces?.[0]?.image_uris || {});
          if (rank === 0) needEN = true;
        }

        let chosenEN = null;

        if (needEN) {
          const printsEn = await fetchPrintsByOracleAndLang(oracleId, "en");
          chosenEN = chooseBestPrint(printsEn) || null;

          if (chosenEN) {
            cajaerror.innerHTML += textos.es.fallbackEN(nombre);
          }
        }

        const entries = normalizeCardToEntriesWithFallback(chosenES, chosenEN);

        if (entries.length === 0) {
          cajaerror.innerHTML += textos.es.sinImagen(nombre);
          return;
        }

        entries.forEach((e) => cartas_final.push(e));
        contadorPngs += entries.length;
      } catch (error) {
        console.error(`❌ Error con ${nombre}:`, error);
        cajaerror.innerHTML += textos.es.noEncontrada(nombre);
      }
    })
  );

  cajaContador.innerHTML = textos.es.total(contadorPngs);
  mostrarlistacartas(cartas_final);
}

function mostrarlistacartas(cartas_final) {
  const contenedor = document.getElementById("resultado");
  contenedor.innerHTML = "";

  cartas_final.forEach((carta) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const nombre = document.createElement("p");
    nombre.textContent = carta[0];
    nombre.classList.add("card-nombre");

    const imagen = document.createElement("img");
    imagen.src = carta[1];
    imagen.loading = "lazy";
    imagen.decoding = "async";
    imagen.classList.add("card-imagen");

    card.appendChild(nombre);
    card.appendChild(imagen);
    contenedor.appendChild(card);
  });

  const downloadButton = document.createElement("button");
  downloadButton.className = "boton-descarga";
  downloadButton.textContent = textos[state.lang].botonDescargar;
  downloadButton.addEventListener("click", () => descargarTodasLasCartas(cartas_final));

  const cajaboton = document.getElementById("zonaboton");
  cajaboton.innerHTML = "";
  cajaboton.prepend(downloadButton);
}

async function descargarTodasLasCartas(cartas_final) {
  const zip = new JSZip();
  const folder = zip.folder("cards");
  const divprogreso = document.getElementById("divprogreso");
  let progreso = document.getElementById("progreso");
  let estado = document.getElementById("estado");

  divprogreso.style.display = "block";

  progreso.max = cartas_final.length;
  progreso.value = 0;

  for (let i = 0; i < cartas_final.length; i++) {
    const [nombre, , urlDescarga] = cartas_final[i];

    try {
      estado.textContent = textos[state.lang].descargando(nombre, i + 1, cartas_final.length);

      const response = await fetch(urlDescarga);
      if (!response.ok) {
        throw new Error(`Error al descargar: ${nombre}`);
      }

      const blob = await response.blob();
      const safeName = (nombre || "carta").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
      folder.file(`${String(i).padStart(3, "0")}_${safeName}.png`, blob);

      progreso.value = i + 1;
    } catch (error) {
      console.error(`Error descargando ${nombre}:`, error);
    }

    await delay(80);
  }

  estado.textContent = textos[state.lang].generando;
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "cards.zip");
  estado.textContent = textos[state.lang].completado;
}