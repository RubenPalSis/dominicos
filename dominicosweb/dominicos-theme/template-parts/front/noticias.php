<?php
/**
 * Portada · Noticias.
 *
 * Mismo diseño de filas que la web original, pero alimentado por las Entradas
 * de WordPress: al publicar una noticia aparece aquí arriba automáticamente.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$count = (int) dominicos_opt( 'noticias_count' );
$count = $count > 0 ? $count : 3;

$noticias = new WP_Query(
	array(
		'post_type'           => 'post',
		'post_status'         => 'publish',
		'posts_per_page'      => $count,
		'orderby'             => 'date',
		'order'               => 'DESC',
		'ignore_sticky_posts' => false,
		'no_found_rows'       => true,
	)
);

if ( ! $noticias->have_posts() ) {
	return;
}

$with_thumb = (bool) dominicos_opt( 'noticias_thumb' );
?>
<section class="section noticias" id="noticias">
  <div class="wrap">
    <header class="sec-head reveal">
      <div>
        <?php if ( dominicos_opt( 'noticias_kicker' ) ) : ?>
          <p class="kicker"><?php echo esc_html( dominicos_opt( 'noticias_kicker' ) ); ?></p>
        <?php endif; ?>
        <h2 class="h2"><?php dominicos_the_title_opt( 'noticias_title' ); ?></h2>
      </div>

      <?php if ( dominicos_opt( 'noticias_link' ) ) : ?>
        <a class="btn btn--ghost" href="<?php echo esc_url( dominicos_noticias_url() ); ?>">
          <?php esc_html_e( 'Todas las noticias', 'dominicos' ); ?>
        </a>
      <?php endif; ?>
    </header>

    <div class="news<?php echo $with_thumb ? ' news--thumbs' : ''; ?>">
      <?php
      while ( $noticias->have_posts() ) :
          $noticias->the_post();
          ?>
          <a class="news__it reveal" href="<?php the_permalink(); ?>">
            <?php if ( $with_thumb && has_post_thumbnail() ) : ?>
              <span class="news__img">
                <?php
                the_post_thumbnail(
                    'dominicos-news',
                    array(
                        'loading'  => 'lazy',
                        'decoding' => 'async',
                        'alt'      => '',
                    )
                );
                ?>
              </span>
            <?php endif; ?>

            <?php dominicos_post_meta( false, false ); ?>

            <h3><?php the_title(); ?></h3>
            <p><?php echo esc_html( dominicos_excerpt( 20 ) ); ?></p>
            <span class="news__go"><?php esc_html_e( 'Leer', 'dominicos' ); ?></span>
          </a>
          <?php
      endwhile;
      wp_reset_postdata();
      ?>
    </div>
  </div>
</section>
