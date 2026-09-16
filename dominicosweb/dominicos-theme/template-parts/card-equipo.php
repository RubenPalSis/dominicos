<?php
/**
 * Tarjeta de equipo. Mismo marcado que las tarjetas de la web original.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$grupo   = dominicos_grupo_slug();
$tag     = dominicos_equipo_tag();
$resumen = function_exists( 'dominicos_equipo_meta' ) ? dominicos_equipo_meta( 'resumen' ) : '';

if ( '' === $resumen ) {
	$resumen = has_excerpt() ? get_the_excerpt() : '';
}
?>
<article class="card reveal"<?php echo $grupo ? ' data-cat="' . esc_attr( $grupo ) . '"' : ''; ?>>
  <a class="card__link" href="<?php the_permalink(); ?>">
    <?php if ( has_post_thumbnail() ) : ?>
      <?php
      the_post_thumbnail(
          'dominicos-card',
          array(
              'loading'  => 'lazy',
              'decoding' => 'async',
              'alt'      => the_title_attribute( array( 'echo' => false ) ),
          )
      );
      ?>
    <?php else : ?>
      <img loading="lazy" decoding="async"
           src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/logo.jpg' ); ?>"
           alt="<?php the_title_attribute(); ?>">
    <?php endif; ?>

    <div class="card__body">
      <?php if ( $tag ) : ?>
        <span class="tag"><?php echo esc_html( $tag ); ?></span>
      <?php endif; ?>
      <h3><?php the_title(); ?></h3>
      <?php if ( $resumen ) : ?>
        <p><?php echo esc_html( wp_trim_words( $resumen, 14, '…' ) ); ?></p>
      <?php endif; ?>
    </div>
  </a>
</article>
