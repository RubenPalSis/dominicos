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

import { esc, boton, limpiaRuta, enlaceSeguro, partible } from './comun.mjs';

/** Envoltura común: <section class="section ..." id="...">. */
function seccion(s, clases, dentro) {
  const clase = ['section', ...clases, s.clase].filter(Boolean).join(' ');
  const id = s.id ? ` id="${esc(s.id)}"` : '';
  return `  <section class="${clase}"${id}>\n${dentro}\n  </section>`;
}

/** Cabecera de sección: kicker + título, y a la derecha un botón opcional. */
function cabeceraSeccion(s, ctx, sangria = '      ') {
  const derecha = s.boton ? boton(s.boton, ctx.enPortada, { prefijo: ctx.prefijo }) : '';
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

/**
 * El título de una sección, con dos maneras de resaltar el final.
 *
 * `tituloEnfasis` va en la misma frase, en rojo, y se parte donde quepa: es
 * una palabra destacada, no un renglón aparte.
 * `tituloSegundaLinea` sí fuerza el salto, que es justo para lo que está.
 */
function tituloDeDosLineas(s) {
  const primera = esc(s.titulo);
  if (s.tituloEnfasis) return `${primera} <em>${esc(s.tituloEnfasis)}</em>`;
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
    boton(s.botonPrincipal, ctx.enPortada, { estilo: 'primario', flecha: true, prefijo: ctx.prefijo }),
    boton(s.botonSecundario, ctx.enPortada, { prefijo: ctx.prefijo }),
  ].filter(Boolean);

  return `  <section class="hero" id="${esc(s.id || 'top')}">
${media}    <div class="hero__in">
${s.eyebrow ? `      <p class="eyebrow"><span class="dot"></span>${esc(s.eyebrow)}</p>\n` : ''}      <h1 class="hero__h1">
${lineas}
      </h1>
${s.texto ? `      <p class="hero__p">${esc(s.texto)}</p>\n` : ''}${
    botones.length
      ? `      <div class="hero__cta">\n${botones.map((b) => '        ' + b).join('\n')}\n      </div>\n`
      : ''
  }    </div>
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

/**
 * Los logos de los patrocinadores.
 *
 * La lista no viene de la sección: son los archivos `images/patrocinador_N`
 * que haya en el repositorio, y llegan ya ordenados en `ctx.patrocinadores`.
 * La sección solo pone el texto que los acompaña, y puede ponerle nombre y
 * web a un logo suelto por su número (`logos`), que es lo único que el
 * nombre del archivo no sabe.
 *
 * Si no hay ningún logo, la sección no se pinta: más vale que no esté a que
 * salga una franja vacía con un título encima.
 */
function patrocinadores(s, ctx) {
  const extra = {};
  (s.logos || []).forEach((l) => {
    if (l && l.numero) extra[Number(l.numero)] = l;
  });

  const logos = (ctx.patrocinadores || []).map((logo) => {
    const d = extra[logo.numero] || {};
    const nombre = String(d.nombre || '').trim();
    const web = enlaceSeguro(d.web);

    /* Sin nombre no hay nada honesto que leer en voz alta, así que el logo
       se marca como decorativo y no se le cuenta a nadie un «patrocinador 3»
       que no significa nada. Con enlace sí hace falta: el enlace tiene que
       decir a dónde va. */
    const img =
      `<img src="${ctx.base}${esc(logo.imagen)}" alt="${esc(nombre)}" loading="lazy" decoding="async">`;

    const dentro = web
      ? `<a href="${esc(web)}" target="_blank" rel="noopener noreferrer"${
          nombre ? '' : ` aria-label="Web del patrocinador"`
        }>${img}</a>`
      : img;

    return `          <li class="patro">${dentro}</li>`;
  });

  if (!logos.length) return '';

  return seccion(
    s,
    ['patros'],
    `    <div class="wrap">
${s.kicker || s.titulo ? `      <div class="patros__cab reveal">
${s.kicker ? `        <p class="kicker">${esc(s.kicker)}</p>\n` : ''}${s.titulo ? `        <h2 class="h2 h2--sm">${esc(s.titulo)}</h2>\n` : ''}      </div>\n` : ''}      <ul class="patros__lista reveal">
${logos.join('\n')}
      </ul>
    </div>`
  );
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

  /* La principal manda: es la que se ve al entrar y la única que el navegador
     tiene que descargar para pintar la sección. Las de detrás se van turnando
     con ella cada pocos segundos, todas en la misma caja y al mismo tamaño,
     para que al cambiar no se mueva nada de sitio. */
  const fotos = [
    { imagen: f.imagen, imagenAlt: f.imagenAlt },
    ...(Array.isArray(f.masImagenes) ? f.masImagenes : []).filter((m) => m && m.imagen),
  ].filter((m) => m.imagen);

  const varias = fotos.length > 1;

  const capas = fotos
    .map(
      (m, i) =>
        `          <img class="shot__img${i === 0 ? ' is-on' : ''}" loading="lazy" decoding="async"` +
        ` src="${ctx.base}${esc(limpiaRuta(m.imagen))}" alt="${esc(m.imagenAlt)}"${i === 0 ? '' : ' aria-hidden="true"'}>`
    )
    .join('\n');

  /* Una barrita por foto, debajo, para saltar a mano sin esperar al turno.
     Van escritas en el HTML y no las pinta el script, pero el CSS solo las
     enseña si hay JavaScript: sin él no harían nada. */
  const barras = varias
    ? `        <div class="shot__barras" role="group" aria-label="Fotos de ${esc(f.titulo || s.titulo)}">
${fotos
  .map(
    (m, i) =>
      `          <button type="button" class="shot__barra${i === 0 ? ' is-on' : ''}"` +
      `${i === 0 ? ' aria-current="true"' : ''} aria-label="Ver la foto ${i + 1} de ${fotos.length}"></button>`
  )
  .join('\n')}
        </div>
`
    : '';

  const figura = fotos.length
    ? `      <figure class="shot reveal${varias ? ' shot--turno' : ''}"${varias ? ' data-turno="5000"' : ''}>
        <div class="shot__fotos">
${capas}
        </div>
${barras}${f.titulo || f.texto ? `        <figcaption>${f.titulo ? `<b>${esc(f.titulo)}</b> ` : ''}${esc(f.texto)}</figcaption>\n` : ''}      </figure>\n`
    : '';

  const aviso = s.aviso && (s.aviso.texto || s.aviso.etiqueta)
    ? `        <p class="note">${s.aviso.etiqueta ? `<span class="pill">${esc(s.aviso.etiqueta)}</span> ` : ''}${esc(s.aviso.texto)}</p>\n`
    : '';

  const b = s.boton ? `        ${boton(s.boton, ctx.enPortada, { prefijo: ctx.prefijo })}\n` : '';

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
      <div class="nboxes">
${ctx.cajasNoticias}
      </div>
    </div>`
  );
}

