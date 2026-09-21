# Web del CB Dominicos Zaragoza

Este repositorio contiene la web del club en dos formas: el diseño original en
HTML estático —que es lo que está publicado, en GitHub Pages, sobre
`baloncestodominicos.es`— y ese mismo diseño convertido en un tema y un plugin
de WordPress, listos para instalar si algún día se vuelve a ese camino.

```
.
├── dominicosweb/              ← el trabajo
│   ├── index.html             diseño original (referencia, no se toca)
│   ├── styles.css
│   ├── script.js
│   ├── images/
│   ├── CNAME                  dominio de GitHub Pages
│   │
│   ├── dominicos-theme/       tema de WordPress
│   ├── dominicos-core/        plugin de WordPress
│   ├── dist/                  los dos ZIP instalables
│   └── INSTALACION.md         guía paso a paso
│
└── baloncestodominicos.es/    copia de la web antigua (Divi), solo consulta
```

## Instalar en WordPress

No hace falta para la web publicada; solo si se vuelve a WordPress.
En `dominicosweb/dist/` hay dos archivos:

1. **`dominicos-core.zip`** → Plugins → Añadir nuevo → Subir plugin → Activar
2. **`dominicos-theme.zip`** → Apariencia → Temas → Añadir nuevo → Subir tema → Activar

Y ya está. Al entrar al panel, el tema se configura solo: crea la portada y la
página de noticias, las asigna en Ajustes, monta los menús de cabecera y pie,
pone los enlaces permanentes, sube el escudo y carga los 9 equipos y las 3
noticias que ya tenía la web, con sus fotos.

El detalle completo, y qué hacer después, está en
[dominicosweb/INSTALACION.md](dominicosweb/INSTALACION.md).

## Publicación

La web está publicada en **GitHub Pages**, servida directamente desde este
repositorio en el dominio `baloncestodominicos.es`.

Lo que se publica es solo la web estática: `index.html`, `styles.css`,
`script.js` y `images/`. El tema y el plugin de WordPress **no** se publican,
porque Pages no ejecuta PHP; siguen en el repositorio por si algún día se
vuelve a una instalación de WordPress.

Cada `git push` a `main` que toque `dominicosweb/` vuelve a publicar la web
automáticamente, mediante [.github/workflows/pages.yml](.github/workflows/pages.yml).
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

## Qué hace cada pieza

**`dominicos-theme`** es el diseño. El CSS es literalmente `styles.css`, con un
bloque añadido al final para las pantallas que la web estática no tenía
(listado de noticias, ficha de noticia, ficha de equipo). El JavaScript es
`script.js` con comprobaciones para que funcione en todas las plantillas.

**`dominicos-core`** son los datos: el tipo de contenido Equipos, sus
categorías, los datos de contacto del club, los PDF de inscripción y el
formulario. Vive aparte a propósito, para que esa información siga existiendo
si algún día se cambia el diseño.

Las noticias usan las **Entradas** de WordPress, sin nada a medida.

## Desarrollo

No hay compilación ni dependencias: son PHP, CSS y JavaScript planos. Para
regenerar los ZIP tras un cambio:

```bash
cd dominicosweb
rm -f dist/*.zip
zip -rq dist/dominicos-theme.zip dominicos-theme
zip -rq dist/dominicos-core.zip  dominicos-core
```

Para comprobar la sintaxis antes de subir nada:

```bash
find dominicosweb/dominicos-theme dominicosweb/dominicos-core -name '*.php' -exec php -l {} \;
node --check dominicosweb/dominicos-theme/assets/js/main.js
```

## Cómo se obtuvo la copia de la web antigua

```bash
wget --mirror --page-requisites --adjust-extension --convert-links \
     --no-parent --level=2 --timeout=10 --tries=1 --reject="xmlrpc.php" \
     https://baloncestodominicos.es/
```
