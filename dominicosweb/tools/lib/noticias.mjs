/**
 * Las noticias: la caja del listado, la caja de la portada y la página
 * completa de cada una, con su SEO y sus datos estructurados.
 *
 * La ficha se monta sobre una retícula de 12 columnas: el titular y la
 * entradilla ocupan las 12, el texto y la foto principal van a 6 y 6 uno al
 * lado del otro, y la galería vuelve a 12 debajo de todo el texto.
 */

import { esc, documento, limpiaRuta, enlaceInterno } from './comun.mjs';

/**
 * La caja de una noticia. Es la misma pieza en la portada y en el listado:
 * foto, fecha, titular y un botón de «Leer más». Cambian dos cosas, y por eso
 * son parámetros: el nivel del titular (en el listado la página ya tiene un
 * h1, en la portada la sección tiene un h2) y si se enseña el resumen.
 *
 * La caja entera es un solo enlace. El botón es un <span> pintado como botón
 * a propósito: un <a> dentro de otro <a> no es HTML válido, y así toda la
 * caja es clicable sin dejar el botón fuera del área sensible.
 */
export function cajaNoticia(n, sitio, { base = '', prefijo = '', nivel = 2, resumen = false } = {}) {
  const img = base + (n.imagen || sitio.logo);
  const h = `h${nivel}`;

  return `        <article class="nbox reveal">
          <a class="nbox__link" href="${enlaceInterno('/noticias/' + esc(n.slug) + '.html', prefijo)}">
            <div class="nbox__media">
              <img loading="lazy" decoding="async" src="${esc(img)}" alt="${esc(n.imagenAlt)}" width="600" height="400">
${n.categoria ? `              <span class="tag nbox__tag">${esc(n.categoria)}</span>\n` : ''}            </div>
            <div class="nbox__body">
              <span class="news__d"><time datetime="${esc(n.fecha)}">${esc(n.fechaTexto)}</time></span>
              <${h} class="nbox__h">${esc(n.titulo)}</${h}>
${resumen ? `              <p class="nbox__p">${esc(n.descripcion)}</p>\n` : ''}              <span class="btn btn--ghost nbox__btn">Leer más
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>
              </span>
            </div>
          </a>
        </article>`;
}

