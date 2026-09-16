<?php
/**
 * Resultados de búsqueda.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'kicker' => __( 'Búsqueda', 'dominicos' ),
		'title'  => sprintf(
			/* translators: %s: términos buscados. */
			__( 'Resultados para «%s»', 'dominicos' ),
			get_search_query()
		),
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
