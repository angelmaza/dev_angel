// Genera un PDF A4 de cartas para imprimir, con la plantilla
// "Copistería Soriano / Carta Estándar": 3x3 cartas, sangrado en espejo,
// marcas de corte, tira de calibración y hoja trasera en espejo.
import type { PDFDocument, PDFFont, PDFImage, PDFPage } from "pdf-lib";

const CONFIG = {
  anchoPagina: 210, altoPagina: 297, // A4 vertical (mm)
  anchoCarta: 63.5, altoCarta: 88.9, // tamaño final de la carta
  sangrado: 1, // sangrado en espejo por lado
  separacion: 2, // separación entre celdas
  columnas: 3, filas: 3,
  huecoMarcaCorte: (3 * 25.4) / 72, // las marcas de corte se paran 3 pt antes de la rejilla
  grosorMarcaCorte: 1, // pt
  dpiMaximo: 400, // no re-muestreamos por encima de esto
};
const MM = 72 / 25.4; // mm -> pt

export const CARTAS_POR_HOJA = CONFIG.columnas * CONFIG.filas;

// Una imagen puede venir de una URL (Scryfall) o de un fichero elegido por el usuario
export type FuenteImagen = { tipo: "url"; url: string } | { tipo: "archivo"; archivo: File };

export interface CartaPdf {
  nombre: string;
  frontal: FuenteImagen;
  trasera: FuenteImagen | null; // null = usa la trasera general
  copias: number;
}

function claveFuente(fuente: FuenteImagen, ids: Map<File, number>) {
  if (fuente.tipo === "url") return "url:" + fuente.url;
  if (!ids.has(fuente.archivo)) ids.set(fuente.archivo, ids.size + 1);
  return "archivo:" + ids.get(fuente.archivo);
}

async function blobDeFuente(fuente: FuenteImagen): Promise<Blob> {
  if (fuente.tipo === "archivo") return fuente.archivo;
  const respuesta = await fetch(fuente.url);
  if (!respuesta.ok) throw new Error(`No se pudo descargar la imagen (${respuesta.status})`);
  return respuesta.blob();
}

function cargarImagen(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(blob);
    const imagen = new Image();
    imagen.onload = () => { URL.revokeObjectURL(url); resolver(imagen); };
    imagen.onerror = () => { URL.revokeObjectURL(url); rechazar(new Error("No se pudo leer la imagen")); };
    imagen.src = url;
  });
}

// Carta a tamaño final + sangrado en espejo, como JPEG
async function jpegConSangrado(blob: Blob): Promise<Uint8Array> {
  const imagen = await cargarImagen(blob);
  // Las imágenes apaisadas se giran 90º para que entren en la carta vertical
  const rotar = imagen.naturalWidth > imagen.naturalHeight;
  const anchoImg = rotar ? imagen.naturalHeight : imagen.naturalWidth;
  const altoImg = rotar ? imagen.naturalWidth : imagen.naturalHeight;
  const pxPorMm = Math.min(Math.max(anchoImg / CONFIG.anchoCarta, altoImg / CONFIG.altoCarta), CONFIG.dpiMaximo / 25.4);
  const ancho = Math.round(CONFIG.anchoCarta * pxPorMm), alto = Math.round(CONFIG.altoCarta * pxPorMm);
  const sangradoPx = Math.max(1, Math.round(CONFIG.sangrado * pxPorMm));

  const carta = document.createElement("canvas");
  carta.width = ancho; carta.height = alto;
  const ctxCarta = carta.getContext("2d")!;
  ctxCarta.fillStyle = "#fff"; ctxCarta.fillRect(0, 0, ancho, alto);
  ctxCarta.imageSmoothingQuality = "high";
  if (rotar) { ctxCarta.translate(ancho, 0); ctxCarta.rotate(Math.PI / 2); ctxCarta.drawImage(imagen, 0, 0, alto, ancho); }
  else ctxCarta.drawImage(imagen, 0, 0, ancho, alto);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho + 2 * sangradoPx; lienzo.height = alto + 2 * sangradoPx;
  const ctxLienzo = lienzo.getContext("2d")!;
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) {
    ctxLienzo.save();
    ctxLienzo.translate(sangradoPx + (i === 1 ? 2 * ancho : 0), sangradoPx + (j === 1 ? 2 * alto : 0));
    ctxLienzo.scale(i === 0 ? 1 : -1, j === 0 ? 1 : -1);
    ctxLienzo.drawImage(carta, 0, 0);
    ctxLienzo.restore();
  }
  const jpg = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/jpeg", 0.92));
  if (!jpg) throw new Error("No se pudo convertir la imagen");
  return new Uint8Array(await jpg.arrayBuffer());
}

