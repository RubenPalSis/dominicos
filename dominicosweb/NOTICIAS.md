# Cómo publicar una noticia

> Esto es solo sobre las noticias. Para la portada, las páginas y los ajustes,
> mira [EDITAR.md](EDITAR.md).

Una noticia es **un archivo de texto** en `noticias/`. Escribes ese archivo y
todo lo demás —su página, el listado, la portada y el sitemap— se genera solo.

Hay dos formas de escribirlo: desde un **panel web**, rellenando un formulario,
o **a mano**, editando el archivo. Las dos hacen exactamente lo mismo, porque
el panel no es más que un editor de estos archivos. No hay base de datos.

---

## Con el panel (lo normal)

1. Entra en [app.pagescms.org](https://app.pagescms.org) y elige el
   repositorio `dominicos`.
2. **Noticias → New entry**.
3. Rellena el formulario. La foto se sube arrastrándola al campo «Foto».
4. **Save**.

Ya está. Al guardar, el panel hace un commit en el repositorio y la web se
vuelve a publicar sola en un par de minutos.

Lo que el panel llama «filename» es el nombre del archivo, y **es la dirección
de la noticia**: lo propone a partir de la fecha y el título, y solo lo deja
cambiar al crearla. Conviene acortarlo —de eso se habla más abajo.

Si el panel aún no está montado, mira
[cómo montarlo](EDITAR.md#montar-el-panel).

---

## A mano

1. Crea `noticias/AAAA-MM-DD-nombre-corto.json` copiando el ejemplo de abajo.
2. Sube la foto a `images/noticias/`.
3. Sube los dos archivos a GitHub (web o `git`).
4. Espera un minuto.

---

## Qué se genera solo

Escribas la noticia como la escribas, al llegar a GitHub se genera:

- su propia página, en `noticias/nombre-corto.html`, con su título, su
  descripción, su canonical y sus datos para Google;
- su tarjeta en el listado de `noticias.html`, la primera;
- su fila en la portada, si entra entre las tres más recientes;
- su entrada en `sitemap.xml`.

Todo eso se escribe **dentro del HTML**, no lo pinta JavaScript: es lo que hace
que Google vea la noticia en el primer rastreo y que quede enlazada desde la
portada y el listado, en vez de ser una página suelta a la que no llega nadie.

---

## El archivo de la noticia

Vive en `noticias/` y se llama `AAAA-MM-DD-nombre-corto.json`:

    noticias/2026-09-21-nuevo-patrocinador.json

```json
{
  "fecha": "2026-09-21",
  "titulo": "Nuevo patrocinador para Baloncesto Dominicos",
  "descripcion": "Una frase que resuma la noticia. Es lo que se ve en el listado y lo que sale en Google.",
  "contenido": [
    "El primer párrafo de la noticia.",
    "El segundo. Cada frase entre comillas es un párrafo.",
    "Añade tantos como quieras, separados por comas."
  ],
  "imagen": "images/noticias/nuevo-patrocinador.jpg",
  "imagenAlt": "Foto de la firma del acuerdo",
  "categoria": "Club",
  "enlace": "https://ejemplo.es/nota-de-prensa",
  "textoEnlace": "Más información",
  "mencion": "Empresa colaboradora",
  "autor": "CB Dominicos Zaragoza"
}
```

### Qué es obligatorio y qué no

| Campo         | ¿Hace falta? | Para qué sirve                                                      |
|---------------|--------------|---------------------------------------------------------------------|
| `fecha`       | Sí           | `AAAA-MM-DD`. Ordena el listado y es la fecha real de publicación.   |
| `titulo`      | Sí           | El titular.                                                          |
| `descripcion` | Sí           | El resumen del listado y la `meta description` de Google.            |
| `contenido`   | No           | El cuerpo, en párrafos. Si falta, se usa la `descripcion`.           |
| `imagen`      | No           | Ruta desde la raíz, **sin barra delante**. Si falta, se usa el escudo. |
| `imagenAlt`   | No           | Qué se ve en la foto, para quien no la ve. Ponlo siempre que haya foto. |
| `fechaTexto`  | No           | Para escribir la fecha a mano, p. ej. `"11–12 jun 2022"`.            |
| `fechaModificacion` | No     | Solo si corriges una noticia ya publicada. Google lo usa como `dateModified`. No lo pongas «por poner». |
| `categoria`   | No           | Etiqueta roja sobre la foto. P. ej. `Competición`, `Club`, `Escuela`. |
| `enlace`      | No           | Botón al final de la noticia. Solo `http://` o `https://`.           |
| `textoEnlace` | No           | Texto del botón. Si no se pone: «Más información».                   |
| `mencion`     | No           | Una línea de agradecimiento o de crédito.                            |
| `autor`       | No           | Quién firma.                                                         |

### La dirección de la noticia

Sale del **nombre del archivo**, quitándole la fecha:

    noticias/2026-09-21-nuevo-patrocinador.json
    →  https://baloncestodominicos.es/noticias/nuevo-patrocinador.html

Por eso el nombre tiene que ser `AAAA-MM-DD-` seguido de un nombre corto en
minúsculas, con guiones y **sin acentos ni eñes**. Si te lo propone el panel a
partir del título, suele salir larguísimo: acórtalo. `nuevo-patrocinador` se
lee y se comparte mejor que
`nuevo-patrocinador-para-baloncesto-dominicos-zaragoza`.

Elige bien el nombre: **una vez publicada, cambiarlo rompe el enlace** para
quien lo haya compartido y para Google.

---

## La foto

Va en `images/noticias/`. Lee el [README de esa carpeta](images/noticias/README.md):
dice el tamaño y el peso que conviene.

Desde el panel se sube arrastrándola al campo «Foto», y va sola a esa carpeta.

---

## Subirla a mano

### Desde la web de GitHub, sin instalar nada

1. Entra en el repositorio → carpeta `dominicosweb/images/noticias/`.
2. **Add file → Upload files**, arrastra la foto, **Commit changes**.
3. Ve a `dominicosweb/noticias/` → **Add file → Create new file**.
4. Escribe el nombre (`2026-09-21-nuevo-patrocinador.json`), pega el JSON,
   **Commit changes**.

### Desde el ordenador

```bash
git add dominicosweb/noticias dominicosweb/images/noticias
git commit -m "Noticia: nuevo patrocinador"
git push
```

En los tres casos —panel, web de GitHub o `git`—, al llegar a `main` se dispara
el workflow [«Publicar la web»](../.github/workflows/pages.yml), que **regenera
solo** el listado, la página de la noticia y el sitemap antes de publicar. No
hay que acordarse de nada más.

---

## Verla antes de publicarla (opcional)

Si tienes Node y Python a mano:

```bash
cd dominicosweb
node tools/generar.mjs   # crea las páginas y los listados
python3 -m http.server 8000       # y abre http://localhost:8000
```

Hace falta el servidor porque los enlaces del menú empiezan por `/` (apuntan a
la raíz del sitio), y abriendo el HTML con doble clic (`file://`) esa raíz es
la del disco duro, no la de la web. Con el servidor funciona todo igual que en
producción.

Si el JSON tiene algo mal, el script no genera nada y dice exactamente qué
falla: fecha con otro formato, nombre de archivo con mayúsculas, una imagen que
no existe…

---

## Borrar o corregir una noticia

- **Corregir**: desde el panel, ábrela y dale a **Save**. A mano, edita su
  `.json` y sube el cambio.
- **Borrar**: desde el panel, **Delete**. A mano, borra su `.json`. La página
  `.html` correspondiente desaparece en la siguiente publicación, y también
  sale del listado y del sitemap.

**Ningún `.html` de la web se edita a mano.** Todos —la portada, el listado,
la página de cada noticia, las páginas sueltas y la de error— los escribe
`tools/generar.mjs` a partir de los JSON, y se sobreescriben enteros en cada
publicación. Lo que se edita son los datos; el HTML es el resultado.

Lo mismo vale para `sitemap.xml`, `robots.txt`, `manifest.webmanifest` y
`CNAME`: salen de `datos/sitio.json`.

---

## El panel

El panel es [Pages CMS](https://pagescms.org): gratuito, de código abierto y
**sin servidor propio ni base de datos**. Se conecta al repositorio y hace
commits en él; lo que ves en el formulario son los campos de estos mismos
JSON. Si mañana desapareciera, la web sigue funcionando igual, porque el
contenido está en el repositorio, no en el panel.

Cómo montarlo y cómo dar acceso a alguien sin cuenta de GitHub, en
[EDITAR.md](EDITAR.md#montar-el-panel).

Lo que el panel enseña lo describe [`.pages.yml`](../.pages.yml), en la raíz
del repositorio. Si añades un campo a las noticias, hay que añadirlo también
ahí **y** en [`tools/lib/noticias.mjs`](tools/lib/noticias.mjs), que es quien
lo pinta.

### Lo que no vale

Publicar desde el móvil se puede hacer de muchas formas, pero la contraseña
tiene que comprobarse **en algún sitio que no sea el navegador**. Pages CMS lo
resuelve mandándote a GitHub a identificarte: no guarda ninguna contraseña del
club.

Lo que **no** vale, por mucho que se disfrace, es guardar la contraseña o el
token en el JavaScript de la web. No es que sea poco seguro: es que no es
seguro en absoluto, porque ese código se descarga entero en el navegador de
quien entre.
