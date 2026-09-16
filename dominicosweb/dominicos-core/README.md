# Dominicos Core

Plugin con la funcionalidad propia del CB Dominicos Zaragoza. Todo lo que es
**dato** vive aquí, no en el tema, para que siga existiendo si algún día se
cambia el diseño.

## Qué aporta

| Módulo | Dónde se ve en el panel |
|---|---|
| CPT `equipo` (archivo en `/equipos/`) | Menú **Equipos** |
| Taxonomía jerárquica `categoria_equipo` | **Equipos → Categorías** |
| Campos de ficha de equipo | Caja *Datos del equipo* al editar |
| Datos de contacto y documentos de inscripción | **Equipos → Datos del club** |
| Formulario de contacto (`wp_mail`, nonce + honeypot) | — |
| Contenido de partida del club | **Equipos → Contenido inicial** |

Las noticias **no** están aquí: usan las `Entradas` nativas de WordPress.

## Contenido de partida

Al activarse, y una sola vez, el plugin crea los 9 equipos y las 3 noticias que
ya tenía la web del club, con sus mismas fotos (salen de `assets/images` del
tema) y sus mismos textos. Así la portada se ve igual desde el primer momento.

No se inventa nada: los campos que la web estática no tenía —entrenadores,
horarios, lugar— quedan vacíos para rellenarlos desde el panel.

Solo se siembra si no hay ningún equipo publicado todavía. Todo lo creado lleva
el meta `_dominicos_seed` y se borra de una vez desde **Equipos → Contenido
inicial**, sin tocar lo que haya escrito el club.

## Categorías de equipo

La taxonomía es jerárquica a propósito:

- Los términos **de primer nivel** (Base, Formación, Senior) son los botones de
  filtro del listado de equipos.
- Los **hijos** (Escuela, Benjamín, Alevín, Preinfantil, Infantil, Cadete,
  Junior, Senior Femenino, Senior Masculino) son la etiqueta que se pinta en
  cada tarjeta.

Se siembran al activar el plugin y solo si la taxonomía está vacía. A partir de
ahí se renombran, borran o amplían desde el panel sin tocar código.

## Funciones para el tema

```php
dominicos_get_club_options()          // todos los datos del club
dominicos_club( $key, $fallback )     // un dato suelto
dominicos_get_documentos()            // documentos de inscripción
dominicos_equipo_meta( $key, $id )    // campo de un equipo
dominicos_equipo_categoria( $id )     // WP_Term hoja (Escuela, Benjamín…)
dominicos_equipo_grupo( $id )         // WP_Term raíz (filtro)
dominicos_equipo_horarios( $id )      // horarios como array de líneas
dominicos_get_grupos()                // términos de primer nivel
```

El tema las llama siempre envueltas en `function_exists()`, así que sigue
funcionando si el plugin se desactiva.

## Desinstalación

Desactivar el plugin **no borra nada**: los equipos, las categorías y los
ajustes se conservan. Para quitar el contenido de prueba usa el botón de
**Equipos → Datos de prueba**.
