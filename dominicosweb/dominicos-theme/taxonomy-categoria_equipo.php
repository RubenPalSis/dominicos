<?php
/**
 * Equipos de una categoría, en /equipos/categoria/slug/.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

$term = get_queried_object();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'kicker'   => __( 'Categoría', 'dominicos' ),
		'title'    => $term instanceof WP_Term ? $term->name : __( 'Equipos', 'dominicos' ),
		'text'     => $term instanceof WP_Term ? wp_strip_all_tags( $term->description ) : '',
		'back_url' => get_post_type_archive_link( 'equipo' ),
		'back_txt' => __( 'Todos los equipos', 'dominicos' ),
	)
);
?>

<section class="section equipos section--top">
  <div class="wrap">
    <?php if ( have_posts() ) : ?>
      <div class="cards">
        <?php
        while ( have_posts() ) :
            the_post();
            get_template_part( 'template-parts/card', 'equipo' );
        endwhile;
        ?>
      </div>
    <?php else : ?>
      <?php get_template_part( 'template-parts/content', 'none' ); ?>
    <?php endif; ?>
  </div>
</section>

<?php
get_footer();