/**
 * Los datos de contacto del club: el correo, el WhatsApp y las redes del
 * sitio. Los piden dos secciones, así que se arman en un solo sitio.
 */
function datosDeContacto(s, ctx) {
  const filas = [];

  if (s.mostrarEmail !== false && ctx.sitio.email) {
    filas.push({ nombre: 'Email', url: `mailto:${ctx.sitio.email}`, texto: ctx.sitio.email });
  }

  if (s.whatsapp && s.whatsapp.numero) {
    filas.push({
      nombre: 'WhatsApp',
      url: `https://wa.me/${s.whatsapp.numero}`,
      texto: s.whatsapp.texto || s.whatsapp.numero,
    });
  }

  if (s.mostrarRedes !== false) {
    (ctx.sitio.redes || []).forEach((r) => {
      filas.push({ nombre: r.nombre, url: r.url, texto: r.usuario || r.nombre, fuera: true });
    });
  }

  return filas;
}

/** La lista de esos datos. La clase decide si cae en columna o en fila. */
function listaContacto(filas, clase, sangria, { enlaceEntero = false } = {}) {
  const items = filas
    .map((f) => {
      const fuera = f.fuera ? ' target="_blank" rel="noopener"' : '';

      /* En tarjeta, el rótulo va dentro del enlace: así se puede pulsar la
         caja entera y no solo el renglón de abajo, que en un móvil es una
         diana de tres milímetros. */
      return enlaceEntero
        ? `${sangria}  <li><a href="${esc(f.url)}"${fuera}><span>${esc(f.nombre)}</span><b>${partible(f.texto)}</b></a></li>`
        : `${sangria}  <li><span>${esc(f.nombre)}</span><a href="${esc(f.url)}"${fuera}>${esc(f.texto)}</a></li>`;
    })
    .join('\n');

  return `${sangria}<ul class="${clase}">\n${items}\n${sangria}</ul>\n`;
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
      return `            <li>${dentro}</li>`;
    })
    .join('\n');

  /* Los pasos van numerados por CSS, de ahí que sea <ol>: el orden es el
     contenido, no un adorno. */
  const pasos = (s.pasos || [])
    .filter((p) => p && (p.titulo || p.texto))
    .map(
      (p) => `            <li>
${p.titulo ? `              <b>${esc(p.titulo)}</b>\n` : ''}${p.texto ? `              <p>${esc(p.texto)}</p>\n` : ''}            </li>`
    )
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

  const form = s.formulario ? formulario(s.formulario, ctx) : '';

  /* El titular va dentro de la columna de la izquierda, no cruzando el panel
     entero: con el formulario al lado, un titular a todo lo ancho dejaba el
     texto arriba y media columna de rojo vacío debajo de los pasos. Juntos,
     las dos columnas acaban casi a la misma altura. */
  const cabecera =
    `          <header class="cta__head">\n` +
    (s.kicker ? `            <p class="kicker kicker--on">${esc(s.kicker)}</p>\n` : '') +
    `            <h2 class="h2 h2--xl">${tituloDeDosLineas(s)}</h2>\n` +
    (parrafos(s.parrafos, 'lead', '            ') ? parrafos(s.parrafos, 'lead', '            ') + '\n' : '') +
    `          </header>\n`;

  const izquierda =
    cabecera +
    (pasos ? `          <ol class="pasos">\n${pasos}\n          </ol>\n` : '') +
    (docs ? `          <ul class="docs">\n${docs}\n          </ul>\n` : '') +
    (b ? `          ${b}\n` : '');

  /* Sin formulario no hay dos columnas: el texto ocupa el ancho entero en vez
     de dejar media rejilla en blanco. */
  const columnas = `        <div class="cta__cols${form ? '' : ' cta__cols--una'}">
          <div class="cta__l">
${izquierda}          </div>
${form}        </div>\n`;

  /* Y debajo de todo, cruzando el ancho, cómo localizar al club: una tarjeta
     por vía, todas del mismo tamaño. En fila suelta, el correo largo y los
     usuarios cortos dejaban unos huecos irregulares que parecían un error. */
  const filas = datosDeContacto(s, ctx);
  const datos = filas.length
    ? listaContacto(filas, 'cta__datos', '        ', { enlaceEntero: true })
    : '';

  return seccion(
    s,
    ['inscrip'],
    `    <div class="wrap">
      <div class="cta reveal">
${columnas}${datos}      </div>
    </div>`
  );
}

