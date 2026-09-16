# Web del CB Dominicos Zaragoza

Este repositorio contiene la web del club en dos formas: el diseño original en
HTML estático y ese mismo diseño convertido en un tema y un plugin de
WordPress, listos para instalar.

```
.
├── dominicosweb/              ← el trabajo
│   ├── index.html             diseño original (referencia, no se toca)
│   ├── styles.css
│   ├── script.js
│   ├── images/
│   │
│   ├── dominicos-theme/       tema de WordPress
│   ├── dominicos-core/        plugin de WordPress
│   ├── dist/                  los dos ZIP instalables
│   └── INSTALACION.md         guía paso a paso
│
└── baloncestodominicos.es/    copia de la web antigua (Divi), solo consulta
```

## Instalar

En `dominicosweb/dist/` hay dos archivos:

1. **`dominicos-core.zip`** → Plugins → Añadir nuevo → Subir plugin → Activar
2. **`dominicos-theme.zip`** → Apariencia → Temas → Añadir nuevo → Subir tema → Activar

Y ya está. Al entrar al panel, el tema se configura solo: crea la portada y la
página de noticias, las asigna en Ajustes, monta los menús de cabecera y pie,
pone los enlaces permanentes, sube el escudo y carga los 9 equipos y las 3
noticias que ya tenía la web, con sus fotos.

El detalle completo, y qué hacer después, está en
[dominicosweb/INSTALACION.md](dominicosweb/INSTALACION.md).

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
