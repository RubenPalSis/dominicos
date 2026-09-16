<?php
/**
 * Portada · Pista: entrenamientos e instalaciones.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$image   = dominicos_image_url( 'pista_image', 'instalaciones.jpg' );
$btn_url = dominicos_opt( 'pista_btn_url' );
?>
<section class="section pista" id="pista">
  <div class="wrap grid-2">
    <div class="panel reveal">
      <?php if ( dominicos_opt( 'pista_kicker' ) ) : ?>
        <p class="kicker"><?php echo esc_html( dominicos_opt( 'pista_kicker' ) ); ?></p>
      <?php endif; ?>

      <h2 class="h2 h2--sm"><?php dominicos_the_title_opt( 'pista_title' ); ?></h2>

      <?php if ( dominicos_opt( 'pista_text' ) ) : ?>
        <p class="lead"><?php echo esc_html( dominicos_opt( 'pista_text' ) ); ?></p>
      <?php endif; ?>

      <?php if ( dominicos_opt( 'pista_note' ) || dominicos_opt( 'pista_pill' ) ) : ?>
        <p class="note">
          <?php if ( dominicos_opt( 'pista_pill' ) ) : ?>
            <span class="pill"><?php echo esc_html( dominicos_opt( 'pista_pill' ) ); ?></span>
          <?php endif; ?>
          <?php echo esc_html( dominicos_opt( 'pista_note' ) ); ?>
        </p>
      <?php endif; ?>

      <?php if ( dominicos_opt( 'pista_btn_label' ) && $btn_url ) : ?>
        <a class="btn btn--ghost" href="<?php echo esc_url( $btn_url ); ?>"><?php echo esc_html( dominicos_opt( 'pista_btn_label' ) ); ?></a>
      <?php endif; ?>
    </div>

    <figure class="shot reveal">
      <img loading="lazy" decoding="async" src="<?php echo esc_url( $image ); ?>"
           alt="<?php echo esc_attr( dominicos_opt( 'pista_cap_title' ) ); ?>">
      <?php if ( dominicos_opt( 'pista_cap_title' ) || dominicos_opt( 'pista_cap_text' ) ) : ?>
        <figcaption>
          <?php if ( dominicos_opt( 'pista_cap_title' ) ) : ?>
            <b><?php echo esc_html( dominicos_opt( 'pista_cap_title' ) ); ?></b>
          <?php endif; ?>
          <?php echo esc_html( dominicos_opt( 'pista_cap_text' ) ); ?>
        </figcaption>
      <?php endif; ?>
    </figure>
  </div>
</section>
