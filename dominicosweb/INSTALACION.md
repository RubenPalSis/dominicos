# Instalar la web de Dominicos en WordPress

Guía para quien administre el WordPress del club. Son dos pasos, y el resto se
configura solo.

## Lo que vas a subir

En la carpeta `dist/`:

| Archivo | Qué es |
|---|---|
| `dominicos-core.zip` | Plugin: equipos, datos del club, formulario |
| `dominicos-theme.zip` | Tema: todo el diseño |

## 1 · Subir el plugin

**Plugins → Añadir nuevo → Subir plugin** → elige `dominicos-core.zip` →
*Instalar ahora* → **Activar plugin**.

## 2 · Subir el tema

**Apariencia → Temas → Añadir nuevo → Subir tema** → elige
`dominicos-theme.zip` → *Instalar ahora* → **Activar**.

## 3 · Ya está

Al volver al escritorio verás un aviso verde: *«La web de Dominicos ya está
montada»*. Sin tocar nada más, el tema ha dejado hecho esto:

- Creadas las páginas **Inicio** y **Noticias**.
- **Ajustes → Lectura** configurado: portada estática en Inicio, entradas en
  Noticias.
- **Ajustes → Enlaces permanentes** en *Nombre de la entrada*, que es lo que
  hace funcionar `/noticias/` y `/equipos/`.
- Menú **Principal** en la cabecera y menú **Pie** abajo, con los mismos
  enlaces que la web anterior y el botón rojo *Ven a jugar*.
- Escudo del club puesto como logotipo y como icono del navegador.
- Widgets por defecto de WordPress quitados del pie.
- *Hello world!* y *Página de ejemplo* a la papelera.
- Los **9 equipos** y las **3 noticias** de la web anterior, con sus fotos,
  sus textos y sus categorías.

Pulsa **Ver la web** en ese aviso y deberías ver la portada de siempre.

> Si instalas sobre un WordPress que ya tenía contenido, nada de esto pisa lo
> que hubiera: cada paso solo actúa si no encuentra algo puesto ya.

---

# Lo que sí tienes que hacer tú

Son cuatro cosas, y ninguna corre prisa.

## Poner tus datos de contacto

**Equipos → Datos del club.** Vienen rellenos con los de la web anterior
(email, WhatsApp, Instagram, X). Cámbialos si alguno ya no vale.

El formulario de contacto envía a ese email. Si prefieres que los mensajes
lleguen a otra dirección, usa el campo *Recibir formularios en*.

## Subir los PDF de inscripción

En esa misma pantalla, abajo. Los cinco títulos ya están escritos y en la web
aparecen marcados como **Próximamente**. Para activarlos:

1. Pulsa **Elegir archivo** en la fila que quieras.
2. Sube el PDF o elígelo de la biblioteca.
3. Guarda.

En cuanto una fila tiene archivo, deja de poner *Próximamente* y pasa a ser un
enlace de descarga.

## Completar las fichas de equipo

**Equipos** → entra en cada uno. Vienen con nombre, foto, categoría y la frase
de la tarjeta, que es lo que tenía la web anterior. Faltan los datos que antes
no existían en ningún sitio:

- Entrenador/a y segundo entrenador/a
- Delegado/a
- Competición
- Horarios de entrenamiento (una línea por día)
- Lugar de entrenamiento
- Información adicional

No están inventados a propósito: rellénalos tú con los reales.

## Revisar los textos de la portada

**Apariencia → Personalizar → Dominicos.** Está todo, sección por sección, con
los textos actuales. Lo que seguro querrás cambiar:

- *Portada · Hero* → **Línea superior**: pone «Temporada 2022–2023».
- *Portada · Inscripciones* → **Antetítulo**: lo mismo.
- *Portada · El club* → los cuatro datos numéricos.

---

# El día a día

## Publicar una noticia

**Entradas → Añadir nueva:**

1. Título y texto.
2. **Imagen destacada** en la barra lateral derecha.
3. **Categoría** y etiquetas.
4. El **extracto** es el resumen de las tarjetas. Si lo dejas vacío se saca de
   las primeras palabras.
5. **Publicar.**

Aparece sola la primera en la portada y en `/noticias/`, y las demás bajan. No
hay que editar ningún archivo nunca.

## Crear un equipo nuevo

**Equipos → Añadir nuevo:**

1. Nombre en el título.
2. Descripción en el editor.
3. **Foto del equipo** como imagen destacada.
4. **Categoría**: marca la concreta (*Infantil*, por ejemplo). El grupo
   (*Formación*) se deduce solo y es el que usan los botones de filtro.
5. **Etiqueta de la tarjeta**: la pastilla roja del listado. Si la dejas vacía
   se usa el nombre de la categoría.
6. El resto de campos en la caja **Datos del equipo**.
7. En **Atributos → Orden**, un número para colocarlo donde quieras.
8. **Publicar.**

## Crear más páginas

**Páginas → Añadir nueva**, y las añades al menú desde **Apariencia → Menús**.
Para que un elemento del menú salga como botón rojo, abre *Opciones de
pantalla* arriba a la derecha, marca **Clases CSS** y escribe `menu__cta`.

---

# Si algo va mal

**`/equipos/` o `/noticias/` dan 404.**
Ajustes → Enlaces permanentes → Guardar cambios, sin cambiar nada.

**No aparece la sección de equipos en la portada.**
El plugin no está activo, o no hay ningún equipo publicado.

**No llegan los correos del formulario.**
WordPress usa la función de correo del servidor, que muchos alojamientos
tienen desactivada. Se arregla con cualquier plugin de SMTP; es lo normal en
cualquier WordPress, no es cosa de este tema.

**Quiero volver a empezar con el contenido de ejemplo.**
Equipos → **Contenido inicial**. Desde ahí se vuelve a crear lo que falte, o se
borra de golpe todo lo que se creó automáticamente. Lo que hayas escrito tú no
se toca.

**Quiero cambiar un color o el tipo de letra.**
Están al principio de `assets/css/main.css`, en el bloque `:root`.

**¿Actualizar el tema pierde mis textos?**
No. Los textos están en la base de datos, no en los archivos. Sube el ZIP nuevo
desde Apariencia → Temas → Añadir nuevo → Subir tema y confirma que quieres
reemplazarlo.
