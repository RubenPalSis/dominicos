<?php
/**
 * Mensaje cuando una consulta no devuelve resultados.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="empty reveal">
  <p class="lead">
    <?php
    if ( is_search() ) {
        esc_html_e( 'No hemos encontrado nada con esa búsqueda. Prueba con otras palabras.', 'dominicos' );
    } else {
        esc_html_e( 'Todavía no hay nada publicado aquí.', 'dominicos' );
    }
    ?>
  </p>
  <?php get_search_form(); ?>
</div>
