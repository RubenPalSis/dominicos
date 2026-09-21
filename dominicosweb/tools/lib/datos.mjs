/**
 * Lee y valida todo el contenido: los datos del sitio, el menú, la portada,
 * las páginas sueltas y las noticias.
 *
 * Si algo está mal, no se genera nada y se explica qué falla y en qué
 * archivo. Es a propósito: la publicación falla ahí, y la web que ya está
 * publicada se queda como estaba en vez de romperse a medias.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { limpiaRuta, enlaceSeguro, fechaLegible } from './comun.mjs';
import { TIPOS } from './secciones.mjs';

/* Nombres que ya usa el sitio: una página suelta no puede llamarse así, o
   sobreescribiría la portada, el listado o la página de error. */
const RESERVADOS = new Set(['index', 'noticias', '404', 'sitemap', 'robots', 'manifest', 'styles', 'script']);

export function leerTodo(raiz) {
  const errores = [];
  const avisa = (m) => errores.push(m);

  const sitio = leerSitio(raiz, avisa);
  const menu = leerMenu(raiz, avisa);
  const portada = leerPortada(raiz, sitio, avisa);
  const paginas = leerPaginas(raiz, sitio, avisa);
  const noticias = leerNoticias(raiz, avisa);

  return { sitio, menu, portada, paginas, noticias, errores };
}

