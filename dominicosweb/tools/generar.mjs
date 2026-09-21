#!/usr/bin/env node
/**
 * Genera la web entera a partir de los archivos de datos.
 *
 *   datos/sitio.json      identidad, contacto, redes        → todas las páginas
 *   datos/menu.json       menú y pie                        → todas las páginas
 *   datos/portada.json    secciones de la portada           → index.html
 *   datos/error404.json   la página de error                → 404.html
 *   paginas/<slug>.json   una página suelta                 → <slug>.html
 *   noticias/<id>.json    una noticia                       → noticias/<slug>.html
 *
 * y, de paso, el listado de noticias.html, el sitemap, el manifest, el
 * robots.txt y el CNAME, para que el dominio y el nombre del club estén
 * escritos en un solo sitio.
 *
 * Que el listado de noticias se escriba en el HTML y no lo pinte JavaScript
 * es lo que hace que Google vea las noticias en el primer rastreo, sin
 * depender de que ejecute el script, y que cada noticia nueva quede enlazada
 * desde la portada y desde el listado en vez de quedarse huérfana.
 *
 * No tiene dependencias: se ejecuta con `node tools/generar.mjs` desde la
 * carpeta dominicosweb/. También lo lanza el workflow de GitHub Pages antes
 * de publicar, así que si se olvida ejecutarlo a mano no pasa nada.
 */

import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { esc, documento, destino, boton, limpiaRuta } from './lib/comun.mjs';
import { leerTodo } from './lib/datos.mjs';
import { pintarSecciones } from './lib/secciones.mjs';
import { tarjetaNoticia, filaNoticia, paginaNoticia } from './lib/noticias.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const { sitio, menu, portada, paginas, noticias, errores } = leerTodo(RAIZ);

if (errores.length) {
  console.error('\nNo se ha generado nada. Corrige esto primero:\n');
  errores.forEach((e) => console.error('  · ' + e));
  console.error('');
  process.exit(1);
}

/* Las páginas marcadas «mostrar en el menú» se añaden solas, después de los
   enlaces fijos y antes del botón. Así crear una página basta para que se
   pueda llegar a ella: una página a la que no enlaza nadie no la encuentra
   ni Google ni quien entra en la web. */
const delMenu = paginas
  .filter((p) => p.enMenu)
  .sort((a, b) => (a.ordenMenu === b.ordenMenu ? a.titulo.localeCompare(b.titulo) : a.ordenMenu - b.ordenMenu))
  .map((p) => ({ texto: p.titulo, destino: `/${p.slug}.html`, anclaPortada: '' }));

menu.enlaces = menu.enlaces.concat(delMenu);

/* -------------------------------------------------------------------------
 * Portada
 * ---------------------------------------------------------------------- */

const EN_PORTADA = (portada.secciones.find((s) => s.tipo === 'noticias') || {}).cuantas || 3;
const sinNoticias = '        <p class="nstate">Todavía no hay noticias publicadas.</p>';

function construyePortada() {
  const ctx = {
    sitio,
    base: '',
    enPortada: true,
    filasNoticias: noticias.length ? noticias.slice(0, EN_PORTADA).map(filaNoticia).join('\n') : sinNoticias,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsOrganization',
        '@id': `${sitio.dominio}/#club`,
        name: sitio.nombreLargo,
        alternateName: sitio.nombre,
        sport: 'Baloncesto',
        url: `${sitio.dominio}/`,
        logo: `${sitio.dominio}/${limpiaRuta(sitio.logo)}`,
        image: `${sitio.dominio}/${limpiaRuta(sitio.imagenCompartir || sitio.logo)}`,
        email: sitio.email,
        address: { '@type': 'PostalAddress', addressLocality: sitio.ciudad, addressCountry: 'ES' },
        sameAs: sitio.redes.map((r) => r.url),
      },
      {
        '@type': 'WebSite',
        name: sitio.nombre,
        url: `${sitio.dominio}/`,
        inLanguage: 'es-ES',
        publisher: { '@id': `${sitio.dominio}/#club` },
      },
    ],
  };

  /* Si la portada arranca con una foto a sangre, la barra de arriba se pinta
     sobre ella y necesita colores claros aunque el tema sea claro. */
  const primera = portada.secciones[0];
  const sobreFoto = primera && primera.tipo === 'hero' && primera.imagen;

  return documento({
    sitio,
    menu,
    base: '',
    enPortada: true,
    titulo: portada.titulo,
    descripcion: portada.descripcion,
    descripcionCompartir: portada.descripcionCompartir,
    canonical: `${sitio.dominio}/`,
    imagenCompartir: sitio.imagenCompartir,
    jsonLd,
    claseBody: sobreFoto ? 'nav-sobre-media' : '',
    main: `<main id="main">\n\n${pintarSecciones(portada.secciones, ctx)}\n\n</main>`,
  });
}

