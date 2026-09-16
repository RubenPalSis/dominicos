<?php
/**
 * Listado de equipos, en /equipos/.
 *
 * Mismo diseño de tarjetas y de filtros que la portada.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

$grupos = dominicos_grupos();

get_template_part(
	'template-parts/page-hero',
	null,
	array(
		'kicker' => __( 'El club en la pista', 'dominicos' ),
		'title'  => post_type_archive_title( '', false ),
		'text'   => wp_strip_all_tags( get_the_post_type_description() ),
	)
);
?>

<section class="section equipos section--top" id="equipos">
  <div class="wrap">
    <?php if ( have_posts() ) : ?>

      <?php if ( count( $grupos ) > 1 ) : ?>
        <div class="filters filters--solo reveal" role="tablist" aria-label="<?php esc_attr_e( 'Filtrar equipos', 'dominicos' ); ?>">
          <button class="chip is-on" data-filter="all" role="tab" aria-selected="true" type="button"><?php esc_html_e( 'Todos', 'dominicos' ); ?></button>
          <?php foreach ( $grupos as $grupo ) : ?>
            <button class="chip" data-filter="<?php echo esc_attr( $grupo->slug ); ?>" role="tab" aria-selected="false" type="button">
              <?php echo esc_html( $grupo->name ); ?>
            </button>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

      <div class="cards" id="cards">
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
