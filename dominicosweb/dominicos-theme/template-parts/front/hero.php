<?php
/**
 * Portada · Hero.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$hero_image = dominicos_image_url( 'hero_image', 'hero.jpg' );
$cta1_url   = dominicos_opt( 'hero_cta1_url' );
$cta2_url   = dominicos_opt( 'hero_cta2_url' );
?>
<section class="hero" id="top">
  <div class="hero__media">
    <img src="<?php echo esc_url( $hero_image ); ?>"
         alt="<?php echo esc_attr( dominicos_opt( 'hero_image_alt' ) ); ?>"
         fetchpriority="high" decoding="async">
  </div>
  <div class="hero__in">
    <?php if ( dominicos_opt( 'hero_eyebrow' ) ) : ?>
      <p class="eyebrow"><span class="dot"></span><?php echo esc_html( dominicos_opt( 'hero_eyebrow' ) ); ?></p>
    <?php endif; ?>

    <h1 class="hero__h1">
      <span class="l1"><?php echo esc_html( dominicos_opt( 'hero_l1' ) ); ?></span>
      <span class="l2"><?php echo esc_html( dominicos_opt( 'hero_l2' ) ); ?></span>
      <span class="l3"><?php echo esc_html( dominicos_opt( 'hero_l3' ) ); ?></span>
    </h1>

    <?php if ( dominicos_opt( 'hero_text' ) ) : ?>
      <p class="hero__p"><?php echo esc_html( dominicos_opt( 'hero_text' ) ); ?></p>
    <?php endif; ?>

    <div class="hero__cta">
      <?php if ( dominicos_opt( 'hero_cta1_label' ) && $cta1_url ) : ?>
        <a class="btn btn--primary" href="<?php echo esc_url( $cta1_url ); ?>">
          <?php echo esc_html( dominicos_opt( 'hero_cta1_label' ) ); ?>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>
        </a>
      <?php endif; ?>

      <?php if ( dominicos_opt( 'hero_cta2_label' ) && $cta2_url ) : ?>
        <a class="btn btn--ghost" href="<?php echo esc_url( $cta2_url ); ?>"><?php echo esc_html( dominicos_opt( 'hero_cta2_label' ) ); ?></a>
      <?php endif; ?>
    </div>
  </div>
  <a class="hero__scroll" href="#club" aria-label="<?php esc_attr_e( 'Bajar', 'dominicos' ); ?>">
    <span></span>
  </a>
</section>
