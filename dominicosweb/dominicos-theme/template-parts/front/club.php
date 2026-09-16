<?php
/**
 * Portada · El club.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$ticks = dominicos_opt_lines( 'club_ticks' );
?>
<section class="section club" id="club">
  <div class="wrap grid-2">
    <div class="reveal">
      <?php if ( dominicos_opt( 'club_kicker' ) ) : ?>
        <p class="kicker"><?php echo esc_html( dominicos_opt( 'club_kicker' ) ); ?></p>
      <?php endif; ?>

      <h2 class="h2"><?php dominicos_the_title_opt( 'club_title' ); ?></h2>

      <?php if ( dominicos_opt( 'club_text_1' ) ) : ?>
        <p class="lead"><?php echo esc_html( dominicos_opt( 'club_text_1' ) ); ?></p>
      <?php endif; ?>

      <?php if ( dominicos_opt( 'club_text_2' ) ) : ?>
        <p class="lead"><?php echo esc_html( dominicos_opt( 'club_text_2' ) ); ?></p>
      <?php endif; ?>

      <?php if ( $ticks ) : ?>
        <ul class="ticks">
          <?php foreach ( $ticks as $tick ) : ?>
            <li><?php echo esc_html( $tick ); ?></li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>
    </div>

    <div class="stats reveal">
      <?php
      for ( $i = 1; $i <= 4; $i++ ) :
          $value = dominicos_opt( 'stat_' . $i . '_value' );
          $label = dominicos_opt( 'stat_' . $i . '_label' );

          if ( '' === trim( (string) $value ) ) {
              continue;
          }
          ?>
          <div class="stat">
            <b class="num"<?php echo dominicos_stat_attrs( $value ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- atributos ya escapados en la función. ?>>0</b>
            <span><?php echo esc_html( $label ); ?></span>
          </div>
      <?php endfor; ?>
    </div>
  </div>
</section>
