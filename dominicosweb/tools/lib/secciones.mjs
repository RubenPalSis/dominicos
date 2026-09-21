/**
 * Un renderizador por tipo de sección.
 *
 * Cada función recibe la sección tal cual viene del JSON y devuelve su HTML.
 * Añadir un tipo nuevo es añadir una función aquí y su bloque en `.pages.yml`:
 * son las dos mitades de lo mismo, el panel pide los campos y esto los pinta.
 *
 * Las secciones se usan igual en la portada y en las páginas sueltas, así que
 * ninguna da por supuesto que está en la portada: lo que cambia según dónde
 * se pinte va en `ctx`.
 */

import { esc, boton, destino, limpiaRuta } from './comun.mjs';

/** Envoltura común: <section class="section ..." id="...">. */
function seccion(s, clases, dentro) {
  const clase = ['section', ...clases, s.clase].filter(Boolean).join(' ');
  const id = s.id ? ` id="${esc(s.id)}"` : '';
  return `  <section class="${clase}"${id}>\n${dentro}\n  </section>`;
}

/** Cabecera de sección: kicker + título, y a la derecha un botón opcional. */
function cabeceraSeccion(s, ctx, sangria = '      ') {
  const derecha = s.boton ? boton(s.boton, ctx.enPortada) : '';
  return (
    `${sangria}<header class="sec-head reveal">\n` +
    `${sangria}  <div>\n` +
    (s.kicker ? `${sangria}    <p class="kicker">${esc(s.kicker)}</p>\n` : '') +
    `${sangria}    <h2 class="h2">${esc(s.titulo)}</h2>\n` +
    `${sangria}  </div>\n` +
    (derecha ? `${sangria}  ${derecha}\n` : '') +
    `${sangria}</header>`
  );
}

/** Párrafos de texto corrido. */
function parrafos(lista, clase, sangria) {
  return (lista || [])
    .filter((p) => String(p || '').trim() !== '')
    .map((p) => `${sangria}<p class="${clase}">${esc(p)}</p>`)
    .join('\n');
}

/** Un título que ocupa dos líneas, la segunda opcionalmente en cursiva. */
function tituloDeDosLineas(s) {
  const primera = esc(s.titulo);
  if (s.tituloEnfasis) return `${primera}<br><em>${esc(s.tituloEnfasis)}</em>`;
  if (s.tituloSegundaLinea) return `${primera}<br>${esc(s.tituloSegundaLinea)}`;
  return primera;
}

/* -------------------------------------------------------------------------
 * Los tipos
 * ---------------------------------------------------------------------- */

function hero(s, ctx) {
  const lineas = (s.lineas || [])
    .slice(0, 3)
    .map((t, i) => `        <span class="l${i + 1}">${esc(t)}</span>`)
    .join('\n');

  const media = s.imagen
    ? `    <div class="hero__media">
      <img src="${ctx.base}${esc(limpiaRuta(s.imagen))}" alt="${esc(s.imagenAlt)}" fetchpriority="high" decoding="async"${
        s.imagenAncho ? ` width="${esc(s.imagenAncho)}"` : ''
      }${s.imagenAlto ? ` height="${esc(s.imagenAlto)}"` : ''}>
    </div>\n`
    : '';

  const botones = [
    boton(s.botonPrincipal, ctx.enPortada, { estilo: 'primario', flecha: true }),
    boton(s.botonSecundario, ctx.enPortada),
  ].filter(Boolean);

  const bajar = s.anclaBajar
    ? `\n    <a class="hero__scroll" href="${esc(destino(s.anclaBajar, ctx.enPortada))}" aria-label="Bajar">
      <span></span>
    </a>`
    : '';

  return `  <section class="hero" id="${esc(s.id || 'top')}">
${media}    <div class="hero__in">
${s.eyebrow ? `      <p class="eyebrow"><span class="dot"></span>${esc(s.eyebrow)}</p>\n` : ''}      <h1 class="hero__h1">
${lineas}
      </h1>
${s.texto ? `      <p class="hero__p">${esc(s.texto)}</p>\n` : ''}${
    botones.length
      ? `      <div class="hero__cta">\n${botones.map((b) => '        ' + b).join('\n')}\n      </div>\n`
      : ''
  }    </div>${bajar}
  </section>`;
}

