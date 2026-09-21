/**
 * Las noticias: la tarjeta del listado, la fila de la portada y la página
 * completa de cada una, con su SEO y sus datos estructurados.
 */

import { esc, documento, limpiaRuta, enlaceInterno } from './comun.mjs';

/** Tarjeta del listado de noticias.html. */
export function tarjetaNoticia(n, sitio, base = '') {
  const img = base + (n.imagen || sitio.logo);

  return `        <article class="ncard reveal">
          <a class="ncard__link" href="noticias/${esc(n.slug)}.html">
            <div class="ncard__media">
              <img loading="lazy" decoding="async" src="${esc(img)}" alt="${esc(n.imagenAlt)}" width="600" height="400">
${n.categoria ? `              <span class="tag ncard__tag">${esc(n.categoria)}</span>\n` : ''}            </div>
            <div class="ncard__body">
              <span class="news__d"><time datetime="${esc(n.fecha)}">${esc(n.fechaTexto)}</time></span>
              <h2 class="ncard__h">${esc(n.titulo)}</h2>
              <span class="ncard__p">${esc(n.descripcion)}</span>
${n.mencion ? `              <span class="news__by">${esc(n.mencion)}</span>\n` : ''}              <span class="news__go">Leer</span>
            </div>
          </a>
        </article>`;
}

/** Fila de la portada. El texto del enlace es el titular, no «leer más». */
export function filaNoticia(n) {
  return `        <a class="news__it reveal" href="noticias/${esc(n.slug)}.html">
          <span class="news__d"><time datetime="${esc(n.fecha)}">${esc(n.fechaTexto)}</time></span>
          <h3>${esc(n.titulo)}</h3>
          <p>${esc(n.descripcion)}</p>
          <span class="news__go">Leer</span>
        </a>`;
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
        ...(noticia.imagen ? { image: [imagenAbs] } : {}),
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
    bloques.push(`<nav class="adjacent" aria-label="Más noticias">\n          ${nav.join('\n\n          ')}\n        </nav>`);
  }

  const main = `<main id="main">

  <article class="single">

    <section class="phero${noticia.imagen ? ' phero--img' : ''}">
${
  noticia.imagen
    ? `      <div class="phero__media">
        <img src="${base}${esc(noticia.imagen)}" alt="${esc(noticia.imagenAlt)}" fetchpriority="high" decoding="async">
      </div>

`
    : ''
}      <div class="wrap phero__in">
        <a class="phero__back" href="${enlaceInterno('/noticias.html', prefijo)}">&larr; Noticias</a>
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
    /* Con foto de cabecera, la barra arranca sobre una imagen oscura y
       necesita colores claros aunque el tema sea claro. Sin foto, no. */
    claseBody: noticia.imagen ? 'nav-sobre-media' : '',
    main,
  });
}
