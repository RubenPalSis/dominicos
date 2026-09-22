# Cómo se edita la web

Toda la web se edita desde un panel: [app.pagescms.org](https://app.pagescms.org).
No hay que instalar nada ni saber programar.

Si es la primera vez, o hay que dar acceso a alguien, mira
[Montar el panel](#montar-el-panel) al final.

---

## Lo que se puede cambiar

Al entrar en el panel hay cuatro cosas en el menú de la izquierda:

| Sección        | Qué es                                                      |
|----------------|-------------------------------------------------------------|
| **Portada**    | La página de inicio, bloque a bloque.                        |
| **Noticias**   | Las noticias del club. Ver [NOTICIAS.md](NOTICIAS.md).       |
| **Páginas**    | Páginas nuevas: historia, escuela, aviso legal, lo que sea.  |
| **Ajustes**    | Nombre del club, correo, redes, menú y textos fijos.         |

Y una más, **Media**, que es el almacén de fotos y PDF.

Al darle a **Save**, el cambio se guarda y la web se vuelve a publicar sola.
Tarda un par de minutos. No hay botón de publicar: guardar *es* publicar.

---

## La portada

La portada es una **lista de secciones**, una debajo de otra. En el panel se
pueden:

- **cambiar**: abrir una sección y editar sus textos y sus fotos;
- **reordenar**: arrastrarlas para cambiar el orden en que se ven;
- **añadir y quitar**: con los botones de la lista.

### Las secciones que hay

| Sección                        | Para qué sirve                                          |
|--------------------------------|---------------------------------------------------------|
| Cabecera grande                | Lo primero que se ve: foto a pantalla completa, título grande y dos botones. |
| Tira de palabras en movimiento | La banda que cruza la pantalla con las categorías.      |
| Texto con cifras               | Un texto a la izquierda y números que cuentan solos a la derecha. |
| Tarjetas de equipos con filtros| Las fotos de los equipos, con los botones de filtrar.   |
| Panel de texto con foto al lado| Un bloque de texto y una foto grande al lado.           |
| Últimas noticias               | Las noticias más recientes. Se rellena sola.            |
| Logos de patrocinadores        | La franja de logos. Se rellena sola con las fotos que se llamen `patrocinador_1`, `patrocinador_2`… |
| Inscripciones con fichas       | El bloque rojo con los PDF descargables.                |
| Contacto con formulario        | Los datos de contacto y el formulario.                  |
| Texto libre                    | Un texto con negritas, enlaces y listas. Para lo demás. |

**Diseños nuevos, no.** Estas diez secciones son las que están dibujadas. Se
pueden usar tantas veces como se quiera y en cualquier orden, pero inventar
una sección con una pinta distinta es trabajo de programación: hay que
añadirla al código y al panel.

### Los patrocinadores

La franja de logos **no tiene una lista que rellenar**. Se hace sola con las
fotos: en **Fotos**, sube el logo con el nombre `patrocinador_1`, el siguiente
como `patrocinador_2`, y así. Salen en ese orden, de izquierda a derecha.

- **Dar de alta** un patrocinador es subir su logo con ese nombre.
- **Darlo de baja** es borrar el archivo.
- **Cambiar el orden** es renombrarlos. Que falte un número no importa: si
  están el 1, el 2 y el 7, salen esos tres seguidos.
- Si no hay ningún logo, la franja no aparece en la web.

Cada logo se pinta dentro de una cajita blanca del mismo alto, así que da
igual que uno sea alargado y otro cuadrado. Lo que conviene es que el logo
**no traiga márgenes anchos** dentro del archivo, o se verá pequeño al lado
de los demás.

En la sección hay un apartado para **ponerle nombre y web a un logo**, por su
número. No hace falta, pero:

- el **nombre** es lo que se lee en voz alta a quien no ve la pantalla;
- la **web** hace que el logo se pueda pulsar.

### El campo «Ancla»

Casi todas las secciones tienen un campo **Ancla**. Es el nombre con el que se
puede enlazar a esa sección desde el menú. Si una sección tiene el ancla
`equipos`, en el menú se pone `#equipos` como destino.

Si cambias o borras un ancla, **revisa el menú**: un enlace que apunte a un
ancla que ya no existe no lleva a ninguna parte.

---

## Páginas nuevas

**Páginas → New entry.** Se rellena el título y el resumen, y luego se
componen con las mismas secciones que la portada.

El nombre del archivo es la dirección de la página:

    historia-del-club  →  https://baloncestodominicos.es/historia-del-club.html

No hay que escribirlo: el panel le pone un nombre provisional y, al publicar,
se cambia solo por el título de la página. Si quieres uno distinto, cámbiaselo
tú al crearla; un nombre que ya esté bien no se vuelve a tocar. Y una vez
publicada, cambiarlo rompe el enlace para quien lo haya compartido.

Dos casillas que conviene entender:

- **Enseñar en el menú**: marcada, la página aparece sola en el menú de todas
  las páginas de la web. Sin marcar, la página existe y funciona, pero hay que
  enlazarla desde algún sitio o no llegará nadie.
- **Esconder de Google**: la página sigue siendo pública para quien tenga el
  enlace, pero no sale en los buscadores ni en el mapa del sitio. Para cosas
  como una encuesta interna. **No es una contraseña**: quien tenga la
  dirección, entra.

---

## Ajustes

Lo que se repite en todas las páginas.

- **Datos del club**: nombre, correo, redes, escudo, colores. Cambiar el
  correo aquí lo cambia en el pie, en el formulario, en el botón de
  inscripciones y en los avisos de error, todos a la vez.
- **Menú**: los enlaces de arriba y los del pie.
- **Página de noticias**: los textos de la cabecera del listado.
- **Página de error**: lo que se ve al entrar en una dirección que no existe.
- **Mantenimiento**: el interruptor para cerrar la web mientras se trabaja.
  Ver [Cerrar la web temporalmente](#cerrar-la-web-temporalmente).

### Dos campos delicados

**Dirección de la web** (en Datos del club). De aquí salen el dominio del sitio
y todas las direcciones del mapa que lee Google. Cambiarlo sin tocar antes el
DNS del dominio **deja la web inaccesible**. No se toca salvo que se esté
cambiando de dominio a propósito, y entonces hay que hacer lo que dice el
[README](../README.md#dns).

**Clave del formulario (Web3Forms)**. Es lo que hace que el formulario de
contacto llegue a alguien. Mientras ponga `TU_CLAVE_DE_WEB3FORMS`, el
formulario avisa en pantalla de que no está conectado en vez de tragarse los
mensajes. Esa clave es pública y va en el HTML a la vista: **no es una
contraseña**, lo único que permite es mandar un correo al club.

---

## Cerrar la web temporalmente

En **Ajustes → Mantenimiento** hay una casilla, «Poner la web en
mantenimiento». Marcándola y guardando, en un par de minutos:

- quien entre en `baloncestodominicos.es` —o en cualquier dirección del
  sitio— ve un cartel de «volvemos enseguida» a pantalla completa, con el
  escudo, una foto del club de fondo y los botones de llamar y escribir;
- la web de verdad, con todos los cambios, se publica en
  `baloncestodominicos.es/vista-previa/LA-CLAVE/`, y ahí puedes repasarla
  entera antes de enseñarla.

La clave sale del campo «Clave de la vista previa». Para desactivarlo,
desmarcas la casilla y guardas: todo vuelve a su sitio y la carpeta de vista
previa desaparece.

En esa misma pantalla se cambia lo que dice el cartel: la línea de encima, el
título —una línea por bloque, y la última sale en rojo—, el texto, el teléfono
y la foto de fondo. Si la foto se deja vacía, se usa la de la portada.

### Lo que hay que saber

**La clave no es una contraseña.** El repositorio es público, así que quien lo
mire la encontrará. Sirve para que nadie dé con la vista previa por
casualidad, no para esconderla de alguien que la busque.

**No lo dejes puesto días.** Mientras dura, la portada pide a Google que no la
indexe y el resto de direcciones devuelven «no encontrado». Para unas horas no
pasa nada y se recupera solo. Semanas sí harían daño en los buscadores.

**El correo sigue funcionando.** El mantenimiento solo afecta a la web.

---

## Fotos y PDF

Se suben arrastrándolos al campo correspondiente; van solos a su carpeta.

Para las fotos, un par de cosas antes de subirlas:

- **Tamaño**: con 1600 px de ancho sobra.
- **Peso**: por debajo de 300 KB. Si pesa mucho más, vuelve a guardarla como
  JPG con calidad 80.
- **Texto alternativo**: rellena siempre «Qué se ve en la foto». Es lo que lee
  quien no puede verla, y lo que entienden los buscadores.

---

## Si algo sale mal

Al guardar, la web se regenera entera. Si algún dato quedara mal —una foto que
no existe, una fecha con otro formato—, **la publicación falla y la web
publicada se queda como estaba**. No se rompe: sencillamente no se actualiza.

Para ver qué pasó: pestaña **Actions** del repositorio en GitHub, el último
«Publicar la web» en rojo. El error dice el archivo y el campo.

Y como cada cambio es un commit, **todo se puede deshacer**: nada se pierde.

---

## Montar el panel

Una sola vez, por quien sea dueño del repositorio:

1. Entrar en [app.pagescms.org](https://app.pagescms.org) e identificarse con
   la cuenta de GitHub dueña del repositorio.
2. Instalar la GitHub App de Pages CMS **solo en el repositorio `dominicos`**.
3. Abrir el repositorio en el panel. Al encontrar el archivo `.pages.yml` ya
   aparecen Portada, Noticias, Páginas y Ajustes.

### Dar acceso a otra persona

- **Con cuenta de GitHub**: dale acceso de escritura al repositorio en
  Settings → Collaborators.
- **Sin cuenta de GitHub**: invítala por correo desde el panel, en
  **Collaborators**. Podrá editar contenido y fotos, pero no la configuración
  ni invitar a nadie más.

Cada uno entra con lo suyo: **no se comparte una contraseña común, y nunca hay
que darle a nadie un token de GitHub**.

---

## Por debajo

Por si alguien lo hereda: el panel no es la web. El panel escribe archivos
JSON en el repositorio, y [`tools/generar.mjs`](tools/generar.mjs) los
convierte en HTML. Si Pages CMS desapareciera mañana, el contenido sigue en el
repositorio y la web se sigue generando igual.

Los detalles están en el [README](../README.md#panel-de-edición).