function ticker(s) {
  const palabras = (s.palabras || [])
    .filter((p) => String(p || '').trim() !== '')
    .map((p) => `<span>${esc(p)}</span><i>✕</i>`)
    .join('');

  /* La tira se escribe dos veces: el CSS la desplaza y la segunda copia entra
     por la derecha justo cuando la primera sale, de modo que el bucle no tiene
     costura. */
  return `  <div class="ticker" aria-hidden="true">
    <div class="ticker__track">
      ${palabras}
      ${palabras}
    </div>
  </div>`;
}

function textoYCifras(s, ctx) {
  const cifras = (s.cifras || [])
    .map((c) => {
      const attrs = [`data-to="${esc(c.numero)}"`];
      if (c.sufijo) attrs.push(`data-suffix="${esc(c.sufijo)}"`);
      if (c.sinSeparador) attrs.push('data-plain="1"');
      return `        <div class="stat"><b class="num" ${attrs.join(' ')}>0</b><span>${esc(c.texto)}</span></div>`;
    })
    .join('\n');

  const puntos = (s.puntos || []).length
    ? `        <ul class="ticks">\n` +
      s.puntos.map((p) => `          <li>${esc(p)}</li>`).join('\n') +
      `\n        </ul>\n`
    : '';

  return seccion(
    s,
    [],
    `    <div class="wrap grid-2">
      <div class="reveal">
${s.kicker ? `        <p class="kicker">${esc(s.kicker)}</p>\n` : ''}        <h2 class="h2">${tituloDeDosLineas(s)}</h2>
${parrafos(s.parrafos, 'lead', '        ')}
${puntos}      </div>
${
  cifras
    ? `
      <div class="stats reveal">
${cifras}
      </div>
`
    : ''
}    </div>`
  );
}

function equipos(s, ctx) {
  const filtros = (s.filtros || [])
    .map(
      (f, i) =>
        `          <button class="chip${i === 0 ? ' is-on' : ''}" type="button" data-filter="${esc(f.valor)}" aria-pressed="${
          i === 0 ? 'true' : 'false'
        }">${esc(f.texto)}</button>`
    )
    .join('\n');

  const tarjetas = (s.equipos || [])
    .map(
      (e) => `        <article class="card reveal" data-cat="${esc(e.grupo)}">
          <img loading="lazy" src="${ctx.base}${esc(limpiaRuta(e.imagen))}" alt="${esc(e.imagenAlt)}">
          <div class="card__body"><span class="tag">${esc(e.etiqueta)}</span><h3>${esc(e.nombre)}</h3><p>${esc(e.texto)}</p></div>
        </article>`
    )
    .join('\n');

  /* Botones de filtro, no pestañas: no hay paneles que mostrar y ocultar,
     solo tarjetas que se filtran. Con role="tab" un lector de pantalla
     anunciaba pestañas inexistentes y buscaba su panel. aria-pressed describe
     lo que de verdad pasa: un botón activo. */
  return seccion(
    s,
    ['equipos'],
    `    <div class="wrap">
      <header class="sec-head reveal">
        <div>
${s.kicker ? `          <p class="kicker">${esc(s.kicker)}</p>\n` : ''}          <h2 class="h2">${esc(s.titulo)}</h2>
        </div>
${
  filtros
    ? `        <div class="filters" role="group" aria-label="Filtrar equipos por categoría">
${filtros}
        </div>
`
    : ''
}      </header>

      <div class="cards" id="cards">
${tarjetas}
      </div>
    </div>`
  );
}

