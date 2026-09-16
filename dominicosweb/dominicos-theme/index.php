<?php
/**
 * Plantilla de respaldo. WordPress la usa cuando no encuentra otra más
 * específica.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'title' => have_posts() ? get_the_archive_title() : get_bloginfo( 'name' ),
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
