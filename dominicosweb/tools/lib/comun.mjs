/**
 * Piezas compartidas por todas las páginas: escapado, rutas, enlaces y el
 * armazón HTML (cabecera, pie y el documento entero).
 *
 * Regla que no se rompe en ningún sitio: todo lo que viene de un archivo de
 * datos se escapa antes de entrar en el HTML. Los datos son texto, nunca
 * marcado. La única excepción está marcada como tal (`html()`), y solo la usa
 * el cuerpo de las páginas, que se escribe desde el panel con editor de texto
 * enriquecido.
 */

/** Escapa texto para meterlo entre etiquetas o dentro de un atributo. */
export function esc(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapa un objeto para incrustarlo en un <script type="application/ld+json">. */
export function escJson(objeto) {
  return JSON.stringify(objeto, null, 2).replace(/</g, '\\u003c');
}

/** Rutas internas relativas al raíz del sitio, sin barra inicial. */
export function limpiaRuta(ruta) {
  return String(ruta || '').replace(/^\/+/, '');
}

/** Solo dejamos pasar enlaces con un esquema seguro. */
export function enlaceSeguro(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** «2022-04-22» → «22 abr 2022». */
export function fechaLegible(iso) {
  const [a, m, d] = iso.split('-');
  return `${Number(d)} ${MESES[Number(m) - 1]} ${a}`;
}

/**
 * Resuelve el destino de un enlace del menú según dónde se pinte.
 *
 * Un destino que empieza por «#» es una sección de la portada. Desde la
 * portada se deja tal cual, y esto importa: script.js solo resalta el enlace
 * de la sección visible si su href empieza por «#». Desde cualquier otra
 * página se convierte en «/#seccion», que sí sale de la página actual.
 */
export function destino(valor, enPortada, prefijo = '') {
  const v = String(valor || '').trim();
  if (!v) return prefijo + '/';
  if (v.startsWith('#')) return enPortada ? v : prefijo + '/' + v;
  if (v.startsWith('/')) return prefijo + v;
  return v;
}

/**
 * Un enlace a una página del sitio, escrito desde la raíz.
 *
 * El prefijo es lo que hace posible la vista previa: en la web normal está
 * vacío y los enlaces salen como «/noticias.html»; en la copia de vista
 * previa vale «/vista-previa», y los mismos enlaces salen como
 * «/vista-previa/noticias.html», de modo que navegar por ella no te saca de
 * la copia y te devuelve al cartel de mantenimiento.
 */
export function enlaceInterno(ruta, prefijo = '') {
  return prefijo + ruta;
}

/** La flecha de los botones principales. */
const FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>';

/**
 * Un botón. `estilo` es 'primario' o 'fantasma'; con `flecha` lleva el icono
 * de la derecha, como en la portada.
 */
export function boton(b, enPortada, { estilo = 'fantasma', flecha = false, prefijo = '' } = {}) {
  if (!b || !b.texto) return '';
  const clase = estilo === 'primario' ? 'btn btn--primary' : 'btn btn--ghost';
  const href = b.destinoAbsoluto || destino(b.destino, enPortada, prefijo);
  return `<a class="${clase}" href="${esc(href)}">${esc(b.texto)}${flecha ? ' ' + FLECHA : ''}</a>`;
}

/* -------------------------------------------------------------------------
 * Cabecera y pie
 * ---------------------------------------------------------------------- */

/*
 * `base` es el prefijo para llegar al raíz del sitio: '' desde la portada,
 * '../' desde una página dentro de /noticias/. Se usa solo para los recursos
 * (CSS, imágenes, script).
 *
 * Los enlaces a PÁGINAS van en absoluto desde la raíz ('/', '/noticias.html').
 * Es a propósito: la canonical de la portada es https://baloncestodominicos.es/
 * y enlazar internamente a "index.html" apuntaría a una segunda dirección
 * válida de la misma página, que Google tendría que rastrear y descartar.
 */

export function cabecera(sitio, menu, { base = '', enPortada = false, prefijo = '' } = {}) {
  const enlaces = menu.enlaces
    .map((e) => {
      const href = enPortada && e.anclaPortada ? e.anclaPortada : destino(e.destino, enPortada, prefijo);
      return `      <a href="${esc(href)}">${esc(e.texto)}</a>`;
    })
    .join('\n');

  const cta = menu.cta && menu.cta.texto
    ? `\n      <a class="menu__cta" href="${esc(destino(menu.cta.destino, enPortada, prefijo))}">${esc(menu.cta.texto)}</a>`
    : '';

  return `<div class="progress" id="progress" aria-hidden="true"></div>

<a class="skip" href="#main">Saltar al contenido</a>

<header class="nav" id="nav">
  <div class="nav__in">
    <a class="brand" href="${enPortada ? '#top' : prefijo + '/'}">
      <img src="${base}${esc(sitio.logo)}" alt="Escudo ${esc(sitio.nombre)}" width="44" height="44">
      <span class="brand__txt"><b>${esc(sitio.nombreCorto)}</b><small>${esc(sitio.rotulo)}</small></span>
    </a>

    <nav class="menu" id="menu" aria-label="Principal">
${enlaces}${cta}
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

export function pie(sitio, menu, { base = '', enPortada = false, prefijo = '' } = {}) {
  const enlaces = menu.pie
    .map((e) => `<a href="${esc(destino(e.destino, enPortada, prefijo))}">${esc(e.texto)}</a>`)
    .join('');

  return `<footer class="foot">
  <div class="wrap foot__in">
    <div class="foot__brand">
      <img src="${base}${esc(sitio.logo)}" alt="" width="52" height="52">
      <p><b>${esc(sitio.nombreLargo)}</b><br>${esc(sitio.ciudad)}</p>
    </div>
    <nav class="foot__nav" aria-label="Pie">
      ${enlaces}
    </nav>
    <p class="foot__legal">© <span id="year">${new Date().getFullYear()}</span> ${esc(sitio.nombre)}${sitio.legal ? ' · ' + esc(sitio.legal) : ''}</p>
  </div>
</footer>

<!-- LIGHTBOX -->
<div class="lb" id="lb" hidden>
  <button class="lb__x" id="lbX" type="button" aria-label="Cerrar">✕</button>
  <img id="lbImg" src="" alt="">
</div>`;
}

/* -------------------------------------------------------------------------
 * El documento entero
 * ---------------------------------------------------------------------- */

/**
 * Arma una página completa. Todas las páginas del sitio salen de aquí, que es
 * lo que garantiza que compartan cabecera, pie, iconos, fuentes y etiquetas
 * para compartir sin que haya que acordarse de copiarlas.
 */
export function documento({
  sitio,
  menu,
  base = '',
  enPortada = false,
  prefijo = '',
  titulo,
  tituloCompartir = '',
  descripcion,
  descripcionCompartir = '',
  canonical = '',
  robots = '',
  tipoOg = 'website',
  imagenCompartir = '',
  imagenCompartirAlt = '',
  metasExtra = [],
  jsonLd = null,
  claseBody = '',
  sinNavegacion = false,
  main,
}) {
  const imagen = imagenCompartir || sitio.imagenCompartir;
  const imagenAlt = imagenCompartirAlt || sitio.imagenCompartirAlt;
  const imagenAbs = imagen ? `${sitio.dominio}/${limpiaRuta(imagen)}` : '';

  const cabeza = [];

  cabeza.push('<meta charset="utf-8">');
  cabeza.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
  cabeza.push(`<title>${esc(titulo)}</title>`);
  cabeza.push(`<meta name="description" content="${esc(descripcion)}">`);
  if (robots) cabeza.push(`<meta name="robots" content="${esc(robots)}">`);
  cabeza.push('<meta name="referrer" content="strict-origin-when-cross-origin">');
  if (canonical) cabeza.push(`<link rel="canonical" href="${esc(canonical)}">`);
  if (sitio.googleSiteVerification) {
    cabeza.push(`<meta name="google-site-verification" content="${esc(sitio.googleSiteVerification)}">`);
  }

  /* Una página que no se indexa tampoco se comparte: las etiquetas de Open
     Graph solo sirven para que se vea bonita al pegar el enlace, y no tiene
     sentido en la página de error. */
  if (!/noindex/.test(robots)) {
  cabeza.push('');
  cabeza.push(`<meta property="og:type" content="${esc(tipoOg)}">`);
  cabeza.push('<meta property="og:locale" content="es_ES">');
  cabeza.push(`<meta property="og:site_name" content="${esc(sitio.nombre)}">`);
  cabeza.push(`<meta property="og:title" content="${esc(tituloCompartir || titulo)}">`);
  cabeza.push(`<meta property="og:description" content="${esc(descripcionCompartir || descripcion)}">`);
  if (canonical) cabeza.push(`<meta property="og:url" content="${esc(canonical)}">`);
  if (imagenAbs) cabeza.push(`<meta property="og:image" content="${esc(imagenAbs)}">`);
  if (imagenAbs && imagenAlt) cabeza.push(`<meta property="og:image:alt" content="${esc(imagenAlt)}">`);
  metasExtra.forEach((m) => cabeza.push(m));
  cabeza.push('<meta name="twitter:card" content="summary_large_image">');
  cabeza.push(`<meta name="twitter:title" content="${esc(tituloCompartir || titulo)}">`);
  cabeza.push(`<meta name="twitter:description" content="${esc(descripcionCompartir || descripcion)}">`);
  if (imagenAbs) cabeza.push(`<meta name="twitter:image" content="${esc(imagenAbs)}">`);
  }

  cabeza.push('');
  cabeza.push(`<link rel="icon" href="${base}${esc(sitio.favicon)}">`);
  cabeza.push(`<link rel="apple-touch-icon" href="${base}${esc(sitio.logo)}">`);
  cabeza.push(`<link rel="manifest" href="${base}manifest.webmanifest">`);
  cabeza.push('<link rel="preconnect" href="https://fonts.googleapis.com">');
  cabeza.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
  cabeza.push('<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=Archivo+Black&display=swap" rel="stylesheet">');
  cabeza.push(`<link rel="stylesheet" href="${base}styles.css">`);

  cabeza.push('');
  cabeza.push('<!-- Marca que hay JavaScript ANTES de pintar. El CSS solo esconde los');
  cabeza.push('     bloques animados si esta clase está: sin JS se ven directamente, en vez');
  cabeza.push('     de quedarse invisibles para siempre. -->');
  cabeza.push("<script>document.documentElement.classList.add('js')</script>");

  if (jsonLd) {
    cabeza.push('');
    cabeza.push('<script type="application/ld+json">');
    cabeza.push(escJson(jsonLd));
    cabeza.push('</script>');
  }

  return `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
${cabeza.join('\n')}
</head>
<body${claseBody ? ` class="${esc(claseBody)}"` : ''}>
${sinNavegacion ? '' : '\n' + cabecera(sitio, menu, { base, enPortada, prefijo }) + '\n'}
${main}
${sinNavegacion ? '' : '\n' + pie(sitio, menu, { base, enPortada, prefijo }) + '\n'}
<script src="${base}script.js"></script>
</body>
</html>
`;
}