function panelYFoto(s, ctx) {
  const f = s.foto || {};

  const figura = f.imagen
    ? `      <figure class="shot reveal">
        <img loading="lazy" src="${ctx.base}${esc(limpiaRuta(f.imagen))}" alt="${esc(f.imagenAlt)}">
${f.titulo || f.texto ? `        <figcaption>${f.titulo ? `<b>${esc(f.titulo)}</b> ` : ''}${esc(f.texto)}</figcaption>\n` : ''}      </figure>\n`
    : '';

  const aviso = s.aviso && (s.aviso.texto || s.aviso.etiqueta)
    ? `        <p class="note">${s.aviso.etiqueta ? `<span class="pill">${esc(s.aviso.etiqueta)}</span> ` : ''}${esc(s.aviso.texto)}</p>\n`
    : '';

  const b = s.boton ? `        ${boton(s.boton, ctx.enPortada)}\n` : '';

  return seccion(
    s,
    [],
    `    <div class="wrap grid-2">
      <div class="panel reveal">
${s.kicker ? `        <p class="kicker">${esc(s.kicker)}</p>\n` : ''}        <h2 class="h2 h2--sm">${esc(s.titulo)}</h2>
${parrafos(s.parrafos, 'lead', '        ')}
${aviso}${b}      </div>
${figura}    </div>`
  );
}

function noticias(s, ctx) {
  return seccion(
    s,
    ['noticias'],
    `    <div class="wrap">
${cabeceraSeccion(s, ctx)}
      <div class="news">
${ctx.filasNoticias}
      </div>
    </div>`
  );
}

function inscripciones(s, ctx) {
  const docs = (s.documentos || [])
    .map((d) => {
      const archivo = limpiaRuta(d.archivo);
      /* Con el PDF subido, la ficha se descarga. Sin él, se ve pero no enlaza
         a ninguna parte: un href="#" llevaría al principio de la página, que
         es peor que no tener enlace. */
      const dentro = archivo
        ? `<a href="${ctx.base}${esc(archivo)}" download><span>${esc(d.titulo)}</span><em>PDF</em></a>`
        : `<span class="docs__soon"><span>${esc(d.titulo)}</span><em>Próximamente</em></span>`;
      return `          <li>${dentro}</li>`;
    })
    .join('\n');

  const b = s.boton && s.boton.texto
    ? boton(
        {
          texto: s.boton.texto,
          destinoAbsoluto: `mailto:${ctx.sitio.email}${s.boton.asunto ? '?subject=' + encodeURIComponent(s.boton.asunto) : ''}`,
        },
        ctx.enPortada,
        { estilo: 'primario', flecha: true }
      )
    : '';

  return seccion(
    s,
    ['inscrip'],
    `    <div class="wrap">
      <div class="cta reveal">
        <div class="cta__l">
${s.kicker ? `          <p class="kicker kicker--on">${esc(s.kicker)}</p>\n` : ''}          <h2 class="h2 h2--xl">${tituloDeDosLineas(s)}</h2>
${parrafos(s.parrafos, 'lead', '          ')}
${b ? `          ${b}\n` : ''}        </div>
${
  docs
    ? `        <ul class="docs">
${docs}
        </ul>
`
    : ''
}      </div>
    </div>`
  );
}

function contacto(s, ctx) {
  const filas = [];

  if (s.mostrarEmail !== false && ctx.sitio.email) {
    filas.push(`          <li><span>Email</span><a href="mailto:${esc(ctx.sitio.email)}">${esc(ctx.sitio.email)}</a></li>`);
  }

  if (s.whatsapp && s.whatsapp.numero) {
    filas.push(
      `          <li><span>WhatsApp</span><a href="https://wa.me/${esc(s.whatsapp.numero)}">${esc(s.whatsapp.texto || s.whatsapp.numero)}</a></li>`
    );
  }

  (ctx.sitio.redes || []).forEach((r) => {
    filas.push(
      `          <li><span>${esc(r.nombre)}</span><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.usuario || r.nombre)}</a></li>`
    );
  });

  const form = s.formulario ? formulario(s.formulario, ctx) : '';

  return seccion(
    s,
    ['contacto'],
    `    <div class="wrap grid-2">
      <div class="reveal">
${s.kicker ? `        <p class="kicker">${esc(s.kicker)}</p>\n` : ''}        <h2 class="h2">${esc(s.titulo)}</h2>
${parrafos(s.parrafos, 'lead', '        ')}
${
  filas.length
    ? `        <ul class="contact">
${filas.join('\n')}
        </ul>
`
    : ''
}      </div>
${form}    </div>`
  );
}

