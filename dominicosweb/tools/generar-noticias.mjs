#!/usr/bin/env node
/**
 * Genera, a partir de los JSON de /noticias/, todo lo que la web necesita:
 *
 *   noticias/<slug>.html    una página por noticia, con su SEO
 *   noticias.html           el listado, escrito DENTRO del HTML
 *   index.html              las 3 últimas noticias de la portada
 *   sitemap.xml             el mapa del sitio completo
 *
 * Que el listado se escriba en el HTML y no lo pinte JavaScript es lo que
 * hace que Google vea las noticias en el primer rastreo, sin depender de que
 * ejecute el script, y que cada noticia nueva quede enlazada desde la portada
 * y desde el listado en vez de quedarse huérfana.
 *
 * No tiene dependencias: se ejecuta con `node tools/generar-noticias.mjs`
 * desde la carpeta dominicosweb/. También lo lanza el workflow de GitHub
 * Pages antes de publicar, así que si se olvida ejecutarlo a mano no pasa
 * nada.
 *
 * Todo lo que sale de un JSON se escapa antes de entrar en el HTML: las
 * noticias son datos, nunca marcado.
 */

import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_NOTICIAS = join(RAIZ, 'noticias');

/* El dominio real del sitio, el que fija CNAME. Las URL absolutas (canonical,
   Open Graph, sitemap) tienen que ser absolutas de verdad, así que este es el
   único sitio donde se escribe el dominio. */
const SITIO = 'https://baloncestodominicos.es';
const NOMBRE_SITIO = 'CB Dominicos Zaragoza';

/* Páginas fijas que también entran en el sitemap. Sin <priority>: Google lo
   ignora desde hace años. <lastmod> sí lo usa, y sale de la noticia más
   reciente, porque es lo que cambia en estas dos páginas. */
const PAGINAS = ['/', '/noticias.html'];

/* Cuántas noticias se ven en la portada. */
const EN_PORTADA = 3;

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/* -------------------------------------------------------------------------
 * Utilidades
 * ---------------------------------------------------------------------- */