// ---------- Maquetación ----------
const anchoCelda = CONFIG.anchoCarta + 2 * CONFIG.sangrado, altoCelda = CONFIG.altoCarta + 2 * CONFIG.sangrado;
const anchoRejilla = CONFIG.columnas * anchoCelda + (CONFIG.columnas - 1) * CONFIG.separacion;
const altoRejilla = CONFIG.filas * altoCelda + (CONFIG.filas - 1) * CONFIG.separacion;
const margenX = (CONFIG.anchoPagina - anchoRejilla) / 2, margenY = (CONFIG.altoPagina - altoRejilla) / 2;

// Posición (mm, desde arriba-izquierda) de la celda; en la trasera las columnas van en espejo
function posCelda(hueco: number, esTrasera: boolean) {
  let columna = hueco % CONFIG.columnas;
  const fila = Math.floor(hueco / CONFIG.columnas);
  if (esTrasera) columna = CONFIG.columnas - 1 - columna;
  return { x: margenX + columna * (anchoCelda + CONFIG.separacion), y: margenY + fila * (altoCelda + CONFIG.separacion) };
}

function dibujarExtras(pdfLib: typeof import("pdf-lib"), pagina: PDFPage, fuentePdf: PDFFont, numPagina: number) {
  const { rgb, cmyk } = pdfLib;
  const altoPt = CONFIG.altoPagina * MM;
  const linea = (x1: number, y1: number, x2: number, y2: number) => pagina.drawLine({
    start: { x: x1 * MM, y: altoPt - y1 * MM }, end: { x: x2 * MM, y: altoPt - y2 * MM },
    thickness: CONFIG.grosorMarcaCorte, color: rgb(0, 0, 0),
  });

  // Marcas de corte en los márgenes, alineadas con el borde real de cada carta
  const hueco = CONFIG.huecoMarcaCorte;
  for (let columna = 0; columna < CONFIG.columnas; columna++) {
    const x0 = margenX + columna * (anchoCelda + CONFIG.separacion) + CONFIG.sangrado;
    for (const x of [x0, x0 + CONFIG.anchoCarta]) {
      linea(x, 0, x, margenY - hueco);
      linea(x, CONFIG.altoPagina - margenY + hueco, x, CONFIG.altoPagina);
    }
  }
  for (let fila = 0; fila < CONFIG.filas; fila++) {
    const y0 = margenY + fila * (altoCelda + CONFIG.separacion) + CONFIG.sangrado;
    for (const y of [y0, y0 + CONFIG.altoCarta]) {
      linea(0, y, margenX - hueco, y);
      linea(CONFIG.anchoPagina - margenX + hueco, y, CONFIG.anchoPagina, y);
    }
  }

  // Tira de calibración arriba (diana + escalas CMYK + diana)
  const anchoTira = CONFIG.anchoCarta - 6, altoTira = 5.3;
  const tiraX = (CONFIG.anchoPagina - anchoTira) / 2, tiraY = (margenY - altoTira) / 2;
  const diana = (cx: number, cy: number, radio: number) => {
    pagina.drawCircle({ x: cx * MM, y: altoPt - cy * MM, size: radio * MM, borderColor: rgb(0, 0, 0), borderWidth: 0.5 });
    pagina.drawCircle({ x: cx * MM, y: altoPt - cy * MM, size: radio * 0.5 * MM, borderColor: rgb(0, 0, 0), borderWidth: 0.5 });
    pagina.drawLine({ start: { x: (cx - radio * 1.3) * MM, y: altoPt - cy * MM }, end: { x: (cx + radio * 1.3) * MM, y: altoPt - cy * MM }, thickness: 0.5 });
    pagina.drawLine({ start: { x: cx * MM, y: altoPt - (cy - radio * 1.3) * MM }, end: { x: cx * MM, y: altoPt - (cy + radio * 1.3) * MM }, thickness: 0.5 });
  };
  const radio = 3.53 / 2;
  diana(tiraX + radio * 1.3, tiraY + altoTira / 2, radio);
  diana(tiraX + anchoTira - radio * 1.3, tiraY + altoTira / 2, radio);
  const anchoMuestra = (anchoTira - 4 * radio * 1.3 - 4) / 16, altoMuestra = altoTira * 0.6, muestraY = tiraY + (altoTira - altoMuestra) / 2;
  let x = tiraX + 2 * radio * 1.3 + 2;
  for (let canal = 0; canal < 4; canal++) for (const tono of [1, 0.75, 0.5, 0.25]) {
    const valores: [number, number, number, number] = [0, 0, 0, 0];
    valores[canal] = tono;
    pagina.drawRectangle({ x: x * MM, y: altoPt - (muestraY + altoMuestra) * MM, width: anchoMuestra * MM, height: altoMuestra * MM, color: cmyk(...valores) });
    x += anchoMuestra;
  }

  // Número de página centrado abajo
  const texto = String(numPagina), tamano = 8;
  pagina.drawText(texto, {
    x: (CONFIG.anchoPagina * MM - fuentePdf.widthOfTextAtSize(texto, tamano)) / 2,
    y: (margenY / 2) * MM - tamano / 3, size: tamano, font: fuentePdf, color: rgb(0, 0, 0),
  });
}

