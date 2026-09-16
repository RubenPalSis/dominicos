<?php
/**
 * Formulario de búsqueda con el estilo del sitio.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$dominicos_search_id = 'search-' . wp_unique_id();
?>
<form class="searchform" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
  <label class="screen-reader-text" for="<?php echo esc_attr( $dominicos_search_id ); ?>"><?php esc_html_e( 'Buscar', 'dominicos' ); ?></label>
  <input type="search" id="<?php echo esc_attr( $dominicos_search_id ); ?>" name="s"
         value="<?php echo esc_attr( get_search_query() ); ?>"
         placeholder="<?php esc_attr_e( 'Buscar en la web…', 'dominicos' ); ?>">
  <button class="btn btn--primary" type="submit"><?php esc_html_e( 'Buscar', 'dominicos' ); ?></button>
</form>