/** Lee un JSON y avisa con claridad si no se puede. */
function leerJson(ruta, etiqueta, avisa) {
  if (!existsSync(ruta)) {
    avisa(`${etiqueta}: no existe el archivo`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    avisa(`${etiqueta}: no es un JSON válido (${e.message})`);
    return null;
  }
}

/** Comprueba que una imagen referenciada existe de verdad en el repositorio. */
function compruebaImagen(raiz, ruta, etiqueta, campo, avisa) {
  const r = limpiaRuta(ruta);
  if (!r) return '';
  if (!existsSync(join(raiz, r))) {
    avisa(`${etiqueta}: la imagen "${r}" de "${campo}" no existe`);
    return '';
  }
  return r;
}

/* -------------------------------------------------------------------------
 * datos/sitio.json
 * ---------------------------------------------------------------------- */

function leerSitio(raiz, avisa) {
  const d = leerJson(join(raiz, 'datos', 'sitio.json'), 'datos/sitio.json', avisa) || {};

  ['nombre', 'dominio', 'email'].forEach((campo) => {
    if (!d[campo]) avisa(`datos/sitio.json: falta "${campo}"`);
  });

  if (d.dominio && !/^https?:\/\/[^/]+$/.test(d.dominio)) {
    avisa('datos/sitio.json: "dominio" tiene que ser como "https://ejemplo.es", sin barra al final');
  }

  compruebaImagen(raiz, d.logo, 'datos/sitio.json', 'logo', avisa);
  compruebaImagen(raiz, d.favicon, 'datos/sitio.json', 'favicon', avisa);
  compruebaImagen(raiz, d.imagenCompartir, 'datos/sitio.json', 'imagenCompartir', avisa);

  return {
    nombre: String(d.nombre || ''),
    nombreLargo: String(d.nombreLargo || d.nombre || ''),
    nombreCorto: String(d.nombreCorto || d.nombre || ''),
    rotulo: String(d.rotulo || ''),
    ciudad: String(d.ciudad || ''),
    dominio: String(d.dominio || '').replace(/\/$/, ''),
    logo: limpiaRuta(d.logo) || 'images/logo.jpg',
    favicon: limpiaRuta(d.favicon) || 'images/favicon.jpg',
    imagenCompartir: limpiaRuta(d.imagenCompartir),
    imagenCompartirAlt: String(d.imagenCompartirAlt || ''),
    email: String(d.email || ''),
    redes: (Array.isArray(d.redes) ? d.redes : [])
      .filter((r) => r && r.nombre && enlaceSeguro(r.url))
      .map((r) => ({ nombre: String(r.nombre), usuario: String(r.usuario || ''), url: enlaceSeguro(r.url) })),
    formspree: String(d.formspree || 'TU_ID_DE_FORMSPREE'),
    googleSiteVerification: String(d.googleSiteVerification || ''),
    legal: String(d.legal || ''),
    descripcionApp: String(d.descripcionApp || ''),
    colorTema: String(d.colorTema || '#e01f26'),
    colorFondo: String(d.colorFondo || '#0b0c0f'),
  };
}

/* -------------------------------------------------------------------------
 * datos/menu.json
 * ---------------------------------------------------------------------- */

function leerMenu(raiz, avisa) {
  const d = leerJson(join(raiz, 'datos', 'menu.json'), 'datos/menu.json', avisa) || {};

  const limpiaEnlaces = (lista, campo) =>
    (Array.isArray(lista) ? lista : [])
      .filter((e) => {
        if (!e || !e.texto || !e.destino) {
          avisa(`datos/menu.json: un enlace de "${campo}" no tiene texto o destino`);
          return false;
        }
        return true;
      })
      .map((e) => ({
        texto: String(e.texto),
        destino: String(e.destino),
        anclaPortada: e.anclaPortada ? String(e.anclaPortada) : '',
      }));

  return {
    enlaces: limpiaEnlaces(d.enlaces, 'enlaces'),
    cta: d.cta && d.cta.texto ? { texto: String(d.cta.texto), destino: String(d.cta.destino || '') } : null,
    pie: limpiaEnlaces(d.pie, 'pie'),
  };
}

/* -------------------------------------------------------------------------
 * Secciones (portada y páginas)
 * ---------------------------------------------------------------------- */

function validaSecciones(raiz, secciones, etiqueta, avisa) {
  if (!Array.isArray(secciones)) {
    avisa(`${etiqueta}: "secciones" tiene que ser una lista`);
    return [];
  }

  return secciones.filter((s, i) => {
    if (!s || !s.tipo) {
      avisa(`${etiqueta}: la sección ${i + 1} no tiene "tipo"`);
      return false;
    }
    if (!TIPOS[s.tipo]) {
      avisa(`${etiqueta}: "${s.tipo}" no es un tipo de sección conocido (los que hay: ${Object.keys(TIPOS).join(', ')})`);
      return false;
    }

    /* Las imágenes se comprueban aquí y no al pintar: más vale fallar antes
       de escribir nada que publicar una página con una foto rota. */
    compruebaImagen(raiz, s.imagen, etiqueta, `${s.tipo}.imagen`, avisa);
    if (s.foto) compruebaImagen(raiz, s.foto.imagen, etiqueta, `${s.tipo}.foto`, avisa);
    (s.equipos || []).forEach((e, j) => compruebaImagen(raiz, e.imagen, etiqueta, `${s.tipo}.equipos[${j + 1}]`, avisa));

    return true;
  });
}

/* -------------------------------------------------------------------------
 * datos/portada.json
 * ---------------------------------------------------------------------- */

function leerPortada(raiz, sitio, avisa) {
  const d = leerJson(join(raiz, 'datos', 'portada.json'), 'datos/portada.json', avisa) || {};
  const seo = d.seo || {};

  if (!seo.titulo) avisa('datos/portada.json: falta "seo.titulo"');
  if (!seo.descripcion) avisa('datos/portada.json: falta "seo.descripcion"');

  return {
    titulo: String(seo.titulo || sitio.nombre),
    descripcion: String(seo.descripcion || ''),
    descripcionCompartir: String(seo.descripcionCompartir || seo.descripcion || ''),
    secciones: validaSecciones(raiz, d.secciones, 'datos/portada.json', avisa),
  };
}

/* -------------------------------------------------------------------------
 * paginas/*.json
 * ---------------------------------------------------------------------- */

function leerPaginas(raiz, sitio, avisa) {
  const dir = join(raiz, 'paginas');
  if (!existsSync(dir)) return [];

  const paginas = [];

  for (const archivo of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const etiqueta = `paginas/${archivo}`;
    const slug = archivo.replace(/\.json$/, '');

    if (!/^[a-z0-9-]+$/.test(slug)) {
      avisa(`${etiqueta}: el nombre del archivo tiene que ser en minúsculas, con guiones y sin acentos`);
      continue;
    }

    if (RESERVADOS.has(slug)) {
      avisa(`${etiqueta}: "${slug}" es un nombre reservado del sitio, elige otro`);
      continue;
    }

    const d = leerJson(join(dir, archivo), etiqueta, avisa);
    if (!d) continue;

    if (!d.titulo || !d.descripcion) {
      avisa(`${etiqueta}: "titulo" y "descripcion" son obligatorios`);
      continue;
    }

    paginas.push({
      slug,
      titulo: String(d.titulo),
      descripcion: String(d.descripcion),
      kicker: String(d.kicker || ''),
      imagen: compruebaImagen(raiz, d.imagen, etiqueta, 'imagen', avisa),
      imagenAlt: String(d.imagenAlt || ''),
      enMenu: d.enMenu === true,
      ordenMenu: Number.isFinite(d.ordenMenu) ? Number(d.ordenMenu) : 100,
      noIndexar: d.noIndexar === true,
      secciones: validaSecciones(raiz, d.secciones || [], etiqueta, avisa),
    });
  }

  return paginas;
}

/* -------------------------------------------------------------------------
 * noticias/*.json
 * ---------------------------------------------------------------------- */

function leerNoticias(raiz, avisa) {
  const dir = join(raiz, 'noticias');
  if (!existsSync(dir)) return [];

  const noticias = [];

  for (const archivo of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const datos = leerJson(join(dir, archivo), archivo, avisa);
    if (!datos) continue;

    /* El nombre del archivo es la identidad de la noticia: la fecha la ordena
       y el resto es la dirección de su página. Deliberadamente no se lee de
       un campo dentro del JSON: al renombrar desde el panel, ese campo se
       quedaría atrás y la noticia se publicaría en otra dirección. */
    const id = archivo.replace(/\.json$/, '');

    if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(id)) {
      avisa(
        `${archivo}: el nombre del archivo tiene que ser ` +
          'AAAA-MM-DD-nombre-corto.json, en minúsculas, con guiones y sin acentos'
      );
      continue;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha || '')) {
      avisa(`${archivo}: falta "fecha" en formato AAAA-MM-DD`);
      continue;
    }

    /* Opcional, y solo si de verdad se ha corregido la noticia: se convierte
       en dateModified. No se inventa poniendo la de hoy. */
    const modificada = datos.fechaModificacion || '';

    if (modificada && !/^\d{4}-\d{2}-\d{2}$/.test(modificada)) {
      avisa(`${archivo}: "fechaModificacion" debe ser AAAA-MM-DD`);
      continue;
    }

    if (modificada && modificada < datos.fecha) {
      avisa(`${archivo}: "fechaModificacion" es anterior a "fecha"`);
      continue;
    }

    if (!datos.titulo || !datos.descripcion) {
      avisa(`${archivo}: "titulo" y "descripcion" son obligatorios`);
      continue;
    }

    const imagen = limpiaRuta(datos.imagen);

    if (imagen && !existsSync(join(raiz, imagen))) {
      avisa(`${archivo}: la imagen "${imagen}" no existe`);
      continue;
    }

    const contenido = Array.isArray(datos.contenido)
      ? datos.contenido.map(String).filter((p) => p.trim() !== '')
      : typeof datos.contenido === 'string' && datos.contenido.trim() !== ''
        ? [datos.contenido]
        : [];

    noticias.push({
      id,
      slug: id.replace(/^\d{4}-\d{2}-\d{2}-/, ''),
      fecha: datos.fecha,
      fechaModificacion: modificada,
      fechaTexto: datos.fechaTexto || fechaLegible(datos.fecha),
      titulo: String(datos.titulo),
      descripcion: String(datos.descripcion),
      contenido,
      imagen,
      imagenAlt: String(datos.imagenAlt || ''),
      categoria: String(datos.categoria || ''),
      enlace: enlaceSeguro(datos.enlace),
      textoEnlace: String(datos.textoEnlace || 'Más información'),
      mencion: String(datos.mencion || ''),
      autor: String(datos.autor || ''),
    });
  }

  /* De la más reciente a la más antigua. Si dos comparten fecha, manda el id,
     para que el orden no dependa de cómo los devuelva el sistema. */
  noticias.sort((a, b) => (a.fecha === b.fecha ? a.id.localeCompare(b.id) : b.fecha.localeCompare(a.fecha)));

  return noticias;
}
