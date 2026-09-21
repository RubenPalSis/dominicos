# Web del CB Dominicos Zaragoza

La web del club: HTML, CSS y JavaScript, sin compilación ni dependencias,
publicada en GitHub Pages sobre `baloncestodominicos.es`.

```
.
├── dominicosweb/              ← la web
│   ├── index.html             portada
│   ├── noticias.html          listado de noticias
│   ├── 404.html               página no encontrada
│   ├── styles.css
│   ├── script.js              interacciones comunes a todas las páginas
│   ├── robots.txt
│   ├── sitemap.xml            lo genera el script, no se edita a mano
│   ├── manifest.webmanifest
│   ├── CNAME                  dominio de GitHub Pages
│   ├── images/                fotos del sitio
│   │   └── noticias/          fotos de las noticias
│   ├── noticias/              una noticia = un .json  (+ el .html generado)
│   ├── tools/                 herramienta local, NO se publica
│   │   └── generar-noticias.mjs
│   └── NOTICIAS.md            cómo publicar una noticia
│
└── baloncestodominicos.es/    copia de la web antigua (Divi), solo consulta
```

## Publicar una noticia

Se crea un archivo JSON en `dominicosweb/noticias/`, se sube la foto a
`dominicosweb/images/noticias/` y se hace commit y push. La página de la
noticia, el listado, las tres de la portada y el sitemap se generan solos.

Paso a paso, con la tabla de campos, en
[dominicosweb/NOTICIAS.md](dominicosweb/NOTICIAS.md).

## Publicación

La web está publicada en **GitHub Pages**, servida directamente desde este
repositorio en el dominio `baloncestodominicos.es`.

Cada `git push` a `main` que toque `dominicosweb/` vuelve a publicar la web
automáticamente, mediante [.github/workflows/pages.yml](.github/workflows/pages.yml).
Antes de empaquetar, el workflow ejecuta `tools/generar-noticias.mjs`, que
reconstruye la página de cada noticia, el listado de `noticias.html`, las tres
noticias de la portada y el sitemap a partir de los JSON. Los `.json` no se
publican: son la fuente, y servirlos además de las páginas daría el mismo texto
en dos direcciones. Si un JSON está mal, la publicación falla ahí y la web
publicada se queda como estaba.

Para publicar a mano sin cambiar nada: pestaña Actions → «Publicar la web» →
Run workflow.

El dominio lo fija [dominicosweb/CNAME](dominicosweb/CNAME). Si se cambia el
dominio hay que editar ese archivo **y** el campo «Custom domain» en Settings →
Pages, además de los registros DNS.

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
node tools/generar-noticias.mjs   # regenera noticias, listados y sitemap
python3 -m http.server 8000       # y abre http://localhost:8000
```

Hace falta el servidor porque los enlaces del menú empiezan por `/` (apuntan a
la raíz del sitio) y con doble clic (`file://`) esa raíz sería la del disco.

Para comprobar la sintaxis antes de subir nada:

```bash
node --check dominicosweb/script.js
node --check dominicosweb/tools/generar-noticias.mjs
```

## Formulario de contacto

Lo envía [Formspree](https://formspree.io): el `action` del formulario, en
`dominicosweb/index.html`, lleva el id del formulario. Ese id es público y va
en el HTML a la vista; **no es un secreto**.

Nunca debe ponerse en el repositorio un token de GitHub, una contraseña ni una
clave de API: todo lo que hay en `dominicosweb/` se sirve tal cual a cualquiera
que pida la URL.

## Historia

Hasta 2026 la web fue un WordPress con el tema Divi. De ahí salen la copia de
consulta de `baloncestodominicos.es/` y los textos y fechas de las noticias
antiguas.

Durante la migración existió también una versión de este mismo diseño como tema
y plugin de WordPress (`dominicos-theme`, `dominicos-core`). Se eliminó al pasar
a estático, porque GitHub Pages no ejecuta PHP. Si alguna vez hiciera falta,
está en el historial de git, en el commit anterior a su borrado.

## Cómo se obtuvo la copia de la web antigua

```bash
wget --mirror --page-requisites --adjust-extension --convert-links \
     --no-parent --level=2 --timeout=10 --tries=1 --reject="xmlrpc.php" \
     https://baloncestodominicos.es/
```