/* -------------------------------------------------------------------------
 * Listado de noticias
 * ---------------------------------------------------------------------- */

function construyeListado() {
  const ruta = join(RAIZ, 'datos', 'pagina-noticias.json');
  const d = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : {};

  const url = `${sitio.dominio}/noticias.html`;
  const titulo = String(d.tituloSeo || 'Noticias');
  const descripcion = String(d.descripcionSeo || '');
  const resumen = String(d.descripcionCompartir || descripcion);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: String(d.nombreSchema || d.tituloSeo || 'Noticias'),
        description: String(d.descripcionSchema || descripcion),
        url,
        inLanguage: 'es-ES',
        isPartOf: { '@type': 'WebSite', name: sitio.nombre, url: `${sitio.dominio}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${sitio.dominio}/` },
          { '@type': 'ListItem', position: 2, name: 'Noticias', item: url },
        ],
      },
    ],
  };

  const tarjetas = noticias.length ? noticias.map((n) => tarjetaNoticia(n, sitio)).join('\n') : sinNoticias;

  const main = `<main id="main">

  <section class="phero">
    <div class="wrap phero__in">
      <a class="phero__back" href="/">&larr; Inicio</a>
      <p class="kicker">${esc(d.kicker || 'Actualidad')}</p>
      <h1 class="h2">${esc(d.titulo || 'Noticias')}</h1>
      <p class="lead">${esc(d.descripcion || '')}</p>
    </div>
  </section>

  <section class="section section--top">
    <div class="wrap">
      <div class="ncards">
${tarjetas}
      </div>
    </div>
  </section>

</main>`;

  return documento({
    sitio,
    menu,
    titulo,
    descripcion,
    canonical: url,
    descripcionCompartir: resumen,
    jsonLd,
    main,
    imagenCompartir: sitio.imagenCompartir,
  });
}

/* -------------------------------------------------------------------------
 * Páginas sueltas
 * ---------------------------------------------------------------------- */

