"use client";

import React, { useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "./descargador.css";
import { crearPdfCartas, CARTAS_POR_HOJA, type CartaPdf, type FuenteImagen } from "./pdfCartas";

const URL_API = "https://api.scryfall.com";

// Una imagen de carta encontrada. Las cartas dobles generan dos: la segunda lleva esDorso = true.
interface Carta {
  nombre: string;
  urlVista: string;
  urlDescarga: string;
  copias: number;
  esDorso: boolean;
}

// Imagen elegida por el usuario para una trasera
interface TraseraElegida {
  archivo: File;
  url: string; // object URL para la vista previa
}

interface TextosIdioma {
  titulo: string;
  aviso: string;
  instrucciones: string;
  botonBuscar: string;
  botonDescargar: string;
  lateralIzqTitulo: string;
  lateralIzqTexto: string;
  lateralDerTitulo: string;
  lateralDerTexto: string;
  textoEjemplo: string;
  esperando: string;
  generando: string;
  completado: string;
  descargando: (nombre: string, actual: number, total: number) => string;
  total: (n: number) => string;
  noEncontrada: (nombre: string) => string;
  sinImagen: (nombre: string) => string;
  noExisteES?: (nombre: string) => string;
  respaldoEN?: (nombre: string) => string;
  botonPdf: string;
  pdfTitulo: string;
  pdfTraseraGeneral: string;
  pdfElegirTrasera: string;
  pdfQuitar: string;
  pdfCambiar: string;
  pdfCopias: string;
  pdfTraseraCarta: string;
  pdfCaraB: string;
  pdfSinTrasera: string;
  pdfDescargar: string;
  pdfResumen: (cartas: number, hojas: number) => string;
  pdfConfirmarSinTrasera: string;
  pdfListo: (nombre: string, mb: string) => string;
  pdfError: (mensaje: string) => string;
}

const textos: { en: TextosIdioma; es: TextosIdioma } = {
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
    textoEjemplo:
      "1 Giada, Font of Hope (FDN) 141\n1 Akroma's Will (M3C) 165\n1 Angel of Destiny (PZNR) 2p *F*",
    esperando: "Waiting...",
    generando: "Generating ZIP...",
    completado: "Download completed.",
    descargando: (nombre, actual, total) => `Downloading ${nombre} (${actual}/${total})...`,
    total: (n) => `Total of <strong>${n} cards</strong>. Double-faced cards count as 2.`,
    noEncontrada: (nombre) => `<h4>Warning: ${nombre} was not found. Download it manually.</h4>`,
    sinImagen: (nombre) => `<p>No images available for <em>${nombre}</em>.</p>`,
    botonPdf: "Download as PDF",
    pdfTitulo: "Print PDF (A4, 3×3)",
    pdfTraseraGeneral: "Back for all cards",
    pdfElegirTrasera: "Click to choose an image",
    pdfQuitar: "Remove",
    pdfCambiar: "Change back",
    pdfCopias: "Copies",
    pdfTraseraCarta: "Back",
    pdfCaraB: "Back face",
    pdfSinTrasera: "General",
    pdfDescargar: "Download PDF",
    pdfResumen: (c, h) => `${c} cards · ${h} sheet${h === 1 ? "" : "s"}`,
    pdfConfirmarSinTrasera: "No back chosen. Generate only the fronts?",
    pdfListo: (n, mb) => `Done: ${n} (${mb} MB)`,
    pdfError: (m) => `Error creating the PDF: ${m}`,
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
    textoEjemplo:
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
    respaldoEN: (nombre) =>
      `<p>Para <em>${nombre}</em>, la imagen en ES era de baja calidad. Se sustituyó por una imagen en <strong>EN</strong>.</p>`,
    botonPdf: "Descargar como PDF",
    pdfTitulo: "PDF para imprimir (A4, 3×3)",
    pdfTraseraGeneral: "Trasera de todas las cartas",
    pdfElegirTrasera: "Haz clic para elegir una imagen",
    pdfQuitar: "Quitar",
    pdfCambiar: "Cambiar trasera",
    pdfCopias: "Copias",
    pdfTraseraCarta: "Trasera",
    pdfCaraB: "Cara B",
    pdfSinTrasera: "General",
    pdfDescargar: "Descargar PDF",
    pdfResumen: (c, h) => `${c} cartas · ${h} hoja${h === 1 ? "" : "s"}`,
    pdfConfirmarSinTrasera: "No has elegido trasera. ¿Generar solo las caras frontales?",
    pdfListo: (n, mb) => `Listo: ${n} (${mb} MB)`,
    pdfError: (m) => `Error al crear el PDF: ${m}`,
  },
};

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function rangoCalidadImagen(uris: any) {
  if (!uris) return 0;
  if (uris.png) return 3;
  if (uris.large) return 2;
  if (uris.normal) return 1;
  return 0;
}

