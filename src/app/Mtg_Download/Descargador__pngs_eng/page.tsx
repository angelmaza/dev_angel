"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "./descargador.css";

const api = "https://api.scryfall.com";

interface TextosLang {
  titulo: string;
  aviso: string;
  instrucciones: string;
  botonBuscar: string;
  botonDescargar: string;
  lateralIzqTitulo: string;
  lateralIzqTexto: string;
  lateralDerTitulo: string;
  lateralDerTexto: string;
  placeholder: string;
  esperando: string;
  generando: string;
  completado: string;
  descargando: (nombre: string, actual: number, total: number) => string;
  total: (n: number) => string;
  noEncontrada: (nombre: string) => string;
  sinImagen: (nombre: string) => string;
  noExisteES?: (nombre: string) => string;
  fallbackEN?: (nombre: string) => string;
}

const textos: { en: TextosLang; es: TextosLang } = {
  en: {
    titulo: "MTG PNG Downloader",
    aviso: "If something breaks, I am not responsible :)",
    instrucciones: "Decklist:",
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
    aviso: "Decklist:",
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function imageQualityRank(image_uris: any) {
  if (!image_uris) return 0;
  if (image_uris.png) return 3;
  if (image_uris.large) return 2;
  if (image_uris.normal) return 1;
  return 0;
}

function pickBestImage(image_uris: any) {
  const display = image_uris?.large || image_uris?.normal || image_uris?.small || null;
  const download = image_uris?.png || image_uris?.large || image_uris?.normal || image_uris?.small || null;
  return { display, download, rank: imageQualityRank(image_uris) };
}

export default function DescargadorPngsMtg() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [cartasText, setCartasText] = useState<string>(
    "1 Giada, Font of Hope (FDN) 141\n1 Akroma's Will (M3C) 165\n1 Angel of Destiny (PZNR) 2p *F*"
  );
  
  const [showProgreso, setShowProgreso] = useState<boolean>(false);
  const [progresoMax, setProgresoMax] = useState<number>(0);
  const [progresoVal, setProgresoVal] = useState<number>(0);
  const [estadoText, setEstadoText] = useState<string>("");
  
  const [errorHtml, setErrorHtml] = useState<string>("");
  const [numCartasHtml, setNumCartasHtml] = useState<string>("");
  const [cartasFinal, setCartasFinal] = useState<Array<[string, string, string]>>([]);

  const t = textos[lang];

  function cambiarIdioma(nuevoLang: "en" | "es") {
    setLang(nuevoLang);
  }

  function limpiarUI() {
    setErrorHtml("");
    setNumCartasHtml("");
    setCartasFinal([]);
    setShowProgreso(false);
    setEstadoText(textos[lang].esperando);
  }

  function procesarCartas() {
    const lineas = cartasText.trim().split("\n");

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
      .filter(Boolean) as Array<{ nombre: string; codigo: string; numero: string }>;
  }

  async function buscarimg() {
    if (lang === "es") {
      await buscarimgES();
    } else {
      await buscarimgEN();
    }
  }

  async function buscarimgEN() {
    limpiarUI();

    const cartas = procesarCartas();
    const cartas_final_local: Array<[string, string, string]> = [];
    let localErrorHtml = "";
    let contadorPngs = 0;

    await Promise.all(
      cartas.map(async (carta) => {
        const codigo_set = carta.codigo;
        const numero_carta = carta.numero;

        if (!codigo_set || !numero_carta) {
          localErrorHtml += textos.en.noEncontrada(carta.nombre);
          setErrorHtml(localErrorHtml);
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
            data.card_faces.forEach((face: any) => {
              cartas_final_local.push([
                face.name,
                face.image_uris?.normal || face.image_uris?.large || face.image_uris?.small || "",
                face.image_uris?.png || face.image_uris?.large || face.image_uris?.normal || "",
              ]);
              contadorPngs++;
            });
          } else {
            cartas_final_local.push([
              data.name,
              data.image_uris?.normal || data.image_uris?.large || data.image_uris?.small || "",
              data.image_uris?.png || data.image_uris?.large || data.image_uris?.normal || "",
            ]);
            contadorPngs++;
          }
        } catch (error: any) {
          console.error(`❌ Fallo con ${carta.nombre}: ${error.message}`);
          localErrorHtml += textos.en.noEncontrada(carta.nombre);
          setErrorHtml(localErrorHtml);
        }
      })
    );

    setNumCartasHtml(textos.en.total(contadorPngs));
    setCartasFinal(cartas_final_local);
  }

  const preferredLang = "es";
  const politeDelayMs = 120;

  function normalizeCardToEntriesWithFallback(esCard: any, enFallbackCard: any) {
    const entries: Array<[string, string, string]> = [];
    const isDFC =
      esCard.card_faces &&
      (esCard.layout === "transform" || esCard.layout === "modal_dfc" || esCard.layout === "double_faced_token");

    if (isDFC) {
      const esFaces = esCard.card_faces;
      const enFaces = enFallbackCard?.card_faces || null;

      esFaces.forEach((face: any, idx: number) => {
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
          entries.push([shownName, display || "", download || display || ""]);
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
        entries.push([shownName, display || "", download || display || ""]);
      }
    }

    return entries;
  }

  async function fetchByExactName(name: string) {
    const url = `${api}/cards/named?exact=${encodeURIComponent(name)}`;
    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    if (!resp.ok) throw new Error(`named?exact fallo: ${resp.status} ${resp.statusText}`);
    return resp.json();
  }

  async function fetchPrintsByOracleAndLang(oracleId: string, langQuery: string) {
    const results: any[] = [];
    let next = `${api}/cards/search?q=${encodeURIComponent(`oracleid:${oracleId} lang:${langQuery}`)}&unique=prints`;

    while (next) {
      const resp = await fetch(next, { headers: { Accept: "application/json" } });
      if (!resp.ok) throw new Error(`search ${langQuery} fallo: ${resp.status} ${resp.statusText}`);
      const data = await resp.json();
      (data.data || []).forEach((c: any) => results.push(c));
      next = data.has_more ? data.next_page : null;
      if (next) await delay(80);
    }

    return results;
  }

  function chooseBestPrint(cards: any[]) {
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
    const cartas_final_local: Array<[string, string, string]> = [];
    let localErrorHtml = "";
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
            if (textos.es.noExisteES) {
              localErrorHtml += textos.es.noExisteES(nombre);
              setErrorHtml(localErrorHtml);
            }
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

            if (chosenEN && textos.es.fallbackEN) {
              localErrorHtml += textos.es.fallbackEN(nombre);
              setErrorHtml(localErrorHtml);
            }
          }

          const entries = normalizeCardToEntriesWithFallback(chosenES, chosenEN);

          if (entries.length === 0) {
            localErrorHtml += textos.es.sinImagen(nombre);
            setErrorHtml(localErrorHtml);
            return;
          }

          entries.forEach((e) => cartas_final_local.push(e));
          contadorPngs += entries.length;
        } catch (error) {
          console.error(`❌ Error con ${nombre}:`, error);
          localErrorHtml += textos.es.noEncontrada(nombre);
          setErrorHtml(localErrorHtml);
        }
      })
    );

    setNumCartasHtml(textos.es.total(contadorPngs));
    setCartasFinal(cartas_final_local);
  }

  async function descargarTodasLasCartas() {
    const zip = new JSZip();
    const folder = zip.folder("cards");
    if (!folder) return;

    setShowProgreso(true);
    setProgresoMax(cartasFinal.length);
    setProgresoVal(0);

    for (let i = 0; i < cartasFinal.length; i++) {
      const [nombre, , urlDescarga] = cartasFinal[i];

      try {
        setEstadoText(textos[lang].descargando(nombre, i + 1, cartasFinal.length));

        const response = await fetch(urlDescarga);
        if (!response.ok) {
          throw new Error(`Error al descargar: ${nombre}`);
        }

        const blob = await response.blob();
        const safeName = (nombre || "carta").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
        folder.file(`${String(i).padStart(3, "0")}_${safeName}.png`, blob);

        setProgresoVal(i + 1);
      } catch (error) {
        console.error(`Error descargando ${nombre}:`, error);
      }

      await delay(80);
    }

    setEstadoText(textos[lang].generando);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "cards.zip");
    setEstadoText(textos[lang].completado);
  }

  return (
    <main className="pagina-descarga">
      <section className="cabecera-descarga">
        <div className="cabecera-top">
          <div>
            <h1 id="titulo-app">{t.titulo}</h1>
          </div>

          <div className="barra-idioma" aria-label="Selector de idioma">
            <button
              type="button"
              className={`boton-idioma ${lang === "en" ? "activo" : ""}`}
              id="boton-en"
              onClick={() => cambiarIdioma("en")}
              aria-pressed={lang === "en"}
            >
              <span>ENG</span>
            </button>

            <button
              type="button"
              className={`boton-idioma ${lang === "es" ? "activo" : ""}`}
              id="boton-es"
              onClick={() => cambiarIdioma("es")}
              aria-pressed={lang === "es"}
            >
              <span>ESP</span>
            </button>
          </div>
        </div>
      </section>

      <section className="zona-editor">
        <div className="panel-info">
          <h3 id="titulo-lateral-izq">{t.lateralIzqTitulo}</h3>
          <p id="texto-lateral-izq">{t.lateralIzqTexto}</p>
        </div>

        <div className="panel-central">
          <h3 id="aviso-app">{t.aviso}</h3>
          <p id="instrucciones-app" className="texto-instrucciones">
            {t.instrucciones}
          </p>

          <textarea
            id="cartas"
            rows={10}
            placeholder={t.placeholder}
            value={cartasText}
            onChange={(e) => setCartasText(e.target.value)}
          />

          <button id="boton-busqueda" className="boton-principal" onClick={buscarimg}>
            {t.botonBuscar}
          </button>
        </div>

        <div className="panel-info">
          <h3 id="titulo-lateral-der">{t.lateralDerTitulo}</h3>
          <p id="texto-lateral-der">{t.lateralDerTexto}</p>
        </div>
      </section>

      {cartasFinal.length > 0 && (
        <div id="zonaboton">
          <button className="boton-descarga" onClick={descargarTodasLasCartas}>
            {t.botonDescargar}
          </button>
        </div>
      )}

      {showProgreso && (
        <div id="divprogreso" style={{ display: "block" }}>
          <progress id="progreso" max={progresoMax} value={progresoVal} />
          <p id="estado">{estadoText}</p>
        </div>
      )}

      <div id="error" dangerouslySetInnerHTML={{ __html: errorHtml }} />
      <div id="num_cartas" dangerouslySetInnerHTML={{ __html: numCartasHtml }} />

      <div id="resultado">
        {cartasFinal.map((carta, index) => (
          <div className="card" key={index}>
            <p className="card-nombre">{carta[0]}</p>
            <img src={carta[1]} loading="lazy" decoding="async" className="card-imagen" alt={carta[0]} />
          </div>
        ))}
      </div>
    </main>
  );
}
