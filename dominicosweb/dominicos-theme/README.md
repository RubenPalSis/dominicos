# Dominicos — tema de WordPress

Tema a medida del CB Dominicos Zaragoza. Es la web que ya tenía el club
(`index.html` + `styles.css` + `script.js`) convertida en un tema, sin
rediseñar nada: el CSS es literalmente el mismo archivo, con un bloque añadido
al final para las pantallas que antes no existían.

Necesita el plugin **Dominicos Core** para los equipos, los datos del club y el
formulario de contacto. Sin él el tema sigue funcionando: las secciones que
dependen del plugin simplemente no se pintan.

## Configuración automática

La primera vez que se entra al panel con el tema activo, `inc/setup-wizard.php`
deja el sitio montado: crea las páginas Inicio y Noticias y las asigna en
Ajustes → Lectura, pone los enlaces permanentes por nombre, monta los menús de
cabecera y pie, sube el escudo como logotipo e icono, vacía los widgets que
WordPress mete solo en el pie y manda a la papelera *Hello world!* y la página
de ejemplo.

Cada paso se comprueba por separado y solo actúa si no encuentra nada puesto,
así que es inofensivo sobre una instalación con contenido. Queda marcado en la
opción `dominicos_setup_version` y no se repite.

## Estructura

```
dominicos-theme/
├── style.css                  cabecera del tema + ajustes propios de WordPress
├── functions.php              carga inc/
├── inc/
│   ├── setup.php              soportes, menús, tamaños de imagen, extractos
│   ├── setup-wizard.php       configuración automática de la primera vez
│   ├── enqueue.php            CSS, JS y fuentes
│   ├── nav-walker.php         menú sin <ul>, como el diseño original
│   ├── template-tags.php      funciones que usan las plantillas
│   └── customizer.php         todos los textos de la portada
├── header.php · footer.php
├── front-page.php             portada
├── home.php                   listado de noticias (/noticias/)
├── single.php                 noticia individual
├── archive.php                categorías, etiquetas, autor, fechas
├── page.php                   páginas normales
├── archive-equipo.php         listado de equipos (/equipos/)
├── single-equipo.php          ficha de equipo
├── taxonomy-categoria_equipo.php
├── search.php · searchform.php · comments.php · 404.php · index.php
├── template-parts/
│   ├── front/                 una sección de la portada por archivo
│   ├── card-equipo.php · card-noticia.php
│   ├── page-hero.php · content-none.php
└── assets/
    ├── css/main.css           hoja original + añadidos de WordPress
    ├── css/editor.css         estilos del editor
    ├── js/main.js             script original con guardas
    └── images/                imágenes del club
```

## Dónde se edita cada cosa

| Qué | Dónde |
|---|---|
| Textos e imágenes de la portada | **Apariencia → Personalizar → Dominicos** |
| Escudo | **Apariencia → Personalizar → Identidad del sitio → Logotipo** |
| Menú de cabecera y de pie | **Apariencia → Menús** |
| Noticias | **Entradas** |
| Equipos y sus categorías | **Equipos** (lo aporta el plugin) |
| Email, redes y PDF de inscripción | **Equipos → Datos del club** (plugin) |

## Detalles que conviene conocer

**El menú no usa listas.** El CSS original ataca `.menu a` directamente, así
que `Dominicos_Nav_Walker` imprime `<a>` sueltos. Para que un elemento salga
como botón rojo, escribe `menu__cta` en su campo *Clases CSS* (se activa desde
*Opciones de pantalla*, arriba a la derecha de Apariencia → Menús).

**Los enlaces con ancla no se marcan como activos.** WordPress considera
«actual» cualquier enlace personalizado que apunte a la portada, y eso pintaba
el subrayado rojo en todos a la vez. Del resaltado se encarga el JavaScript
según la sección visible.

**Si no hay menú asignado**, la cabecera y el pie muestran los enlaces de la
web original apuntando a las anclas de la portada. El sitio nunca se queda sin
navegación.

**Las cifras animadas** se escriben tal cual en el Personalizador. `6000+`
anima hasta 6000 y añade el `+`; `2009` se detecta como año y se escribe sin
separador de miles.

**Las tarjetas de equipo ahora enlazan a su ficha.** Antes abrían un lightbox;
el lightbox se ha reservado para las fotos que no llevan enlace.

**La pastilla roja de cada tarjeta** sale del campo *Etiqueta de la tarjeta* de
la ficha del equipo, no de la categoría. Así puede decir «Primaria», «Mini» o
«Mixto» como en la web original mientras la categoría sigue siendo «Escuela»,
«Benjamín» o «Alevín». Si el campo está vacío se usa el nombre de la categoría.

**Los documentos de inscripción sin archivo** se pintan igual pero sin enlace,
con la palabra *Próximamente*. De ese modo el bloque de inscripciones conserva
sus dos columnas desde el primer día.

**La miniatura en las noticias de la portada está desactivada** por defecto,
porque el diseño original son filas de texto. Se activa en
*Personalizar → Portada · Noticias*.

## Vista previa

`screenshot.png` es un esquema del diseño, no una captura real. Cuando tengas
el sitio publicado, sustitúyelo por una captura de la portada a 1200×900 px.

## Compatibilidad

WordPress 6.0 o superior y PHP 7.4 o superior. Sin dependencias externas salvo
las fuentes Archivo y Archivo Black de Google Fonts, que se cargan igual que en
la web original.