/** La página de una noticia. */
export function paginaNoticia(noticia, anterior, siguiente, { sitio, menu, prefijo = '', base = '../', enObras = false }) {
  const url = `${sitio.dominio}/noticias/${noticia.slug}.html`;
  const imagen = noticia.imagen || sitio.logo;
  const imagenAbs = `${sitio.dominio}/${limpiaRuta(imagen)}`;

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
        /* Todas las fotos de la noticia, no solo la principal: es lo que
           permite que Google enseñe la galería en los resultados. */
        ...(noticia.imagen || noticia.galeria.length
          ? {
              image: [
                ...(noticia.imagen ? [imagenAbs] : []),
                ...noticia.galeria.map((f) => `${sitio.dominio}/${limpiaRuta(f.imagen)}`),
              ],
            }
          : {}),
        ...(noticia.categoria ? { articleSection: noticia.categoria } : {}),
        ...(noticia.autor ? { author: { '@type': 'Organization', name: noticia.autor } } : {}),
        publisher: {
          '@type': 'SportsOrganization',
          name: sitio.nombre,
          url: `${sitio.dominio}/`,
          logo: { '@type': 'ImageObject', url: `${sitio.dominio}/${limpiaRuta(sitio.logo)}` },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${sitio.dominio}/` },
          { '@type': 'ListItem', position: 2, name: 'Noticias', item: `${sitio.dominio}/noticias.html` },
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

  /* ---- columna del texto: 6 de 12 ---- */

  const texto = [];

  texto.push(
    `<div class="prose">\n            ` +
      parrafos.map((p) => `<p>${esc(p)}</p>`).join('\n            ') +
      `\n          </div>`
  );

  if (noticia.mencion) {
    texto.push(`<p class="single__note"><b>Mención:</b> ${esc(noticia.mencion)}</p>`);
  }

  if (noticia.enlace) {
    texto.push(
      `<p class="single__cta">
            <a class="btn btn--primary" href="${esc(noticia.enlace)}" target="_blank" rel="noopener noreferrer">${esc(noticia.textoEnlace)}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>
            </a>
          </p>`
    );
  }

  const bloques = [];

  /* Texto y foto van en su propia rejilla de 12, no sueltos en la de la
     página. Es lo que acota la foto pegada (`position:sticky`) a esta fila:
     si no, seguiría bajando y taparía la galería, que ocupa las 12.
     Sin foto no hay media página que llenar, así que el texto se lleva las
     12 en vez de dejar un hueco al lado. */
  if (noticia.imagen) {
    bloques.push(`<div class="col-12 single__cuerpo grid-12">
          <div class="col-6 single__texto reveal">
            ${texto.join('\n\n            ')}
          </div>

          <figure class="col-6 single__foto shot reveal">
            <img src="${base}${esc(noticia.imagen)}" alt="${esc(noticia.imagenAlt)}" fetchpriority="high" decoding="async">
          </figure>
        </div>`);
  } else {
    bloques.push(`<div class="col-12 single__texto reveal">
          ${texto.join('\n\n          ')}
        </div>`);
  }

  /* ---- galería: 12 columnas, debajo de todo el texto ---- */

  if (noticia.galeria.length) {
    const fotos = noticia.galeria
      .map(
        (f) => `            <figure class="shot galeria__it">
              <img loading="lazy" decoding="async" src="${base}${esc(f.imagen)}" alt="${esc(f.imagenAlt)}">
${f.pie ? `              <figcaption>${esc(f.pie)}</figcaption>\n` : ''}            </figure>`
      )
      .join('\n');

    bloques.push(`<section class="col-12 galeria reveal" aria-labelledby="galeria">
          <h2 class="galeria__h" id="galeria">Galería</h2>
          <div class="galeria__grid">
${fotos}
          </div>
        </section>`);
  }

  /* ---- anterior / siguiente, también a 12 ---- */

  const nav = [];

  if (anterior) {
    nav.push(`<a class="adjacent__it" href="${enlaceInterno('/noticias/' + esc(anterior.slug) + '.html', prefijo)}" rel="prev">
            <span class="news__d">Noticia anterior</span>
            <b>${esc(anterior.titulo)}</b>
          </a>`);
  }

  if (siguiente) {
    nav.push(`<a class="adjacent__it adjacent__it--next" href="${enlaceInterno('/noticias/' + esc(siguiente.slug) + '.html', prefijo)}" rel="next">
            <span class="news__d">Noticia siguiente</span>
            <b>${esc(siguiente.titulo)}</b>
          </a>`);
  }

  if (nav.length) {
    bloques.push(`<nav class="col-12 adjacent" aria-label="Más noticias">\n          ${nav.join('\n\n          ')}\n        </nav>`);
  }

  const main = `<main id="main">

  <article class="single">

    <section class="phero phero--art">
      <div class="wrap phero__in grid-12">
        <div class="col-12 single__cab">
          <a class="phero__back" href="${enlaceInterno('/noticias.html', prefijo)}">&larr; Noticias</a>
          <p class="kicker">${esc(noticia.categoria || 'Noticias')}</p>
          <h1 class="h2">${esc(noticia.titulo)}</h1>
        </div>
        <p class="col-12 lead single__sub">${esc(noticia.subtitulo)}</p>
        <p class="col-12 single__meta"><span class="news__d">${meta.join('\n            ')}</span></p>
      </div>
    </section>

    <section class="section section--top">
      <div class="wrap grid-12">

        ${bloques.join('\n\n        ')}

      </div>
    </section>

  </article>

</main>`;

  const metasExtra = [`<meta property="article:published_time" content="${esc(noticia.fecha)}">`];
  if (noticia.fechaModificacion) {
    metasExtra.push(`<meta property="article:modified_time" content="${esc(noticia.fechaModificacion)}">`);
  }
  if (noticia.categoria) {
    metasExtra.push(`<meta property="article:section" content="${esc(noticia.categoria)}">`);
  }

  return documento({
    sitio,
    menu,
    base,
    prefijo,
    titulo: `${noticia.titulo} — ${sitio.nombre}`,
    /* Al compartir se ve el titular a secas: el nombre del club ya va en
       og:site_name, y repetirlo come el espacio que WhatsApp da al titular. */
    tituloCompartir: noticia.titulo,
    descripcion: noticia.descripcion,
    /* En vista previa la página no es la de verdad: no se anuncia como
       canónica de nada y se pide que no se indexe. */
    canonical: enObras ? '' : url,
    robots: enObras ? 'noindex' : '',
    tipoOg: 'article',
    imagenCompartir: imagen,
    imagenCompartirAlt: noticia.imagenAlt,
    metasExtra: enObras ? [] : metasExtra,
    jsonLd: enObras ? null : jsonLd,
    main,
  });
}