function elegirMejorImagen(uris: any) {
  const urlVista = uris?.large || uris?.normal || uris?.small || null;
  const urlDescarga = uris?.png || uris?.large || uris?.normal || uris?.small || null;
  return { urlVista, urlDescarga, rango: rangoCalidadImagen(uris) };
}

export default function DescargadorPngsMtg() {
  const [idioma, setIdioma] = useState<"es" | "en">("en");
  const [textoCartas, setTextoCartas] = useState<string>(
    "1 Giada, Font of Hope (FDN) 141\n1 Akroma's Will (M3C) 165\n1 Angel of Destiny (PZNR) 2p *F*"
  );
  
  const [mostrarProgreso, setMostrarProgreso] = useState<boolean>(false);
  const [progresoMax, setProgresoMax] = useState<number>(0);
  const [progresoValor, setProgresoValor] = useState<number>(0);
  const [textoEstado, setTextoEstado] = useState<string>("");
  
  const [htmlErrores, setHtmlErrores] = useState<string>("");
  const [htmlNumCartas, setHtmlNumCartas] = useState<string>("");
  const [cartasFinal, setCartasFinal] = useState<Carta[]>([]);

  // Panel de PDF
  const [pdfAbierto, setPdfAbierto] = useState(false);
  const [traseraGeneral, setTraseraGeneral] = useState<TraseraElegida | null>(null);
  const [traserasCarta, setTraserasCarta] = useState<Record<number, TraseraElegida>>({});
  const [pdfGenerando, setPdfGenerando] = useState(false);
  const [pdfProgreso, setPdfProgreso] = useState(0);
  const [pdfEstado, setPdfEstado] = useState("");
  const inputTraseraGeneral = useRef<HTMLInputElement>(null);
  const inputTraseraCarta = useRef<HTMLInputElement>(null);
  const cartaEligiendoTrasera = useRef<number | null>(null);

  const t = textos[idioma];

  function cambiarIdioma(nuevoIdioma: "en" | "es") {
    setIdioma(nuevoIdioma);
  }

  function limpiarInterfaz() {
    setHtmlErrores("");
    setHtmlNumCartas("");
    setCartasFinal([]);
    setMostrarProgreso(false);
    setTextoEstado(textos[idioma].esperando);
    // Las traseras por carta van ligadas a la búsqueda anterior; la general se mantiene
    Object.values(traserasCarta).forEach((tr) => URL.revokeObjectURL(tr.url));
    setTraserasCarta({});
    setPdfEstado("");
  }

  function procesarCartas() {
    const lineas = textoCartas.trim().split("\n");

    return lineas
      .map((linea) => {
        const lineaLimpia = linea.replace(/\*\S+\*/g, "").trim();
        // Cabeceras como "SIDEBOARD:" no son cartas
        if (/sideboard/i.test(lineaLimpia)) return null;
        const coincidencia = lineaLimpia.match(/^(\d+)\s+(.+?)\s+\(([^)]+)\)\s+(\S+)$/);

        if (coincidencia) {
          return {
            copias: Math.max(1, parseInt(coincidencia[1], 10)),
            nombre: coincidencia[2].trim(),
            codigo: coincidencia[3].trim(),
            numero: coincidencia[4].trim(),
          };
        }

        if (lineaLimpia) {
          // Línea sin set: "4 Mountain" o solo "Mountain"
          const conCantidad = lineaLimpia.match(/^(\d+)\s+(.+)$/);
          return {
            copias: conCantidad ? Math.max(1, parseInt(conCantidad[1], 10)) : 1,
            nombre: conCantidad ? conCantidad[2].trim() : lineaLimpia,
            codigo: "",
            numero: "",
          };
        }

        return null;
      })
      .filter(Boolean) as Array<{ copias: number; nombre: string; codigo: string; numero: string }>;
  }

  async function buscarImagenes() {
    if (idioma === "es") {
      await buscarImagenesES();
    } else {
      await buscarImagenesEN();
    }
  }

  async function buscarImagenesEN() {
    limpiarInterfaz();

    const cartas = procesarCartas();
    const cartasFinalLocal: Carta[] = [];
    let htmlErroresLocal = "";
    let contadorPngs = 0;

    await Promise.all(
      cartas.map(async (carta) => {
        const codigoSet = carta.codigo;
        const numeroCarta = carta.numero;

        if (!codigoSet || !numeroCarta) {
          htmlErroresLocal += textos.en.noEncontrada(carta.nombre);
          setHtmlErrores(htmlErroresLocal);
          return;
        }

        const urlConsulta = `${URL_API}/cards/${encodeURIComponent(codigoSet)}/${encodeURIComponent(numeroCarta)}`;

        try {
          await esperar(100);

          const respuesta = await fetch(urlConsulta, {
            headers: {
              "User-Agent": "MTGSearchApp/1.0",
              Accept: "application/json",
            },
          });

          if (!respuesta.ok) {
            throw new Error("Error en la búsqueda: " + respuesta.statusText);
          }

          const datos = await respuesta.json();

          if (
            datos.card_faces &&
            (datos.layout === "transform" || datos.layout === "modal_dfc" || datos.layout === "double_faced_token")
          ) {
            datos.card_faces.forEach((cara: any, indice: number) => {
              const { urlVista, urlDescarga } = elegirMejorImagen(cara.image_uris || {});
              if (!urlVista && !urlDescarga) return;
              cartasFinalLocal.push({
                nombre: cara.name,
                urlVista: urlVista || urlDescarga || "",
                urlDescarga: urlDescarga || urlVista || "",
                copias: carta.copias,
                esDorso: indice > 0,
              });
              contadorPngs++;
            });
          } else {
            // Algunas cartas (p. ej. las reversibles) solo tienen imagen dentro de card_faces
            const { urlVista, urlDescarga } = elegirMejorImagen(datos.image_uris || datos.card_faces?.[0]?.image_uris || {});
            if (!urlVista && !urlDescarga) {
              htmlErroresLocal += textos.en.sinImagen(carta.nombre);
              setHtmlErrores(htmlErroresLocal);
              return;
            }
            cartasFinalLocal.push({
              nombre: datos.name,
              urlVista: urlVista || urlDescarga || "",
              urlDescarga: urlDescarga || urlVista || "",
              copias: carta.copias,
              esDorso: false,
            });
            contadorPngs++;
          }
        } catch (error: any) {
          console.error(`❌ Fallo con ${carta.nombre}: ${error.message}`);
          htmlErroresLocal += textos.en.noEncontrada(carta.nombre);
          setHtmlErrores(htmlErroresLocal);
        }
      })
    );

    setHtmlNumCartas(textos.en.total(contadorPngs));
    setCartasFinal(cartasFinalLocal);
  }

  const idiomaPreferido = "es";
  const pausaCortesiaMs = 120;

  function cartaAEntradasConRespaldo(cartaES: any, cartaRespaldoEN: any, copias: number) {
    const entradas: Carta[] = [];
    const esDobleCara =
      cartaES.card_faces &&
      (cartaES.layout === "transform" || cartaES.layout === "modal_dfc" || cartaES.layout === "double_faced_token");

    if (esDobleCara) {
      const carasES = cartaES.card_faces;
      const carasEN = cartaRespaldoEN?.card_faces || null;

      carasES.forEach((cara: any, indice: number) => {
        const eleccionES = elegirMejorImagen(cara.image_uris || {});
        let urlVista = eleccionES.urlVista;
        let urlDescarga = eleccionES.urlDescarga;

        if (eleccionES.rango === 0 && cartaRespaldoEN) {
          const caraEN = carasEN ? carasEN[indice] : null;
          const eleccionEN = elegirMejorImagen((caraEN ? caraEN.image_uris : cartaRespaldoEN.image_uris) || {});
          if (eleccionEN.rango > eleccionES.rango) {
            urlVista = eleccionEN.urlVista;
            urlDescarga = eleccionEN.urlDescarga;
          }
        }

        const nombreMostrado = cara.printed_name || cara.name;
        if (urlVista || urlDescarga) {
          entradas.push({
            nombre: nombreMostrado,
            urlVista: urlVista || "",
            urlDescarga: urlDescarga || urlVista || "",
            copias,
            esDorso: entradas.length > 0,
          });
        }
      });
    } else {
      const eleccionES = elegirMejorImagen(cartaES.image_uris || cartaES.card_faces?.[0]?.image_uris || {});
      let urlVista = eleccionES.urlVista;
      let urlDescarga = eleccionES.urlDescarga;

      if (eleccionES.rango === 0 && cartaRespaldoEN) {
        const eleccionEN = elegirMejorImagen(cartaRespaldoEN.image_uris || cartaRespaldoEN.card_faces?.[0]?.image_uris || {});
        if (eleccionEN.rango > eleccionES.rango) {
          urlVista = eleccionEN.urlVista;
          urlDescarga = eleccionEN.urlDescarga;
        }
      }

      const nombreMostrado = cartaES.printed_name || cartaES.name;
      if (urlVista || urlDescarga) {
        entradas.push({ nombre: nombreMostrado, urlVista: urlVista || "", urlDescarga: urlDescarga || urlVista || "", copias, esDorso: false });
      }
    }

    return entradas;
  }

  async function buscarPorNombreExacto(nombreCarta: string) {
    const url = `${URL_API}/cards/named?exact=${encodeURIComponent(nombreCarta)}`;
    const respuesta = await fetch(url, { headers: { Accept: "application/json" } });
    if (!respuesta.ok) throw new Error(`named?exact fallo: ${respuesta.status} ${respuesta.statusText}`);
    return respuesta.json();
  }

  async function buscarImpresionesPorOracleEIdioma(idOracle: string, idiomaConsulta: string) {
    const resultados: any[] = [];
    let siguiente = `${URL_API}/cards/search?q=${encodeURIComponent(`oracleid:${idOracle} lang:${idiomaConsulta}`)}&unique=prints`;

    while (siguiente) {
      const respuesta = await fetch(siguiente, { headers: { Accept: "application/json" } });
      if (!respuesta.ok) throw new Error(`search ${idiomaConsulta} fallo: ${respuesta.status} ${respuesta.statusText}`);
      const datos = await respuesta.json();
      (datos.data || []).forEach((c: any) => resultados.push(c));
      siguiente = datos.has_more ? datos.next_page : null;
      if (siguiente) await esperar(80);
    }

    return resultados;
  }

  function elegirMejorImpresion(impresiones: any[]) {
    if (!impresiones || impresiones.length === 0) return null;

    const puntuadas = impresiones.map((c) => {
      const uris = c.image_uris || c.card_faces?.[0]?.image_uris || {};
      const rango = rangoCalidadImagen(uris);
      const altaResolucion = !!c.highres_image;
      const esPromo = c.set_type === "promo";
      const fechaSalida = c.released_at || "1900-01-01";
      const puntuacion = rango + (altaResolucion ? 1 : 0) - (esPromo ? 0.5 : 0);
      return { c, puntuacion, fechaSalida };
    });

    puntuadas.sort((a, b) => {
      if (b.puntuacion !== a.puntuacion) return b.puntuacion - a.puntuacion;
      return (b.fechaSalida || "").localeCompare(a.fechaSalida || "");
    });

    return puntuadas[0].c;
  }

  async function buscarImagenesES() {
    limpiarInterfaz();

    const cartas = procesarCartas();
    const cartasFinalLocal: Carta[] = [];
    let htmlErroresLocal = "";
    let contadorPngs = 0;

    await Promise.all(
      cartas.map(async (carta) => {
        const { nombre } = carta;

        try {
          await esperar(pausaCortesiaMs);

          const cartaBase = await buscarPorNombreExacto(nombre);
          const idOracle = cartaBase.oracle_id;

          const impresionesES = await buscarImpresionesPorOracleEIdioma(idOracle, idiomaPreferido);
          let elegidaES = elegirMejorImpresion(impresionesES);

          if (!elegidaES) {
            elegidaES = cartaBase;
            if (textos.es.noExisteES) {
              htmlErroresLocal += textos.es.noExisteES(nombre);
              setHtmlErrores(htmlErroresLocal);
            }
          }

          let necesitaEN = false;

          if (
            elegidaES.card_faces &&
            (elegidaES.layout === "transform" || elegidaES.layout === "modal_dfc" || elegidaES.layout === "double_faced_token")
          ) {
            for (const cara of elegidaES.card_faces) {
              const rango = rangoCalidadImagen(cara.image_uris || {});
              if (rango === 0) {
                necesitaEN = true;
                break;
              }
            }
          } else {
            const rango = rangoCalidadImagen(elegidaES.image_uris || elegidaES.card_faces?.[0]?.image_uris || {});
            if (rango === 0) necesitaEN = true;
          }

          let elegidaEN = null;

          if (necesitaEN) {
            const impresionesEN = await buscarImpresionesPorOracleEIdioma(idOracle, "en");
            elegidaEN = elegirMejorImpresion(impresionesEN) || null;

            if (elegidaEN && textos.es.respaldoEN) {
              htmlErroresLocal += textos.es.respaldoEN(nombre);
              setHtmlErrores(htmlErroresLocal);
            }
          }

          const entradas = cartaAEntradasConRespaldo(elegidaES, elegidaEN, carta.copias);

          if (entradas.length === 0) {
            htmlErroresLocal += textos.es.sinImagen(nombre);
            setHtmlErrores(htmlErroresLocal);
            return;
          }

          entradas.forEach((e) => cartasFinalLocal.push(e));
          contadorPngs += entradas.length;
        } catch (error) {
          console.error(`❌ Error con ${nombre}:`, error);
          htmlErroresLocal += textos.es.noEncontrada(nombre);
          setHtmlErrores(htmlErroresLocal);
        }
      })
    );

    setHtmlNumCartas(textos.es.total(contadorPngs));
    setCartasFinal(cartasFinalLocal);
  }

  async function descargarTodasLasCartas() {
    const zip = new JSZip();
    const carpeta = zip.folder("cards");
    if (!carpeta) return;

    setMostrarProgreso(true);
    setProgresoMax(cartasFinal.length);
    setProgresoValor(0);

    for (let i = 0; i < cartasFinal.length; i++) {
      const { nombre, urlDescarga } = cartasFinal[i];

      try {
        setTextoEstado(textos[idioma].descargando(nombre, i + 1, cartasFinal.length));

        const respuesta = await fetch(urlDescarga);
        if (!respuesta.ok) {
          throw new Error(`Error al descargar: ${nombre}`);
        }

        const blob = await respuesta.blob();
        const nombreSeguro = (nombre || "carta").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
        carpeta.file(`${String(i).padStart(3, "0")}_${nombreSeguro}.png`, blob);

        setProgresoValor(i + 1);
      } catch (error) {
        console.error(`Error descargando ${nombre}:`, error);
      }

      await esperar(80);
    }

    setTextoEstado(textos[idioma].generando);
    const contenido = await zip.generateAsync({ type: "blob" });
    saveAs(contenido, "cards.zip");
    setTextoEstado(textos[idioma].completado);
  }

  // ---------- PDF ----------

  // Cartas que van al PDF: las caras B de las dobles no se imprimen como frontal,
  // se usan como su trasera por defecto
  const cartasPdf = cartasFinal
    .map((carta, i) => ({ carta, i, caraB: cartasFinal[i + 1]?.esDorso ? cartasFinal[i + 1] : null }))
    .filter(({ carta }) => !carta.esDorso);
  const totalCopiasPdf = cartasPdf.reduce((n, { carta }) => n + carta.copias, 0);

  function cambiarCopias(i: number, valor: string) {
    const copias = Math.max(0, Math.min(99, parseInt(valor, 10) || 0));
    setCartasFinal((anterior) => anterior.map((c, j) => (j === i ? { ...c, copias } : c)));
  }

  function elegirTraseraGeneral(archivo: File | undefined) {
    if (!archivo || !archivo.type.startsWith("image/")) return;
    if (traseraGeneral) URL.revokeObjectURL(traseraGeneral.url);
    setTraseraGeneral({ archivo, url: URL.createObjectURL(archivo) });
  }

  function quitarTraseraGeneral() {
    if (traseraGeneral) URL.revokeObjectURL(traseraGeneral.url);
    setTraseraGeneral(null);
  }

  function abrirSelectorTraseraCarta(i: number) {
    cartaEligiendoTrasera.current = i;
    inputTraseraCarta.current?.click();
  }

  function elegirTraseraCarta(archivo: File | undefined) {
    const i = cartaEligiendoTrasera.current;
    cartaEligiendoTrasera.current = null;
    if (i === null || !archivo || !archivo.type.startsWith("image/")) return;
    setTraserasCarta((anterior) => {
      if (anterior[i]) URL.revokeObjectURL(anterior[i].url);
      return { ...anterior, [i]: { archivo, url: URL.createObjectURL(archivo) } };
    });
  }

  function quitarTraseraCarta(i: number) {
    setTraserasCarta((anterior) => {
      if (!anterior[i]) return anterior;
      URL.revokeObjectURL(anterior[i].url);
      const resto = { ...anterior };
      delete resto[i];
      return resto;
    });
  }

  async function descargarPdf() {
    const cartasParaPdf: CartaPdf[] = cartasPdf.map(({ carta, i, caraB }) => {
      const propia = traserasCarta[i];
      let trasera: FuenteImagen | null = null;
      if (propia) trasera = { tipo: "archivo", archivo: propia.archivo };
      else if (caraB) trasera = { tipo: "url", url: caraB.urlDescarga };
      return { nombre: carta.nombre, frontal: { tipo: "url", url: carta.urlDescarga }, trasera, copias: carta.copias };
    });

    const general: FuenteImagen | null = traseraGeneral ? { tipo: "archivo", archivo: traseraGeneral.archivo } : null;
    const hayTraseras = !!general || cartasParaPdf.some((c) => c.copias > 0 && c.trasera);
    if (!hayTraseras && !confirm(t.pdfConfirmarSinTrasera)) return;

    setPdfGenerando(true);
    try {
      const { bytes, total } = await crearPdfCartas(cartasParaPdf, general, (fraccion, mensaje) => {
        setPdfProgreso(fraccion);
        setPdfEstado(mensaje);
      });
      const fecha = new Date();
      const relleno = (v: number) => String(v).padStart(2, "0");
      const nombre = `MTG_${fecha.getFullYear()}${relleno(fecha.getMonth() + 1)}${relleno(fecha.getDate())}_${relleno(fecha.getHours())}${relleno(fecha.getMinutes())}_${total}cartas.pdf`;
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), nombre);
      setPdfEstado(t.pdfListo(nombre, (bytes.length / 1048576).toFixed(1)));
    } catch (err) {
      console.error(err);
      setPdfEstado(t.pdfError((err as Error).message));
    } finally {
      setPdfGenerando(false);
      setPdfProgreso(0);
    }
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
              className={`boton-idioma ${idioma === "en" ? "activo" : ""}`}
              id="boton-en"
              onClick={() => cambiarIdioma("en")}
              aria-pressed={idioma === "en"}
            >
              <span>ENG</span>
            </button>

            <button
              type="button"
              className={`boton-idioma ${idioma === "es" ? "activo" : ""}`}
              id="boton-es"
              onClick={() => cambiarIdioma("es")}
              aria-pressed={idioma === "es"}
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
            placeholder={t.textoEjemplo}
            value={textoCartas}
            onChange={(e) => setTextoCartas(e.target.value)}
          />

          <button id="boton-busqueda" className="boton-principal" onClick={buscarImagenes}>
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
          <button
            className={`boton-descarga boton-pdf ${pdfAbierto ? "activo" : ""}`}
            onClick={() => setPdfAbierto((v) => !v)}
            aria-expanded={pdfAbierto}
          >
            {t.botonPdf}
          </button>
        </div>
      )}

      {cartasFinal.length > 0 && pdfAbierto && (
        <section className="panel-pdf">
          <h3>{t.pdfTitulo}</h3>

          <div className="pdf-trasera-general">
            <h4>{t.pdfTraseraGeneral}</h4>
            <button
              type="button"
              className="pdf-caja-trasera"
              onClick={() => inputTraseraGeneral.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                elegirTraseraGeneral(e.dataTransfer.files[0]);
              }}
            >
              {traseraGeneral ? <img src={traseraGeneral.url} alt={t.pdfTraseraGeneral} /> : <span>{t.pdfElegirTrasera}</span>}
            </button>
            {traseraGeneral && (
              <button type="button" className="pdf-boton-mini" onClick={quitarTraseraGeneral}>
                {t.pdfQuitar}
              </button>
            )}
            <input
              ref={inputTraseraGeneral}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                elegirTraseraGeneral(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <input
            ref={inputTraseraCarta}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              elegirTraseraCarta(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <div className="pdf-lista">
            {cartasPdf.map(({ carta, i, caraB }) => {
              const propia = traserasCarta[i];
              const dorsoUrl = propia?.url || caraB?.urlVista || traseraGeneral?.url || null;
              const dorsoTexto = propia ? null : caraB ? t.pdfCaraB : t.pdfSinTrasera;
              return (
                <div className="pdf-carta" key={i}>
                  <p className="pdf-carta-nombre" title={carta.nombre}>{carta.nombre}</p>
                  <div className="pdf-carta-caras">
                    {carta.urlVista ? <img src={carta.urlVista} alt={carta.nombre} loading="lazy" /> : <span />}
                    <button
                      type="button"
                      className="pdf-carta-dorso"
                      title={t.pdfCambiar}
                      onClick={() => abrirSelectorTraseraCarta(i)}
                    >
                      {dorsoUrl ? <img src={dorsoUrl} alt={t.pdfTraseraCarta} /> : <span>—</span>}
                      {dorsoTexto && <small>{dorsoTexto}</small>}
                    </button>
                  </div>
                  <div className="pdf-carta-controles">
                    <label>
                      {t.pdfCopias}
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={carta.copias}
                        onChange={(e) => cambiarCopias(i, e.target.value)}
                      />
                    </label>
                    <button type="button" className="pdf-boton-mini" onClick={() => abrirSelectorTraseraCarta(i)}>
                      {t.pdfCambiar}
                    </button>
                    {propia && (
                      <button type="button" className="pdf-boton-mini" onClick={() => quitarTraseraCarta(i)}>
                        {t.pdfQuitar}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pdf-pie">
            <span>{t.pdfResumen(totalCopiasPdf, Math.ceil(totalCopiasPdf / CARTAS_POR_HOJA))}</span>
            <button
              type="button"
              className="boton-principal"
              onClick={descargarPdf}
              disabled={pdfGenerando || totalCopiasPdf === 0}
            >
              {t.pdfDescargar}
            </button>
            {pdfGenerando && <progress max={1} value={pdfProgreso} />}
            {pdfEstado && <p className="pdf-estado">{pdfEstado}</p>}
          </div>
        </section>
      )}

      {mostrarProgreso && (
        <div id="divprogreso" style={{ display: "block" }}>
          <progress id="progreso" max={progresoMax} value={progresoValor} />
          <p id="estado">{textoEstado}</p>
        </div>
      )}

      <div id="error" dangerouslySetInnerHTML={{ __html: htmlErrores }} />
      {/* Con el panel de PDF abierto la vista previa sobra: las cartas ya salen en el panel */}
      {!pdfAbierto && (
        <>
          <div id="num_cartas" dangerouslySetInnerHTML={{ __html: htmlNumCartas }} />

          <div id="resultado">
            {cartasFinal.map((carta, index) => (
              <div className="card" key={index}>
                <p className="card-nombre">{carta.nombre}</p>
                {carta.urlVista && (
                  <img src={carta.urlVista} loading="lazy" decoding="async" className="card-imagen" alt={carta.nombre} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