function construyePagina(p) {
  const url = `${sitio.dominio}/${p.slug}.html`;
  const ctx = { sitio, base: '', enPortada: false, filasNoticias: sinNoticias };

  const media = p.imagen
    ? `    <div class="phero__media">
      <img src="${esc(p.imagen)}" alt="${esc(p.imagenAlt)}" fetchpriority="high" decoding="async">
    </div>

`
    : '';

  const main = `<main id="main">

  <section class="phero${p.imagen ? ' phero--img' : ''}">
${media}    <div class="wrap phero__in">
      <a class="phero__back" href="/">&larr; Inicio</a>
${p.kicker ? `      <p class="kicker">${esc(p.kicker)}</p>\n` : ''}      <h1 class="h2">${esc(p.titulo)}</h1>
      <p class="lead">${esc(p.descripcion)}</p>
    </div>
  </section>

${pintarSecciones(p.secciones, { ...ctx, primeraArriba: true })}

</main>`;

  return documento({
    sitio,
    menu,
    titulo: `${p.titulo} — ${sitio.nombre}`,
    descripcion: p.descripcion,
    canonical: p.noIndexar ? '' : url,
    robots: p.noIndexar ? 'noindex' : '',
    imagenCompartir: p.imagen || sitio.imagenCompartir,
    imagenCompartirAlt: p.imagenAlt,
    claseBody: p.imagen ? 'nav-sobre-media' : '',
    jsonLd: p.noIndexar
      ? null
      : {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: p.titulo,
              description: p.descripcion,
              url,
              inLanguage: 'es-ES',
              isPartOf: { '@type': 'WebSite', name: sitio.nombre, url: `${sitio.dominio}/` },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${sitio.dominio}/` },
                { '@type': 'ListItem', position: 2, name: p.titulo, item: url },
              ],
            },
          ],
        },
    main,
  });
}

/* -------------------------------------------------------------------------
 * Página de error
 * ---------------------------------------------------------------------- */

function construye404() {
  const ruta = join(RAIZ, 'datos', 'error404.json');
  const d = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : {};

  const enlaces = (d.enlaces || [])
    .map((e) => '          ' + boton(e, false, { estilo: e.principal ? 'primario' : 'fantasma' }))
    .filter((s) => s.trim())
    .join('\n');

  const main = `<main id="main">

  <section class="phero">
    <div class="wrap phero__in">
      <p class="kicker">${esc(d.kicker || 'Error 404')}</p>
      <h1 class="h2">${esc(d.titulo || 'Página no encontrada')}</h1>
      <p class="lead">${esc(d.descripcion || '')}</p>
    </div>
  </section>

  <section class="section section--top">
    <div class="wrap">
      <div class="empty reveal">
        <p class="lead">${esc(d.texto || '')}</p>

        <p class="e404__links">
${enlaces}
        </p>
      </div>
    </div>
  </section>

</main>`;

  /* OJO CON LAS RUTAS: GitHub Pages sirve este mismo archivo para cualquier
     dirección que no exista, incluidas las profundas como /noticias/loquesea.
     Si las rutas fueran relativas, el navegador buscaría styles.css dentro de
     /noticias/ y la página saldría sin estilos. Por eso aquí, y solo aquí, el
     prefijo de los recursos es «/»: el sitio se publica en la raíz. */
  return documento({
    sitio,
    menu,
    base: '/',
    titulo: String(d.tituloSeo || 'Página no encontrada'),
    descripcion: d.descripcionSeo || d.descripcion || '',
    robots: 'noindex',
    main,
  });
}

/* -------------------------------------------------------------------------
 * sitemap.xml, robots.txt, manifest y CNAME
 * ---------------------------------------------------------------------- */

function sitemap() {
  /* La portada y el listado cambian cuando se publica una noticia, así que su
     lastmod es el de la más reciente. Si no hay ninguna, se omite: mejor sin
     lastmod que con una fecha inventada. */
  const masReciente = noticias.length ? noticias[0].fecha : '';

  const urls = [
    { loc: `${sitio.dominio}/`, lastmod: masReciente },
    { loc: `${sitio.dominio}/noticias.html`, lastmod: masReciente },
    ...paginas.filter((p) => !p.noIndexar).map((p) => ({ loc: `${sitio.dominio}/${p.slug}.html`, lastmod: '' })),
    ...noticias.map((n) => ({
      loc: `${sitio.dominio}/noticias/${n.slug}.html`,
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
<!-- Generado por tools/generar.mjs. No editar a mano.
     Solo páginas indexables: ni la de error, ni CSS, ni JS, ni imágenes
     sueltas. Cada URL coincide exactamente con la canonical de su página. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cuerpo}
</urlset>
`;
}

function robots() {
  return `# ${sitio.nombre} — ${sitio.dominio.replace(/^https?:\/\//, '')}
#
# Generado por tools/generar.mjs. No editar a mano.
#
# La web es pública entera: se indexa todo. No se bloquea el CSS, el
# JavaScript ni las imágenes, porque Google necesita cargarlos para ver la
# página como la ve una persona.
#
# robots.txt no protege nada: solo pide a los buscadores que se porten bien.
# Lo que no deba ser público, sencillamente no se sube.

User-agent: *
Allow: /

Sitemap: ${sitio.dominio}/sitemap.xml
`;
}

function manifest() {
  return (
    JSON.stringify(
      {
        name: sitio.nombre,
        short_name: sitio.nombreCorto,
        description: sitio.descripcionApp,
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'browser',
        background_color: sitio.colorFondo,
        theme_color: sitio.colorTema,
        icons: [{ src: `/${limpiaRuta(sitio.logo)}`, sizes: '300x300', type: 'image/jpeg' }],
      },
      null,
      2
    ) + '\n'
  );
}

/* -------------------------------------------------------------------------
 * Escritura
 * ---------------------------------------------------------------------- */

const escritos = [];
const borrados = [];

function escribe(ruta, contenido) {
  const destinoAbs = join(RAIZ, ruta);
  mkdirSync(dirname(destinoAbs), { recursive: true });
  const antes = existsSync(destinoAbs) ? readFileSync(destinoAbs, 'utf8') : null;
  if (antes !== contenido) {
    writeFileSync(destinoAbs, contenido);
    escritos.push(ruta);
  }
}

escribe('index.html', construyePortada());
escribe('noticias.html', construyeListado());
escribe('404.html', construye404());

paginas.forEach((p) => escribe(`${p.slug}.html`, construyePagina(p)));

noticias.forEach((noticia, i) => {
  /* "Anterior" es la más antigua; "siguiente", la más reciente. */
  escribe(`noticias/${noticia.slug}.html`, paginaNoticia(noticia, noticias[i + 1] || null, noticias[i - 1] || null, { sitio, menu }));
});

/* Lo que sobra de una pasada anterior: al quitar una noticia o una página,
   su .html tiene que desaparecer, o se quedaría publicado y accesible aunque
   ya no salga en ningún listado.

   Se hace DESPUÉS de escribir, no antes: si se borrara primero, `escribe()`
   encontraría todo vacío y daría por cambiado lo que no ha cambiado. */
function limpiaSobrantes(dir, esperados, fijos = []) {
  const ruta = dir ? join(RAIZ, dir) : RAIZ;
  for (const archivo of readdirSync(ruta).filter((f) => f.endsWith('.html'))) {
    const slug = archivo.replace(/\.html$/, '');
    if (fijos.includes(slug) || esperados.has(slug)) continue;
    unlinkSync(join(ruta, archivo));
    borrados.push(dir ? `${dir}/${archivo}` : archivo);
  }
}

limpiaSobrantes('noticias', new Set(noticias.map((n) => n.slug)));
limpiaSobrantes('', new Set(paginas.map((p) => p.slug)), ['index', 'noticias', '404']);

escribe('sitemap.xml', sitemap());
escribe('robots.txt', robots());
escribe('manifest.webmanifest', manifest());
escribe('CNAME', sitio.dominio.replace(/^https?:\/\//, '') + '\n');

/* -------------------------------------------------------------------------
 * Resumen
 * ---------------------------------------------------------------------- */

console.log(`Portada: ${portada.secciones.length} secciones (${portada.secciones.map((s) => s.tipo).join(', ')})`);

console.log(`\n${paginas.length} páginas:`);
paginas.forEach((p) => console.log(`  · ${p.slug}.html${p.enMenu ? '  (en el menú)' : ''}`));

console.log(`\n${noticias.length} noticias:`);
noticias.forEach((n) => console.log(`  · ${n.fecha}  noticias/${n.slug}.html`));

console.log(`\nEn la portada: las ${Math.min(EN_PORTADA, noticias.length)} noticias más recientes`);
console.log(escritos.length ? `\nActualizados (${escritos.length}):\n  ${escritos.join('\n  ')}` : '\nTodo estaba ya al día');
if (borrados.length) console.log(`\nBorrados (${borrados.length}):\n  ${borrados.join('\n  ')}`);