// ---------- Crear PDF ----------
export async function crearPdfCartas(
  cartas: CartaPdf[],
  traseraGeneral: FuenteImagen | null,
  onProgreso: (fraccion: number, mensaje: string) => void
): Promise<{ bytes: Uint8Array; total: number }> {
  const pdfLib = await import("pdf-lib");
  const pdf: PDFDocument = await pdfLib.PDFDocument.create();
  pdf.setTitle("Cartas MTG");
  pdf.setCreator("DevAngel · Descargador PNG MTG");
  const fuentePdf = await pdf.embedFont(pdfLib.StandardFonts.Helvetica);

  const usadas = cartas.filter((c) => c.copias > 0);

  // Cada imagen distinta se procesa e incrusta una sola vez
  const ids = new Map<File, number>();
  const pendientes = new Map<string, { fuente: FuenteImagen; nombre: string }>();
  const anotar = (fuente: FuenteImagen, nombre: string) => {
    const clave = claveFuente(fuente, ids);
    if (!pendientes.has(clave)) pendientes.set(clave, { fuente, nombre });
  };
  for (const c of usadas) {
    anotar(c.frontal, c.nombre);
    if (c.trasera) anotar(c.trasera, `trasera de ${c.nombre}`);
  }
  if (traseraGeneral) anotar(traseraGeneral, "trasera general");

  const incrustadas = new Map<string, PDFImage>();
  let hechos = 0;
  for (const [clave, { fuente, nombre }] of pendientes) {
    onProgreso(hechos / pendientes.size, `Procesando ${nombre}…`);
    try {
      incrustadas.set(clave, await pdf.embedJpg(await jpegConSangrado(await blobDeFuente(fuente))));
    } catch (e) {
      throw new Error(`${nombre}: ${(e as Error).message}`);
    }
    hechos++;
    // Pausa corta entre descargas para no saturar a Scryfall
    if (fuente.tipo === "url") await new Promise((resolver) => setTimeout(resolver, 80));
  }
  const imagenDe = (fuente: FuenteImagen | null) => (fuente ? incrustadas.get(claveFuente(fuente, ids)) ?? null : null);

  // Lista final con las copias expandidas
  const lista = usadas.flatMap((c) =>
    Array.from({ length: c.copias }, () => ({ frente: imagenDe(c.frontal)!, dorso: imagenDe(c.trasera ?? traseraGeneral) }))
  );
  const conTraseras = lista.some((c) => c.dorso);

  let numPagina = 1;
  for (let inicio = 0; inicio < lista.length; inicio += CARTAS_POR_HOJA) {
    const grupo = lista.slice(inicio, inicio + CARTAS_POR_HOJA);
    for (const esTrasera of conTraseras ? [false, true] : [false]) {
      const pagina = pdf.addPage([CONFIG.anchoPagina * MM, CONFIG.altoPagina * MM]);
      grupo.forEach((c, hueco) => {
        const imagen = esTrasera ? c.dorso : c.frente;
        if (!imagen) return; // carta sin trasera: hueco en blanco
        const pos = posCelda(hueco, esTrasera);
        pagina.drawImage(imagen, {
          x: pos.x * MM, y: (CONFIG.altoPagina - pos.y - altoCelda) * MM, width: anchoCelda * MM, height: altoCelda * MM,
        });
      });
      dibujarExtras(pdfLib, pagina, fuentePdf, numPagina++);
    }
  }

  onProgreso(1, "Guardando PDF…");
  const bytes = await pdf.save({ useObjectStreams: false });
  return { bytes, total: lista.length };
}
