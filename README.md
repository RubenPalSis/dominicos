# Web del CB Dominicos Zaragoza

La web del club: HTML, CSS y JavaScript, sin compilación ni dependencias,
publicada en GitHub Pages sobre `baloncestodominicos.es`.

Se edita desde un panel web, [Pages CMS](https://pagescms.org), que no es más
que un formulario sobre los archivos de este repositorio. **Todo el contenido
son datos en JSON; todo el HTML se genera.**

```
.
├── .pages.yml                 ← qué campos pide el panel de edición
│
├── dominicosweb/              ← la web
│   │
│   │   ── CONTENIDO: lo que se edita ──
│   ├── datos/
│   │   ├── sitio.json         nombre, correo, redes, dominio, colores
│   │   ├── menu.json          menú de arriba y del pie
│   │   ├── portada.json       las secciones de la portada
│   │   ├── pagina-noticias.json  textos de la cabecera del listado
│   │   └── error404.json      la página de error
│   ├── paginas/               una página suelta = un .json
│   ├── noticias/              una noticia = un .json
│   ├── images/                fotos del sitio
│   │   └── noticias/          fotos de las noticias
│   ├── documentos/            PDF descargables (fichas de inscripción)
│   │
│   │   ── CÓDIGO: lo que no se toca desde el panel ──
│   ├── styles.css
│   ├── script.js              interacciones comunes a todas las páginas
│   ├── tools/
│   │   ├── generar.mjs        genera la web entera
│   │   └── lib/
│   │       ├── comun.mjs      escapado, cabecera, pie, armazón del documento
│   │       ├── datos.mjs      lectura y validación del contenido
│   │       ├── secciones.mjs  un renderizador por tipo de sección
│   │       └── noticias.mjs   tarjetas, listado y página de cada noticia
│   │
│   │   ── GENERADO: no editar, se sobreescribe ──
│   ├── index.html             portada
│   ├── noticias.html          listado de noticias
│   ├── 404.html               página no encontrada
│   ├── <pagina>.html          una por cada paginas/<pagina>.json
│   ├── noticias/<slug>.html   una por cada noticia
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── manifest.webmanifest
│   └── CNAME                  dominio de GitHub Pages
│
└── baloncestodominicos.es/    copia de la web antigua (Divi), solo consulta
```

Guías de edición, escritas para quien lleva la web sin saber programar:

- **[dominicosweb/EDITAR.md](dominicosweb/EDITAR.md)** — la portada, las
  páginas nuevas y los ajustes.
- **[dominicosweb/NOTICIAS.md](dominicosweb/NOTICIAS.md)** — publicar una
  noticia, con la tabla de campos.

## Panel de edición

El panel es [Pages CMS](https://pagescms.org): gratuito, de código abierto y
sin servidor ni base de datos propios. No es una capa encima de la web: es un
formulario que **hace commits en este repositorio**, los mismos que se harían
a mano. Si el panel dejara de existir, la web y su contenido siguen aquí.

Al guardar, el commit llega a `main` y dispara la publicación normal. Si algún
dato quedara mal, el workflow falla y la web publicada se queda como estaba.

Cómo montarlo la primera vez y cómo dar acceso a alguien sin cuenta de GitHub,
en [EDITAR.md](dominicosweb/EDITAR.md#montar-el-panel).

### Las dos mitades

[`.pages.yml`](.pages.yml) dice **qué campos pide** el panel.
[`tools/generar.mjs`](dominicosweb/tools/generar.mjs) y sus módulos dicen
**cómo se pintan**. Son las dos mitades de lo mismo:

- ¿un campo nuevo en una sección? → al bloque en `.pages.yml` **y** a su
  función en [`tools/lib/secciones.mjs`](dominicosweb/tools/lib/secciones.mjs);
- ¿un tipo de sección nuevo? → una función en `secciones.mjs`, su entrada en
  `TIPOS`, y su bloque en `.pages.yml`;
- ¿un campo nuevo en las noticias? → `.pages.yml` **y**
  [`tools/lib/noticias.mjs`](dominicosweb/tools/lib/noticias.mjs).

Si se añade solo en un sitio no pasa nada malo: el panel pedirá un dato que
nadie pinta, o el generador buscará un dato que nadie rellena y lo dejará
vacío. Pero no hará lo que se espera.

### Lo que el generador garantiza

- **Nada de lo que se escribe en el panel entra en el HTML sin escapar.** El
  contenido son datos, nunca marcado. La única excepción es el cuerpo de la
  sección «Texto libre», que es un editor de texto enriquecido y está marcada
  como tal en el código.
- **Si algo está mal, no se genera nada** y se dice qué archivo y qué campo:
  una foto que no existe, una fecha con otro formato, un tipo de sección
  desconocido, un nombre de página reservado. La publicación falla ahí y la
  web que ya está publicada no se toca.
- **Lo que se borra, desaparece.** Al quitar una noticia o una página, su
  `.html` se borra en la siguiente pasada y sale del menú y del sitemap.

## Publicación

La web está publicada en **GitHub Pages**, servida directamente desde este
repositorio en el dominio `baloncestodominicos.es`.

Cada `git push` a `main` que toque `dominicosweb/` vuelve a publicar la web
automáticamente, mediante [.github/workflows/pages.yml](.github/workflows/pages.yml).
Antes de empaquetar, el workflow ejecuta `tools/generar.mjs`, que reconstruye
el sitio entero a partir de los datos.

Las carpetas `datos/`, `paginas/`, `tools/` y los `.json` de `noticias/` **no
se publican**: son la fuente de la que sale la web, y servirlas además de las
páginas daría el mismo contenido en dos direcciones.

Para publicar a mano sin cambiar nada: pestaña Actions → «Publicar la web» →
Run workflow.

### El dominio

El dominio sale de `dominio`, en
[dominicosweb/datos/sitio.json](dominicosweb/datos/sitio.json): de ahí se
generan el `CNAME`, las direcciones del `sitemap.xml` y el `robots.txt`.

Si se cambia el dominio hay que editar ese campo **y** «Custom domain» en
Settings → Pages, además de los registros DNS.

### DNS

En el proveedor del dominio, para `baloncestodominicos.es`:

| Tipo  | Nombre | Valor                    |
|-------|--------|--------------------------|
| A     | `@`    | `185.199.108.153`        |
| A     | `@`    | `185.199.109.153`        |
| A     | `@`    | `185.199.110.153`        |
| A     | `@`    | `185.199.111.153`        |
| CNAME | `www`  | `rubenpalsis.github.io.` |

Los cuatro registros A son los servidores de GitHub Pages: se ponen los cuatro,
no uno. El CNAME de `www` hace que `www.baloncestodominicos.es` redirija al
dominio sin `www`.

Hay que **borrar los registros A, AAAA o CNAME que apunten al hosting
anterior**, o el dominio seguirá repartiéndose entre los dos sitios.

Cuando el DNS haya propagado (de minutos a 24 h), en Settings → Pages aparece
«DNS check successful» y se puede marcar **Enforce HTTPS**, que emite el
certificado de Let's Encrypt.

## Desarrollo

No hay que instalar nada. Para ver la web en local:

```bash
cd dominicosweb
node tools/generar.mjs        # genera la web a partir de los datos
python3 -m http.server 8000   # y abre http://localhost:8000
```

Hace falta el servidor porque los enlaces del menú empiezan por `/` (apuntan a
la raíz del sitio) y con doble clic (`file://`) esa raíz sería la del disco.

Para comprobar la sintaxis antes de subir nada:

```bash
node --check dominicosweb/script.js
for f in dominicosweb/tools/generar.mjs dominicosweb/tools/lib/*.mjs; do
  node --check "$f"
done
```

## Formulario de contacto

Lo envía [Formspree](https://formspree.io). El id del formulario está en
`formspree`, dentro de `datos/sitio.json`, y de ahí va al `action` del
formulario. Ese id es público y va en el HTML a la vista; **no es un secreto**.

Mientras ponga `TU_ID_DE_FORMSPREE`, el formulario no envía nada y avisa en
pantalla en vez de tragarse los mensajes.

Nunca debe ponerse en el repositorio un token de GitHub, una contraseña ni una
clave de API: todo lo que se publica se sirve tal cual a cualquiera que pida
la URL.

## Historia

Hasta 2026 la web fue un WordPress con el tema Divi. De ahí salen la copia de
consulta de `baloncestodominicos.es/` y los textos y fechas de las noticias
antiguas.

Durante la migración existió también una versión de este mismo diseño como tema
y plugin de WordPress (`dominicos-theme`, `dominicos-core`). Se eliminó al pasar
a estático, porque GitHub Pages no ejecuta PHP. Si alguna vez hiciera falta,
está en el historial de git, en el commit anterior a su borrado.

Después, la web fue HTML escrito a mano con las noticias ya en JSON. Al pasar
al panel se hizo lo mismo con el resto: la portada, las páginas y los ajustes
dejaron de estar dentro del HTML y pasaron a `datos/`. El diseño no cambió.

## Cómo se obtuvo la copia de la web antigua

```bash
wget --mirror --page-requisites --adjust-extension --convert-links \
     --no-parent --level=2 --timeout=10 --tries=1 --reject="xmlrpc.php" \
     https://baloncestodominicos.es/
```