/**
 * El formulario lo envía Formspree. El id del formulario es público: va en el
 * HTML a la vista y no es un secreto. Mientras no se ponga uno de verdad,
 * script.js avisa en pantalla en vez de mandar el mensaje a ninguna parte.
 */
function formulario(f, ctx) {
  const categorias = (f.categorias || [])
    .map((c) => `<option>${esc(c)}</option>`)
    .join('');

  return `      <form class="form reveal" id="form" method="POST"
            data-email="${esc(ctx.sitio.email)}"
            action="https://formspree.io/f/${esc(ctx.sitio.formspree)}">
        <label>Nombre<input type="text" name="nombre" required maxlength="80" autocomplete="name" placeholder="Tu nombre"></label>
        <label>Email<input type="email" name="email" required maxlength="120" autocomplete="email" placeholder="tu@email.com"></label>
${
  categorias
    ? `        <label>Categoría
          <select name="categoria">
            ${categorias}
          </select>
        </label>
`
    : ''
}        <label>Mensaje<textarea name="mensaje" rows="4" required maxlength="2000" placeholder="Cuéntanos..."></textarea></label>

        <!-- Asunto del correo que llega al club. Lo lee Formspree. -->
        <input type="hidden" name="_subject" value="${esc(f.asunto || 'Contacto desde la web')}">

        <!-- Trampa para bots, la que Formspree descarta sola: invisible y
             fuera del recorrido del teclado para quien navega de verdad. -->
        <p class="hp" aria-hidden="true">
          <label>No rellenes este campo
            <input type="text" name="_gotcha" tabindex="-1" autocomplete="off">
          </label>
        </p>

        <button class="btn btn--primary" type="submit">Enviar</button>
        <p class="form__msg" id="formMsg" role="status" aria-live="polite"></p>
      </form>
`;
}

/**
 * Texto libre. Es el bloque que se usa en las páginas sueltas: el cuerpo se
 * escribe en el panel con editor de texto enriquecido y llega ya como HTML.
 *
 * Es el único sitio donde entra HTML sin escapar, y es deliberado: lo escribe
 * quien tiene permiso para editar la web, igual que quien puede subir un
 * archivo al repositorio. No se debe usar para pegar nada venido de fuera.
 */
function texto(s, ctx) {
  const cabeza = s.titulo ? cabeceraSeccion(s, ctx) + '\n' : '';

  return seccion(
    s,
    [],
    `    <div class="wrap">
${cabeza}      <div class="prose reveal">
${String(s.cuerpo || '').trim()}
      </div>
    </div>`
  );
}

export const TIPOS = {
  hero,
  ticker,
  'texto-y-cifras': textoYCifras,
  equipos,
  'panel-y-foto': panelYFoto,
  noticias,
  inscripciones,
  contacto,
  texto,
};

/** Pinta una lista de secciones. */
export function pintarSecciones(secciones, ctx) {
  return (secciones || [])
    .map((s, i) => {
      const pintar = TIPOS[s.tipo];
      if (!pintar) return '';
      /* En una página suelta, la primera sección va pegada a la cabecera y
         necesita el espaciado de arriba que ya usa el listado de noticias. */
      const seccion = i === 0 && ctx.primeraArriba
        ? { ...s, clase: ['section--top', s.clase].filter(Boolean).join(' ') }
        : s;
      return `  <!-- ${String(seccion.tipo).toUpperCase()} -->\n` + pintar(seccion, ctx);
    })
    .filter(Boolean)
    .join('\n\n');
}
