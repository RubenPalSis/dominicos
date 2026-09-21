# Cómo publicar una noticia

Una noticia es **un archivo de texto** en `noticias/`. Escribes ese archivo y
todo lo demás —su página, el listado, la portada y el sitemap— se genera solo.

No hay panel, ni contraseñas, ni base de datos. Solo el JSON y un comando.

---

## Lo corto

1. Crea `noticias/AAAA-MM-DD-nombre-corto.json` copiando el ejemplo de abajo.
2. Sube la foto a `images/noticias/`.
3. Sube los dos archivos a GitHub (web o `git`).
4. Espera un minuto.

Al subirla se genera sola:

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

Se llama igual que el `id`, con `.json` al final, y vive en `noticias/`:

    noticias/2026-09-21-nuevo-patrocinador.json

```json
{
  "id": "2026-09-21-nuevo-patrocinador",
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
| `id`          | Sí           | `AAAA-MM-DD-nombre-corto`, en minúsculas y con guiones. Sin acentos. |
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

Sale del `id` quitándole la fecha:

    id: 2026-09-21-nuevo-patrocinador
    →  https://baloncestodominicos.es/noticias/nuevo-patrocinador.html

Elige bien el nombre: **una vez publicada, cambiarlo rompe el enlace** para
quien lo haya compartido y para Google.

---

## La foto

Va en `images/noticias/`. Lee el [README de esa carpeta](images/noticias/README.md):
dice el tamaño y el peso que conviene.

---

## Subirla

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

En los dos casos, al llegar a `main` se dispara el workflow
[«Publicar la web»](../.github/workflows/pages.yml), que **regenera solo** el
listado, la página de la noticia y el sitemap antes de publicar. No hay que
acordarse de nada más.

---

## Verla antes de publicarla (opcional)

Si tienes Node y Python a mano:

```bash
cd dominicosweb
node tools/generar-noticias.mjs   # crea las páginas y los listados
python3 -m http.server 8000       # y abre http://localhost:8000
```

Hace falta el servidor porque los enlaces del menú empiezan por `/` (apuntan a
la raíz del sitio), y abriendo el HTML con doble clic (`file://`) esa raíz es
la del disco duro, no la de la web. Con el servidor funciona todo igual que en
producción.

Si el JSON tiene algo mal, el script no genera nada y dice exactamente qué
falla: fecha con otro formato, `id` con mayúsculas, una imagen que no existe…

---

## Borrar o corregir una noticia

- **Corregir**: edita su `.json` y sube el cambio.
- **Borrar**: borra su `.json`. La página `.html` correspondiente desaparece
  en la siguiente publicación, y también sale del listado y del sitemap.

Los `.html` de `noticias/`, el listado de `noticias.html`, las tres noticias de
la portada de `index.html` y el `sitemap.xml` **los escribe el script**: no los
edites a mano, porque se sobreescriben. En `noticias.html` e `index.html` el
script solo toca lo que hay entre `<!-- NOTICIAS:INICIO -->` y
`<!-- NOTICIAS:FIN -->`; el resto de esas páginas es tuyo.

---

## Si algún día quieres un panel online

Publicar noticias desde el móvil, sin encender el ordenador, se puede. Lo que
hace falta es que **la contraseña se compruebe en algún sitio que no sea el
navegador**. Tres formas, de menos a más trabajo:

**1. Desde la web de GitHub, sin instalar nada.** Ya funciona hoy: entras en
`dominicosweb/noticias/`, pulsas «Add file» y pegas el JSON. Tu cuenta de
GitHub es el login. Es incómodo para escribir, pero no cuesta nada montarlo.

**2. Un CMS que entra con tu cuenta de GitHub** — Decap CMS o Sveltia CMS. Se
publican como una página más del sitio, pero **no guardan ninguna contraseña
ni ningún token**: te mandan a GitHub a identificarte y vuelven con un permiso
temporal. Necesitan un pequeño servicio de OAuth (hay gratuitos en Cloudflare
Workers). Es la opción que recomendaría, y el formato de las noticias no
cambiaría: leerían los mismos JSON.

**3. Una función propia** en Cloudflare Workers o Netlify, con el token de
GitHub guardado como variable de entorno del servicio, nunca en la página.

Lo que **no** vale, por mucho que se disfrace, es guardar la contraseña o el
token en el JavaScript de la web. No es que sea poco seguro: es que no es
seguro en absoluto, porque ese código se descarga entero en el navegador de
quien entre.
