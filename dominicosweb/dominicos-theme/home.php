<?php
/**
 * Listado de noticias: la página asignada a las Entradas, normalmente
 * /noticias/. Ordena de la más reciente a la más antigua.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

$page_id = (int) get_option( 'page_for_posts' );
$title   = $page_id ? get_the_title( $page_id ) : __( 'Noticias', 'dominicos' );
$intro   = '';

if ( $page_id ) {
	$page = get_post( $page_id );

	if ( $page && $page->post_excerpt ) {
		$intro = $page->post_excerpt;
	}
}

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'kicker' => __( 'Actualidad del club', 'dominicos' ),
		'title'  => $title,
		'text'   => $intro,
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
