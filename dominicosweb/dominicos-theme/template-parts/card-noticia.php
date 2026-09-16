<?php
/**
 * Tarjeta de noticia para el listado y el archivo.
 *
 * Reutiliza los tokens del diseño del club: mismo radio, mismo borde, mismo
 * hover de elevación que las tarjetas de equipo.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$cat = dominicos_post_category();
?>
<article <?php post_class( 'ncard reveal' ); ?>>
  <a class="ncard__link" href="<?php the_permalink(); ?>">
    <span class="ncard__media">
      <?php if ( has_post_thumbnail() ) : ?>
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
      <?php else : ?>
        <img loading="lazy" decoding="async"
             src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/logo.jpg' ); ?>" alt="">
      <?php endif; ?>

      <?php if ( $cat ) : ?>
        <span class="tag ncard__tag"><?php echo esc_html( $cat->name ); ?></span>
      <?php endif; ?>
    </span>

    <span class="ncard__body">
      <span class="news__d">
        <time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
      </span>
      <h2 class="ncard__h"><?php the_title(); ?></h2>
      <span class="ncard__p"><?php echo esc_html( dominicos_excerpt( 22 ) ); ?></span>
      <span class="news__go"><?php esc_html_e( 'Leer', 'dominicos' ); ?></span>
    </span>
  </a>
</article>
