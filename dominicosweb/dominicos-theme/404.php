<?php
/**
 * Página no encontrada.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'kicker' => __( 'Error 404', 'dominicos' ),
		'title'  => __( 'Esta canasta no cuenta', 'dominicos' ),
		'text'   => __( 'La página que buscas no existe o ha cambiado de sitio.', 'dominicos' ),
	)
);
?>

<section class="section section--top">
  <div class="wrap">
    <div class="empty reveal">
      <p class="lead"><?php esc_html_e( 'Prueba a buscar, o vuelve a la portada.', 'dominicos' ); ?></p>
      <?php get_search_form(); ?>

      <p class="e404__links">
        <a class="btn btn--primary" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Ir a la portada', 'dominicos' ); ?></a>
        <a class="btn btn--ghost" href="<?php echo esc_url( dominicos_noticias_url() ); ?>"><?php esc_html_e( 'Ver noticias', 'dominicos' ); ?></a>
      </p>
    </div>
  </div>
</section>

<?php
get_footer();