function contacto(s, ctx) {
  const filas = datosDeContacto(s, ctx);
  const lista = filas.length ? listaContacto(filas, 'contact', '        ') : '';
  const form = s.formulario ? formulario(s.formulario, ctx) : '';

  /* Sin formulario no hay segunda columna: la rejilla dejaría medio ancho
     en blanco al lado del texto. */
  return seccion(
    s,
    ['contacto'],
    `    <div class="wrap${form ? ' grid-2' : ''}">
      <div class="reveal">
${s.kicker ? `        <p class="kicker">${esc(s.kicker)}</p>\n` : ''}        <h2 class="h2">${esc(s.titulo)}</h2>
${parrafos(s.parrafos, 'lead', '        ')}
${lista}      </div>
${form}    </div>`
  );
}

/**
 * El formulario lo envía Web3Forms. La clave de acceso es pública a
 * propósito: va en el HTML a la vista, como pide el servicio, y lo único que
 * permite es mandar un correo a la dirección con la que se dio de alta. No es
 * una contraseña. Mientras no se ponga una de verdad, script.js avisa en
 * pantalla en vez de mandar el mensaje a ninguna parte.
 */
function formulario(f, ctx) {
  const categorias = (f.categorias || [])
    .map((c) => `<option>${esc(c)}</option>`)
    .join('');

  return `      <form class="form reveal" id="form" method="POST"
            data-email="${esc(ctx.sitio.email)}"
            action="https://api.web3forms.com/submit">
        <input type="hidden" name="access_key" value="${esc(ctx.sitio.web3forms)}">
        <label>Nombre<input type="text" name="nombre" required maxlength="80" autocomplete="name" placeholder="Tu nombre"></label>
        <label>Email<input type="email" name="email" required maxlength="120" autocomplete="email" placeholder="tu@email.com"></label>
        <label>Teléfono<input type="tel" name="telefono" required maxlength="24" autocomplete="tel" inputmode="tel" placeholder="600 00 00 00"></label>
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

        <!-- Lo que se ve en la bandeja de entrada del club: de quién viene
             el correo y de qué va. Los dos nombres los lee Web3Forms. -->
        <input type="hidden" name="subject" value="${esc(f.asunto || 'Contacto desde la web')}">
        <input type="hidden" name="from_name" value="${esc(ctx.sitio.nombre)}">

        <!-- Trampa para bots, la que Web3Forms descarta sola: una casilla que
             solo marca quien rellena el formulario a ciegas. Está escondida y
             fuera del recorrido del teclado para quien navega de verdad. -->
        <p class="hp" aria-hidden="true">
          <label>No marques esta casilla
            <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off">
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
  patrocinadores,
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
