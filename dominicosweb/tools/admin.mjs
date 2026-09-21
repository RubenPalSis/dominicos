#!/usr/bin/env node
/**
 * Panel de noticias — servidor LOCAL.
 *
 * Levanta un panel en tu ordenador para crear, editar y borrar noticias sin
 * escribir JSON a mano. Escribe directamente en noticias/*.json y en
 * images/noticias/, y después lanza el generador, así que al terminar solo
 * queda hacer commit y push.
 *
 *   node tools/admin.mjs        →  http://127.0.0.1:4321
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ ESTO NO SE PUBLICA, Y NO PUEDE PUBLICARSE
 *
 * GitHub Pages solo sirve archivos: no ejecuta código. Un panel «online» con
 * el usuario y la contraseña metidos en el JavaScript no protegería nada,
 * porque cualquiera los leería con Ver código fuente. Y para poder escribir en
 * el repositorio desde el navegador haría falta además un token de GitHub, que
 * quedaría expuesto igual y daría permiso de escritura a quien lo encontrara.
 *
 * Aquí la contraseña sí sirve, porque hay un servidor de verdad que la
 * comprueba: el que estás ejecutando tú, en tu máquina.
 *
 * Este archivo vive en tools/, que el workflow NO copia a _site. Nunca sale a
 * internet.
 * ---------------------------------------------------------------------------
 */

import { createServer } from 'node:http';
import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS = join(RAIZ, 'tools');
const DIR_NOTICIAS = join(RAIZ, 'noticias');
const DIR_IMAGENES = join(RAIZ, 'images', 'noticias');

/* Credenciales del panel. Se pueden cambiar sin tocar el código con:
     ADMIN_USER=otro ADMIN_PASS=otra node tools/admin.mjs
   Están aquí en claro a propósito: esto no se publica, y quien pueda leer este
   archivo ya tiene el repositorio entero en su disco. */
const USUARIO = process.env.ADMIN_USER || 'Ent-Ruben';
const CLAVE = process.env.ADMIN_PASS || 'Ruben@2026';

/* Solo el bucle local. Nunca 0.0.0.0: eso abriría el panel a toda la red. */
const HOST = '127.0.0.1';
const PUERTO = Number(process.env.ADMIN_PORT || 4321);

const MAX_IMAGEN = 5 * 1024 * 1024;
const TIPOS_IMAGEN = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

/* Fichas abiertas. Se pierden al parar el servidor, que es lo que se quiere. */
const sesiones = new Set();

/* -------------------------------------------------------------------------
 * Utilidades
 * ---------------------------------------------------------------------- */

/** Comparación en tiempo constante, para no filtrar la contraseña por el reloj. */
function igual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