/** Escapa texto para meterlo entre etiquetas o dentro de un atributo. */
function esc(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapa una cadena para incrustarla en un <script type="application/ld+json">. */
function escJson(objeto) {
  return JSON.stringify(objeto, null, 2).replace(/</g, '\\u003c');
}

/** «2022-04-22» → «22 abr 2022». */
function fechaLegible(iso) {
  const [a, m, d] = iso.split('-');
  return `${Number(d)} ${MESES[Number(m) - 1]} ${a}`;
}

/** El slug de la página es el id sin el prefijo de fecha. */
function slugDe(id) {
  return id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** Rutas internas relativas al raíz del sitio, sin barra inicial. */
function limpiaRuta(ruta) {
  return String(ruta || '').replace(/^\/+/, '');
}

/**
 * Sustituye lo que haya entre dos marcas de comentario dentro de un archivo.
 * Así el listado vive en el HTML de verdad, pero se regenera solo.
 */
function inyectar(archivo, marca, contenido) {
  const ruta = join(RAIZ, archivo);
  const html = readFileSync(ruta, 'utf8');
  const ini = `<!-- ${marca}:INICIO -->`;
  const fin = `<!-- ${marca}:FIN -->`;
  const a = html.indexOf(ini);
  const b = html.indexOf(fin);

  if (a === -1 || b === -1 || b < a) {
    console.error(`\n${archivo}: no encuentro las marcas ${ini} … ${fin}.`);
    console.error('Sin ellas no sé dónde escribir las noticias. Restáuralas y vuelve a intentarlo.\n');
    process.exit(1);
  }

  const nuevo = html.slice(0, a + ini.length) + '\n' + contenido + '\n      ' + html.slice(b);

  if (nuevo !== html) writeFileSync(ruta, nuevo);

  return nuevo !== html;
}

/** Solo dejamos pasar enlaces externos con un esquema seguro. */
function enlaceSeguro(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
}

/* -------------------------------------------------------------------------
 * Lectura y validación de las noticias
 * ---------------------------------------------------------------------- */

function leerNoticias() {
  const archivos = readdirSync(DIR_NOTICIAS)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const noticias = [];
  const errores = [];

  for (const archivo of archivos) {
    let datos;

    try {
      datos = JSON.parse(readFileSync(join(DIR_NOTICIAS, archivo), 'utf8'));
    } catch (e) {
      errores.push(`${archivo}: no es un JSON válido (${e.message})`);
      continue;
    }

    const id = datos.id || archivo.replace(/\.json$/, '');

    if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(id)) {
      errores.push(`${archivo}: el "id" debe ser AAAA-MM-DD-slug-en-minusculas (es "${id}")`);
      continue;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha || '')) {
      errores.push(`${archivo}: falta "fecha" en formato AAAA-MM-DD`);
      continue;
    }

    /* Opcional, y solo si de verdad se ha corregido la noticia: se convierte
       en dateModified. No se inventa poniendo la de hoy. */
    const modificada = datos.fechaModificacion || '';

    if (modificada && !/^\d{4}-\d{2}-\d{2}$/.test(modificada)) {
      errores.push(`${archivo}: "fechaModificacion" debe ser AAAA-MM-DD`);
      continue;
    }

    if (modificada && modificada < datos.fecha) {
      errores.push(`${archivo}: "fechaModificacion" es anterior a "fecha"`);
      continue;
    }

    if (!datos.titulo || !datos.descripcion) {
      errores.push(`${archivo}: "titulo" y "descripcion" son obligatorios`);
      continue;
    }

    const imagen = limpiaRuta(datos.imagen);

    if (imagen && !existsSync(join(RAIZ, imagen))) {
      errores.push(`${archivo}: la imagen "${imagen}" no existe`);
      continue;
    }

    const contenido = Array.isArray(datos.contenido)
      ? datos.contenido.map(String).filter((p) => p.trim() !== '')
      : typeof datos.contenido === 'string' && datos.contenido.trim() !== ''
        ? [datos.contenido]
        : [];

    noticias.push({
      id,
      slug: slugDe(id),
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

  if (errores.length) {
    console.error('\nNo se ha generado nada. Corrige esto primero:\n');
    errores.forEach((e) => console.error('  · ' + e));
    console.error('');
    process.exit(1);
  }

  /* De la más reciente a la más antigua. Si dos comparten fecha, manda el id,
     para que el orden no dependa de cómo los devuelva el sistema. */
  noticias.sort((a, b) => (a.fecha === b.fecha ? a.id.localeCompare(b.id) : b.fecha.localeCompare(a.fecha)));

  return noticias;
}

/* -------------------------------------------------------------------------
 * Trozos de página compartidos con index.html
 * ---------------------------------------------------------------------- */

/* `base` es el prefijo para llegar al raíz del sitio: '' desde la portada,
   '../' desde una página dentro de /noticias/. Se usa solo para los recursos
   (CSS, imágenes, script).

   Los enlaces a PÁGINAS, en cambio, van en absoluto desde la raíz ('/',
   '/#club', '/noticias.html'). Es a propósito: la canonical de la portada es
   https://baloncestodominicos.es/ y enlazar internamente a "index.html"
   apuntaría a una segunda dirección válida de la misma página, que Google
   tendría que rastrear y descartar. */

function cabecera(base) {
  return `<div class="progress" id="progress" aria-hidden="true"></div>

<a class="skip" href="#main">Saltar al contenido</a>

<header class="nav" id="nav">
  <div class="nav__in">
    <a class="brand" href="/">
      <img src="${base}images/logo.jpg" alt="Escudo CB Dominicos Zaragoza" width="44" height="44">
      <span class="brand__txt"><b>Dominicos</b><small>Zaragoza · Baloncesto</small></span>
    </a>

    <nav class="menu" id="menu" aria-label="Principal">
      <a href="/#club">Club</a>
      <a href="/#equipos">Equipos</a>
      <a href="/#pista">Pista</a>
      <a href="/noticias.html">Noticias</a>
      <a href="/#inscripciones">Inscripciones</a>
      <a href="/#contacto">Contacto</a>
      <a class="menu__cta" href="/#inscripciones">Ven a jugar</a>
    </nav>

    <div class="nav__tools">
      <button class="icon-btn" id="theme" type="button" aria-label="Cambiar tema" title="Cambiar tema">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-sun" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41"/><circle class="i-sun" cx="12" cy="12" r="4"/><path class="i-moon" d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>
      </button>
      <button class="burger" id="burger" type="button" aria-label="Menú" aria-expanded="false" aria-controls="menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>`;
}

function pie(base) {
  return `<footer class="foot">
  <div class="wrap foot__in">
    <div class="foot__brand">
      <img src="${base}images/logo.jpg" alt="" width="52" height="52">
      <p><b>Club Baloncesto Dominicos</b><br>Zaragoza</p>
    </div>
    <nav class="foot__nav" aria-label="Pie">
      <a href="/#club">Club</a><a href="/#equipos">Equipos</a><a href="/#pista">Instalaciones</a>
      <a href="/noticias.html">Noticias</a>
      <a href="/#inscripciones">Inscripciones</a><a href="/#contacto">Contacto</a>
    </nav>
    <p class="foot__legal">© <span id="year">2026</span> CB Dominicos Zaragoza · Aviso legal · Política de privacidad · Cookies</p>
  </div>
</footer>

<!-- LIGHTBOX -->
<div class="lb" id="lb" hidden>
  <button class="lb__x" id="lbX" type="button" aria-label="Cerrar">✕</button>
  <img id="lbImg" src="" alt="">
</div>

<script src="${base}script.js"></script>`;
}

/* -------------------------------------------------------------------------
 * Listado: tarjeta (noticias.html) y fila (portada)
 * ---------------------------------------------------------------------- */

/** Tarjeta del listado. Mismo marcado que ya usaba el diseño. */
function tarjetaNoticia(n) {
  const img = n.imagen || 'images/logo.jpg';

  return `        <article class="ncard reveal">
          <a class="ncard__link" href="noticias/${esc(n.slug)}.html">
            <span class="ncard__media">
              <img loading="lazy" decoding="async" src="${esc(img)}" alt="${esc(n.imagenAlt)}" width="600" height="400">
${n.categoria ? `              <span class="tag ncard__tag">${esc(n.categoria)}</span>\n` : ''}            </span>
            <span class="ncard__body">
              <span class="news__d"><time datetime="${esc(n.fecha)}">${esc(n.fechaTexto)}</time></span>
              <h2 class="ncard__h">${esc(n.titulo)}</h2>
              <span class="ncard__p">${esc(n.descripcion)}</span>
${n.mencion ? `              <span class="news__by">${esc(n.mencion)}</span>\n` : ''}              <span class="news__go">Leer</span>
            </span>
          </a>
        </article>`;
}

/** Fila de la portada. El texto del enlace es el titular, no «leer más». */
function filaNoticia(n) {
  return `        <a class="news__it reveal" href="noticias/${esc(n.slug)}.html">
          <span class="news__d"><time datetime="${esc(n.fecha)}">${esc(n.fechaTexto)}</time></span>
          <h3>${esc(n.titulo)}</h3>
          <p>${esc(n.descripcion)}</p>
          <span class="news__go">Leer</span>
        </a>`;
}

/* -------------------------------------------------------------------------
 * Página de una noticia
 * ---------------------------------------------------------------------- */

function paginaNoticia(noticia, anterior, siguiente) {
  const base = '../';
  const url = `${SITIO}/noticias/${noticia.slug}.html`;
  const imagenAbs = noticia.imagen ? `${SITIO}/${noticia.imagen}` : `${SITIO}/images/logo.jpg`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: noticia.titulo,
        description: noticia.descripcion,
        datePublished: noticia.fecha,
        ...(noticia.fechaModificacion ? { dateModified: noticia.fechaModificacion } : {}),
        inLanguage: 'es-ES',
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
        ...(noticia.imagen ? { image: [imagenAbs] } : {}),
        ...(noticia.categoria ? { articleSection: noticia.categoria } : {}),
        ...(noticia.autor ? { author: { '@type': 'Organization', name: noticia.autor } } : {}),
        publisher: {
          '@type': 'SportsOrganization',
          name: NOMBRE_SITIO,
          url: `${SITIO}/`,
          logo: { '@type': 'ImageObject', url: `${SITIO}/images/logo.jpg` },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO}/` },
          { '@type': 'ListItem', position: 2, name: 'Noticias', item: `${SITIO}/noticias.html` },
          { '@type': 'ListItem', position: 3, name: noticia.titulo, item: url },
        ],
      },
    ],
  };

  const parrafos = noticia.contenido.length ? noticia.contenido : [noticia.descripcion];

  /* Línea de datos: fecha · categoría · autor. */
  const meta = [`<time datetime="${esc(noticia.fecha)}">${esc(noticia.fechaTexto)}</time>`];

  if (noticia.categoria) {
    meta.push('<span class="news__sep">·</span>', `<span class="news__cat">${esc(noticia.categoria)}</span>`);
  }

  if (noticia.autor) {
    meta.push('<span class="news__sep">·</span>', `<span class="news__by">${esc(noticia.autor)}</span>`);
  }

  const bloques = [];

  bloques.push(`<p class="single__meta"><span class="news__d">${meta.join('\n            ')}</span></p>`);

  bloques.push(
    `<div class="prose reveal">\n            ` +
      parrafos.map((p) => `<p>${esc(p)}</p>`).join('\n            ') +
      `\n          </div>`
  );

  if (noticia.mencion) {
    bloques.push(`<p class="single__note"><b>Mención:</b> ${esc(noticia.mencion)}</p>`);
  }

  if (noticia.enlace) {
    bloques.push(
      `<p class="single__cta">
            <a class="btn btn--primary" href="${esc(noticia.enlace)}" target="_blank" rel="noopener noreferrer">${esc(noticia.textoEnlace)}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>
            </a>
          </p>`
    );
  }

  /* Anterior / siguiente en orden cronológico de lectura. */
  const nav = [];

  if (anterior) {
    nav.push(`<a class="adjacent__it" href="/noticias/${esc(anterior.slug)}.html" rel="prev">
            <span class="news__d">Noticia anterior</span>
            <b>${esc(anterior.titulo)}</b>
          </a>`);
  }

  if (siguiente) {
    nav.push(`<a class="adjacent__it adjacent__it--next" href="/noticias/${esc(siguiente.slug)}.html" rel="next">
            <span class="news__d">Noticia siguiente</span>
            <b>${esc(siguiente.titulo)}</b>
          </a>`);
  }

  if (nav.length) {
    bloques.push(`<nav class="adjacent" aria-label="Más noticias">\n          ${nav.join('\n\n          ')}\n        </nav>`);
  }

  return `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(noticia.titulo)} — ${esc(NOMBRE_SITIO)}</title>
<meta name="description" content="${esc(noticia.descripcion)}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="canonical" href="${esc(url)}">

<meta property="og:type" content="article">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${esc(NOMBRE_SITIO)}">
<meta property="og:title" content="${esc(noticia.titulo)}">
<meta property="og:description" content="${esc(noticia.descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(imagenAbs)}">
${noticia.imagenAlt ? `<meta property="og:image:alt" content="${esc(noticia.imagenAlt)}">\n` : ''}<meta property="article:published_time" content="${esc(noticia.fecha)}">
${noticia.fechaModificacion ? `<meta property="article:modified_time" content="${esc(noticia.fechaModificacion)}">\n` : ''}${noticia.categoria ? `<meta property="article:section" content="${esc(noticia.categoria)}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(noticia.titulo)}">
<meta name="twitter:description" content="${esc(noticia.descripcion)}">
<meta name="twitter:image" content="${esc(imagenAbs)}">

<link rel="icon" href="${base}images/favicon.jpg">
<link rel="apple-touch-icon" href="${base}images/logo.jpg">
<link rel="manifest" href="${base}manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=Archivo+Black&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}styles.css">

<script type="application/ld+json">
${escJson(jsonLd)}
</script>
</head>
<body>

${cabecera(base)}

<main id="main">

  <article class="single">

    <section class="phero${noticia.imagen ? ' phero--img' : ''}">
      ${
        noticia.imagen
          ? `<div class="phero__media">
        <img src="${base}${esc(noticia.imagen)}" alt="${esc(noticia.imagenAlt)}" fetchpriority="high" decoding="async">
      </div>`
          : ''
      }

      <div class="wrap phero__in">
        <a class="phero__back" href="/noticias.html">&larr; Noticias</a>
        <p class="kicker">${esc(noticia.categoria || 'Noticias')}</p>
        <h1 class="h2">${esc(noticia.titulo)}</h1>
        <p class="lead">${esc(noticia.descripcion)}</p>
      </div>
    </section>

    <section class="section section--top">
      <div class="wrap">

          ${bloques.join('\n\n          ')}

      </div>
    </section>

  </article>

</main>

${pie(base)}
</body>
</html>
`;
}

/* -------------------------------------------------------------------------
 * sitemap.xml
 * ---------------------------------------------------------------------- */

function sitemap(noticias) {
  /* La portada y el listado cambian cuando se publica una noticia, así que su
     lastmod es el de la más reciente. Si no hay ninguna, se omite: mejor sin
     lastmod que con una fecha inventada. */
  const masReciente = noticias.length ? noticias[0].fecha : '';

  const urls = [
    ...PAGINAS.map((url) => ({ loc: SITIO + url, lastmod: masReciente })),
    ...noticias.map((n) => ({
      loc: `${SITIO}/noticias/${n.slug}.html`,
      lastmod: n.fechaModificacion || n.fecha,
    })),
  ];

  const cuerpo = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${esc(u.loc)}</loc>\n` +
        (u.lastmod ? `    <lastmod>${esc(u.lastmod)}</lastmod>\n` : '') +
        `  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generado por tools/generar-noticias.mjs. No editar a mano.
     Solo páginas indexables: ni la de error, ni CSS, ni JS, ni imágenes
     sueltas. Cada URL coincide exactamente con la canonical de su página. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cuerpo}
</urlset>
`;
}

/* -------------------------------------------------------------------------
 * Ejecución
 * ---------------------------------------------------------------------- */

const noticias = leerNoticias();

/* Borramos las páginas generadas en una pasada anterior, para que al quitar
   un JSON no se quede su HTML huérfano. */
for (const archivo of readdirSync(DIR_NOTICIAS).filter((f) => f.endsWith('.html'))) {
  unlinkSync(join(DIR_NOTICIAS, archivo));
}

noticias.forEach((noticia, i) => {
  /* "Anterior" es la más antigua; "siguiente", la más reciente. */
  const anterior = noticias[i + 1] || null;
  const siguiente = noticias[i - 1] || null;

  writeFileSync(join(DIR_NOTICIAS, `${noticia.slug}.html`), paginaNoticia(noticia, anterior, siguiente));
});

/* El listado y la portada se escriben en el HTML, no los pinta JavaScript:
   así Google los ve en el primer rastreo y ninguna noticia queda sin enlaces
   que apunten a ella. */
const vacio = '        <p class="nstate">Todavía no hay noticias publicadas.</p>';

const cambios = [
  ['noticias.html', 'NOTICIAS', noticias.length ? noticias.map(tarjetaNoticia).join('\n') : vacio],
  ['index.html', 'NOTICIAS', noticias.length ? noticias.slice(0, EN_PORTADA).map(filaNoticia).join('\n') : vacio],
].filter(([archivo, marca, html]) => inyectar(archivo, marca, html));

writeFileSync(join(RAIZ, 'sitemap.xml'), sitemap(noticias));

console.log(`${noticias.length} noticias:`);
noticias.forEach((n) => console.log(`  · ${n.fecha}  noticias/${n.slug}.html`));
console.log(`\nEn la portada: las ${Math.min(EN_PORTADA, noticias.length)} más recientes`);
console.log(cambios.length ? `Actualizados: ${cambios.map((c) => c[0]).join(', ')}` : 'Listados ya al día');
console.log('Actualizado sitemap.xml');
