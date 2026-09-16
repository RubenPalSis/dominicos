<?php
/**
 * Archivos de entradas: categorías, etiquetas, autor y fechas.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

$kicker = __( 'Noticias', 'dominicos' );

if ( is_category() ) {
	$kicker = __( 'Categoría', 'dominicos' );
} elseif ( is_tag() ) {
	$kicker = __( 'Etiqueta', 'dominicos' );
} elseif ( is_author() ) {
	$kicker = __( 'Autor', 'dominicos' );
} elseif ( is_date() ) {
	$kicker = __( 'Archivo', 'dominicos' );
}

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'kicker'   => $kicker,
		'title'    => wp_strip_all_tags( get_the_archive_title() ),
		'text'     => wp_strip_all_tags( get_the_archive_description() ),
		'back_url' => dominicos_noticias_url(),
		'back_txt' => __( 'Todas las noticias', 'dominicos' ),
	)
);
?>

<section class="section section--top">
  <div class="wrap">
    <?php if ( have_posts() ) : ?>
      <div class="ncards">
        <?php
        while ( have_posts() ) :
            the_post();
            get_template_part( 'template-parts/card', 'noticia' );
        endwhile;
        ?>
      </div>

      <?php dominicos_pagination(); ?>
    <?php else : ?>
      <?php get_template_part( 'template-parts/content', 'none' ); ?>
    <?php endif; ?>
  </div>
</section>

<?php
get_footer();