function json(res, codigo, datos) {
  const cuerpo = JSON.stringify(datos);
  res.writeHead(codigo, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(cuerpo);
}

function leerCuerpo(req, limite = MAX_IMAGEN + 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let datos = '';
    let tam = 0;
    req.on('data', (c) => {
      tam += c.length;
      if (tam > limite) {
        reject(new Error('demasiado grande'));
        req.destroy();
        return;
      }
      datos += c;
    });
    req.on('end', () => {
      try {
        resolve(datos ? JSON.parse(datos) : {});
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

/** «Torneo de Cuarte» → «torneo-de-cuarte». */
function aSlug(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Un id solo puede ser AAAA-MM-DD-slug. Al construir la ruta con él, esto es
 * lo que impide que un "../../algo" escriba fuera de noticias/.
 */
function idValido(id) {
  return typeof id === 'string' && /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(id);
}

function rutaNoticia(id) {
  if (!idValido(id)) throw new Error('id inválido');
  const ruta = join(DIR_NOTICIAS, `${id}.json`);
  if (dirname(ruta) !== DIR_NOTICIAS) throw new Error('ruta fuera de sitio');
  return ruta;
}

/* -------------------------------------------------------------------------
 * Datos
 * ---------------------------------------------------------------------- */

function listar() {
  return readdirSync(DIR_NOTICIAS)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(DIR_NOTICIAS, f), 'utf8'));
      } catch {
        return { id: f.replace(/\.json$/, ''), titulo: `(JSON con errores: ${f})`, roto: true };
      }
    })
    .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
}

/** Deja la noticia con solo los campos del esquema, y sin los vacíos. */
function normalizar(entrada) {
  const fecha = String(entrada.fecha || '').trim();
  const titulo = String(entrada.titulo || '').trim();
  const descripcion = String(entrada.descripcion || '').trim();

  const errores = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) errores.push('La fecha debe ser AAAA-MM-DD.');
  if (!titulo) errores.push('Falta el título.');
  if (!descripcion) errores.push('Falta la descripción.');

  const mod = String(entrada.fechaModificacion || '').trim();
  if (mod && !/^\d{4}-\d{2}-\d{2}$/.test(mod)) errores.push('La fecha de modificación debe ser AAAA-MM-DD.');
  if (mod && fecha && mod < fecha) errores.push('La fecha de modificación es anterior a la de publicación.');

  const enlace = String(entrada.enlace || '').trim();
  if (enlace && !/^https?:\/\//i.test(enlace)) errores.push('El enlace debe empezar por http:// o https://.');

  const imagen = String(entrada.imagen || '').trim().replace(/^\/+/, '');
  if (imagen && !existsSync(join(RAIZ, imagen))) errores.push(`La imagen «${imagen}» no existe.`);

  if (errores.length) return { errores };

  /* El id se construye con la fecha y el título, salvo que ya exista: una vez
     publicada, cambiarlo rompería su dirección. */
  const id = idValido(entrada.id) ? entrada.id : `${fecha}-${aSlug(titulo)}`;
  if (!idValido(id)) return { errores: ['No he podido formar un id válido con ese título.'] };

  /* El contenido llega como texto: cada párrafo en una línea. */
  const contenido = String(entrada.contenido || '')
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const noticia = { id, fecha };
  const opcional = (k, v) => { if (v) noticia[k] = v; };

  opcional('fechaModificacion', mod);
  opcional('fechaTexto', String(entrada.fechaTexto || '').trim());
  noticia.titulo = titulo;
  noticia.descripcion = descripcion;
  if (contenido.length) noticia.contenido = contenido;
  opcional('imagen', imagen);
  opcional('imagenAlt', String(entrada.imagenAlt || '').trim());
  opcional('categoria', String(entrada.categoria || '').trim());
  opcional('enlace', enlace);
  if (enlace) opcional('textoEnlace', String(entrada.textoEnlace || '').trim());
  opcional('mencion', String(entrada.mencion || '').trim());
  opcional('autor', String(entrada.autor || '').trim());

  return { noticia };
}

/** Lanza el generador. Si un JSON está mal, devuelve su mensaje tal cual. */
function regenerar() {
  return new Promise((resolve) => {
    execFile(process.execPath, [join(TOOLS, 'generar-noticias.mjs')], { cwd: RAIZ }, (err, stdout, stderr) => {
      resolve({ ok: !err, salida: (stdout || '') + (stderr || '') });
    });
  });
}

/* -------------------------------------------------------------------------
 * Servidor
 * ---------------------------------------------------------------------- */

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PUERTO}`);
  const ruta = url.pathname;

  /* Defensa contra «DNS rebinding»: una web maliciosa puede hacer que un
     dominio suyo apunte a 127.0.0.1 y hablar con este servidor. Si la
     cabecera Host no es la nuestra, no contestamos. */
  const host = (req.headers.host || '').split(':')[0];
  if (host !== '127.0.0.1' && host !== 'localhost') {
    res.writeHead(403).end('Host no permitido');
    return;
  }

  /* --- la página del panel --- */
  if (ruta === '/' && req.method === 'GET') {
    const html = readFileSync(join(TOOLS, 'admin.html'));
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(html);
    return;
  }

  /* La hoja de estilos del sitio, para que el panel se vea como la web. */
  if (ruta === '/styles.css' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
    res.end(readFileSync(join(RAIZ, 'styles.css')));
    return;
  }

  /* Vista previa de las imágenes ya subidas. */
  if (ruta.startsWith('/img/') && req.method === 'GET') {
    const rel = decodeURIComponent(ruta.slice(5));
    const destino = resolve(RAIZ, rel);
    if (!destino.startsWith(join(RAIZ, 'images')) || !existsSync(destino)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': TIPOS_IMAGEN[extname(destino).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(destino));
    return;
  }

  /* --- entrar --- */
  if (ruta === '/api/login' && req.method === 'POST') {
    let cuerpo;
    try {
      cuerpo = await leerCuerpo(req);
    } catch {
      return json(res, 400, { error: 'Petición inválida.' });
    }

    if (!igual(cuerpo.usuario || '', USUARIO) || !igual(cuerpo.clave || '', CLAVE)) {
      /* Un respiro antes de contestar, para que probar claves a lo bruto sea
         lento aunque el panel sea local. */
      await new Promise((r) => setTimeout(r, 600));
      return json(res, 401, { error: 'Usuario o contraseña incorrectos.' });
    }

    const ficha = randomBytes(32).toString('hex');
    sesiones.add(ficha);
    return json(res, 200, { ficha });
  }

  /* --- de aquí abajo, hay que haber entrado ---
     La ficha va en una cabecera, no en una cookie: sin cookie no hay forma de
     que otra web haga peticiones a este servidor en tu nombre. */
  if (ruta.startsWith('/api/')) {
    const auth = req.headers.authorization || '';
    const ficha = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!sesiones.has(ficha)) {
      return json(res, 401, { error: 'Sesión caducada. Vuelve a entrar.' });
    }
  }

  try {
    /* --- salir --- */
    if (ruta === '/api/logout' && req.method === 'POST') {
      sesiones.delete((req.headers.authorization || '').slice(7));
      return json(res, 200, { ok: true });
    }

    /* --- listado --- */
    if (ruta === '/api/noticias' && req.method === 'GET') {
      return json(res, 200, { noticias: listar(), imagenes: imagenesDisponibles() });
    }

    /* --- crear y actualizar --- */
    if (ruta === '/api/noticias' && req.method === 'POST') {
      const cuerpo = await leerCuerpo(req);
      const { noticia, errores } = normalizar(cuerpo);

      if (errores) return json(res, 400, { error: errores.join(' ') });

      const destino = rutaNoticia(noticia.id);
      const existia = existsSync(destino);

      /* Al crear no se pisa una noticia que ya esté. Al editar sí, pero solo
         la suya: si le cambian la fecha o el título, el id cambia y hay que
         borrar el archivo viejo. */
      if (!cuerpo.idOriginal && existia) {
        return json(res, 409, { error: `Ya existe una noticia con el id «${noticia.id}».` });
      }

      writeFileSync(destino, JSON.stringify(noticia, null, 2) + '\n');

      if (cuerpo.idOriginal && cuerpo.idOriginal !== noticia.id && idValido(cuerpo.idOriginal)) {
        const viejo = rutaNoticia(cuerpo.idOriginal);
        if (existsSync(viejo)) unlinkSync(viejo);
      }

      const gen = await regenerar();
      return json(res, 200, { ok: true, id: noticia.id, generador: gen });
    }

    /* --- borrar --- */
    if (ruta.startsWith('/api/noticias/') && req.method === 'DELETE') {
      const id = decodeURIComponent(ruta.slice('/api/noticias/'.length));
      const destino = rutaNoticia(id);

      if (!existsSync(destino)) return json(res, 404, { error: 'Esa noticia ya no está.' });

      unlinkSync(destino);
      const gen = await regenerar();
      return json(res, 200, { ok: true, generador: gen });
    }

    /* --- subir una imagen --- */
    if (ruta === '/api/imagen' && req.method === 'POST') {
      const cuerpo = await leerCuerpo(req);
      const ext = extname(String(cuerpo.nombre || '')).toLowerCase();

      if (!TIPOS_IMAGEN[ext]) {
        return json(res, 400, { error: 'Solo se admiten .jpg, .png y .webp.' });
      }

      const datos = Buffer.from(String(cuerpo.datos || ''), 'base64');

      if (!datos.length) return json(res, 400, { error: 'El archivo ha llegado vacío.' });
      if (datos.length > MAX_IMAGEN) return json(res, 400, { error: 'La imagen pasa de 5 MB.' });

      /* Comprobamos que el contenido sea de verdad lo que dice la extensión. */
      const esJpg = datos[0] === 0xff && datos[1] === 0xd8;
      const esPng = datos.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
      const esWebp = datos.slice(0, 4).toString() === 'RIFF' && datos.slice(8, 12).toString() === 'WEBP';

      if (!esJpg && !esPng && !esWebp) {
        return json(res, 400, { error: 'Ese archivo no parece una imagen.' });
      }

      /* El nombre lo decidimos nosotros: nada de lo que venga del navegador
         entra tal cual en una ruta. */
      let nombre = aSlug(basename(String(cuerpo.nombre), ext)) || 'imagen';
      let final = `${nombre}${ext}`;
      let n = 2;
      while (existsSync(join(DIR_IMAGENES, final))) final = `${nombre}-${n++}${ext}`;

      writeFileSync(join(DIR_IMAGENES, final), datos);
      return json(res, 200, { ok: true, ruta: `images/noticias/${final}` });
    }

    return json(res, 404, { error: 'No existe.' });
  } catch (e) {
    return json(res, 400, { error: e.message });
  }
});

/** Las imágenes que ya hay, para poder elegir sin subir nada. */
function imagenesDisponibles() {
  const lista = [];

  for (const carpeta of ['images', 'images/noticias']) {
    const dir = join(RAIZ, carpeta);
    if (!existsSync(dir)) continue;

    for (const f of readdirSync(dir)) {
      const ruta = join(dir, f);
      if (statSync(ruta).isFile() && TIPOS_IMAGEN[extname(f).toLowerCase()]) {
        lista.push(`${carpeta}/${f}`);
      }
    }
  }

  return lista.sort();
}

servidor.listen(PUERTO, HOST, () => {
  console.log(`
  Panel de noticias del CB Dominicos

    http://${HOST}:${PUERTO}

    usuario: ${USUARIO}
    clave:   la que tienes puesta en tools/admin.mjs

  Escribe en noticias/*.json y en images/noticias/, y regenera la web a cada
  cambio. Cuando termines, revisa con «git status» y haz commit y push.

  Solo escucha en ${HOST}: desde otro equipo de la red no se ve.
  Para parar: Ctrl+C
`);
});
