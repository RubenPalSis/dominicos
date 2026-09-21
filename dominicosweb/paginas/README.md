# Páginas sueltas

Cada archivo `.json` de esta carpeta es una página de la web. El nombre del
archivo es su dirección:

    paginas/historia-del-club.json
    →  https://baloncestodominicos.es/historia-del-club.html

Por eso el nombre va en minúsculas, con guiones y sin acentos ni eñes.

Lo normal es crearlas desde el panel: [app.pagescms.org](https://app.pagescms.org)
→ **Páginas → New entry**. Ahí se rellena el título, el resumen y las
secciones, y se reordenan arrastrando.

Marcando **«Enseñar en el menú»**, la página aparece sola en el menú de todas
las páginas del sitio. Si no se marca, la página existe igual pero hay que
enlazarla a mano desde donde interese.

Las páginas se componen con las mismas secciones que la portada. Lo que hay
disponible, y qué campos pide cada una, está en
[`.pages.yml`](../../.pages.yml) (el panel) y en
[`tools/lib/secciones.mjs`](../tools/lib/secciones.mjs) (quien las pinta).

Este README no se publica: el workflow lo descarta al empaquetar.
