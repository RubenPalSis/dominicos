/**
 * Pone el nombre a los archivos que llegan del panel.
 *
 * El nombre del archivo es la dirección de la página publicada, así que tiene
 * que ser en minúsculas, con guiones y sin acentos. Pedírselo a quien escribe
 * la noticia era pedirle que supiera eso; y el panel tampoco puede ponerlo,
 * porque bautiza el archivo al crearlo, cuando todavía no hay ni fecha ni
 * título —de ahí salían los «-.json» que reventaban la publicación—.
 *
 * Así que lo pone esto, aquí, cuando el archivo ya tiene contenido: lee la
 * fecha y el título de dentro y renombra el archivo a partir de ellos.
 *
 * Solo toca los archivos MAL nombrados. Un nombre ya válido no se toca nunca,
 * aunque luego se cambie el título: cambiarlo movería la noticia de dirección
 * y rompería el enlace a quien lo hubiera compartido.
 */

import { readdirSync, readFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/* Nombres que ya usa el sitio: una página suelta no puede llamarse así, o
   sobreescribiría la portada, el listado o la página de error. */
export const RESERVADOS = new Set(['index', 'noticias', '404', 'sitemap', 'robots', 'manifest', 'styles', 'script']);

const NOTICIA_OK = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*$/;
const PAGINA_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FECHA_OK = /^\d{4}-\d{2}-\d{2}$/;

/* Un nombre largo en la barra de direcciones no lo lee nadie y se comparte
   peor, así que del título solo se aprovecha el principio. */
const LARGO = 48;

/**
 * De un texto cualquiera a un nombre de archivo: sin mayúsculas, sin acentos,
 * sin eñes y sin nada que no sea una letra, un número o un guion.
 */
export function aSlug(texto) {
  const slug = String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length <= LARGO) return slug;

  /* Se corta por el último guion que quepa, para no partir una palabra por
     la mitad; si la primera palabra ya es larguísima, se corta a lo bruto. */
  const trozo = slug.slice(0, LARGO + 1);
  const guion = trozo.lastIndexOf('-');
  return (guion > 8 ? trozo.slice(0, guion) : slug.slice(0, LARGO)).replace(/-+$/, '');
}

/**
 * Repasa noticias/ y paginas/ y renombra lo que haga falta.
 * Devuelve la lista de cambios, para poder contarlos por pantalla.
 */
export function ordenaNombres(raiz) {
  return [
    ...repasa(raiz, 'noticias', (slug) => NOTICIA_OK.test(slug), nombreDeNoticia),
    ...repasa(raiz, 'paginas', (slug) => PAGINA_OK.test(slug) && !RESERVADOS.has(slug), nombreDePagina),
  ];
}

function repasa(raiz, carpeta, estaBien, comoSeLlama) {
  const dir = join(raiz, carpeta);
  if (!existsSync(dir)) return [];

  const cambios = [];

  for (const archivo of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    if (estaBien(archivo.replace(/\.json$/, ''))) continue;

    const datos = leer(join(dir, archivo));
    if (!datos) continue;

    const nombre = comoSeLlama(datos);

    /* Sin fecha o sin título no hay de dónde sacar el nombre. Se deja como
       está: al validar saldrá el aviso de que falta ese campo, que es lo que
       de verdad hay que arreglar. */
    if (!nombre) continue;

    const destino = libre(dir, nombre, datos, estaBien);
    if (!destino || destino === archivo) continue;

    renameSync(join(dir, archivo), join(dir, destino));
    cambios.push({ de: `${carpeta}/${archivo}`, a: `${carpeta}/${destino}` });
  }

  return cambios;
}

function nombreDeNoticia(datos) {
  const slug = aSlug(datos.titulo);
  if (!slug || !FECHA_OK.test(String(datos.fecha || ''))) return '';
  return `${datos.fecha}-${slug}.json`;
}

function nombreDePagina(datos) {
  const slug = aSlug(datos.titulo);
  if (!slug) return '';
  return `${slug}.json`;
}

/**
 * Busca un nombre que no esté cogido.
 *
 * Si el que toca ya existe pero es la MISMA noticia —mismo título y misma
 * fecha—, es que el panel la ha vuelto a guardar con el nombre provisional
 * sin enterarse de que ya se le había puesto el bueno: se pisa el archivo
 * viejo con el nuevo, que es el recién editado. Si es otra distinta, se le
 * añade un número.
 */
function libre(dir, nombre, datos, estaBien) {
  if (!existsSync(join(dir, nombre))) return nombre;
  if (esLoMismo(leer(join(dir, nombre)), datos)) return nombre;

  const base = nombre.replace(/\.json$/, '');

  for (let n = 2; n <= 50; n++) {
    const intento = `${base}-${n}.json`;
    if (!estaBien(`${base}-${n}`)) return '';
    if (!existsSync(join(dir, intento))) return intento;
  }

  return '';
}

function esLoMismo(a, b) {
  return !!a && a.titulo === b.titulo && (a.fecha || '') === (b.fecha || '');
}

function leer(ruta) {
  try {
    const datos = JSON.parse(readFileSync(ruta, 'utf8'));
    return datos && typeof datos === 'object' ? datos : null;
  } catch {
    /* Un JSON roto no se renombra: ya se queja el validador, y con un
       mensaje que dice dónde está el error. */
    return null;
  }
}
