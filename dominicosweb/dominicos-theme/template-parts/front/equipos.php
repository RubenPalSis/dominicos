<?php
/**
 * Portada · Equipos.
 *
 * Las tarjetas salen del tipo de contenido Equipos. Los chips de filtro son
 * los términos de primer nivel de la taxonomía de categorías.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$count = (int) dominicos_opt( 'equipos_count' );

$equipos = new WP_Query(
	array(
		'post_type'           => 'equipo',
		'post_status'         => 'publish',
		'posts_per_page'      => 0 === $count ? 12 : $count,
		// Primero el orden manual de cada equipo y, a igualdad, el de creación:
		// así la escuela queda arriba y el senior abajo, como en la web original.
		'orderby'             => array(
			'menu_order' => 'ASC',
			'date'       => 'ASC',
		),
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	)
);

if ( ! $equipos->have_posts() ) {
	return;
}

$grupos = dominicos_grupos();
?>
<section class="section equipos" id="equipos">
  <div class="wrap">
    <header class="sec-head reveal">
      <div>
        <?php if ( dominicos_opt( 'equipos_kicker' ) ) : ?>
          <p class="kicker"><?php echo esc_html( dominicos_opt( 'equipos_kicker' ) ); ?></p>
        <?php endif; ?>
        <h2 class="h2"><?php dominicos_the_title_opt( 'equipos_title' ); ?></h2>
      </div>

      <?php if ( count( $grupos ) > 1 ) : ?>
        <div class="filters" role="tablist" aria-label="<?php esc_attr_e( 'Filtrar equipos', 'dominicos' ); ?>">
          <button class="chip is-on" data-filter="all" role="tab" aria-selected="true" type="button"><?php esc_html_e( 'Todos', 'dominicos' ); ?></button>
          <?php foreach ( $grupos as $grupo ) : ?>
            <button class="chip" data-filter="<?php echo esc_attr( $grupo->slug ); ?>" role="tab" aria-selected="false" type="button">
              <?php echo esc_html( $grupo->name ); ?>
            </button>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </header>

    <div class="cards" id="cards">
      <?php
      while ( $equipos->have_posts() ) :
          $equipos->the_post();
          get_template_part( 'template-parts/card', 'equipo' );
      endwhile;
      wp_reset_postdata();
      ?>
    </div>

    <?php if ( dominicos_opt( 'equipos_link' ) && get_post_type_archive_link( 'equipo' ) ) : ?>
      <p class="sec-more reveal">
        <a class="btn btn--ghost" href="<?php echo esc_url( get_post_type_archive_link( 'equipo' ) ); ?>">
          <?php esc_html_e( 'Ver todos los equipos', 'dominicos' ); ?>
        </a>
      </p>
    <?php endif; ?>
  </div>
</section>
