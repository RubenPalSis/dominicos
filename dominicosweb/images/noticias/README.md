# Fotos de las noticias

Aquí van las imágenes de las noticias nuevas: una por noticia, con un nombre
que se entienda.

    images/noticias/torneo-de-cuarte-2026.jpg

Luego, en el JSON de la noticia, se apunta a ella **sin barra delante** y
desde la raíz de la web:

    "imagen": "images/noticias/torneo-de-cuarte-2026.jpg"

Un par de cosas antes de subir una foto:

- **Tamaño.** Con 1600 px de ancho sobra. Las tarjetas del listado se ven a
  3:2 y la cabecera de la ficha recorta, así que no hace falta más.
- **Peso.** Por debajo de 300 KB. Las fotos que ya hay en `images/` rondan
  las 100 KB; si la tuya pesa mucho más, vuelve a guardarla como JPG con
  calidad 80.
- **Texto alternativo.** Pon `"imagenAlt"` en el JSON describiendo lo que se
  ve. Es lo que lee quien no ve la imagen.

Las tres noticias que venían de la web anterior no tienen foto propia: usan
las de los equipos que salen en ellas (`images/benjamin.jpg`,
`images/infantil.jpg`, `images/cadete.jpg`). Cuando aparezcan las fotos
originales de aquellos partidos, se suben aquí y se cambia la ruta en su JSON.
