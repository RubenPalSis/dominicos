<?php
/**
 * Portada · Marquesina de categorías.
 *
 * El track se imprime dos veces: la animación CSS desplaza el 50 % y así el
 * bucle es continuo.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$items = dominicos_opt_lines( 'ticker_items' );

if ( empty( $items ) ) {
	return;
}
?>
<div class="ticker" aria-hidden="true">
  <div class="ticker__track">
    <?php for ( $pass = 0; $pass < 2; $pass++ ) : ?>
      <?php foreach ( $items as $item ) : ?>
        <span><?php echo esc_html( $item ); ?></span><i>&#10005;</i>
      <?php endforeach; ?>
    <?php endfor; ?>
  </div>
</div>
