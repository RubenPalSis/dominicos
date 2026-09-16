<?php
/**
 * Portada · Inscripciones.
 *
 * Los documentos salen de Equipos → Datos del club, así que se cambian sin
 * tocar código.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$docs    = dominicos_documentos();
$btn_url = dominicos_opt( 'inscrip_btn_url' );

if ( '' === $btn_url ) {
	$btn_url = 'mailto:' . dominicos_email() . '?subject=' . rawurlencode( __( 'Inscripción temporada', 'dominicos' ) );
}
?>
<section class="section inscrip" id="inscripciones">
  <div class="wrap">
    <div class="cta reveal<?php echo $docs ? '' : ' cta--solo'; ?>">
      <div class="cta__l">
        <?php if ( dominicos_opt( 'inscrip_kicker' ) ) : ?>
          <p class="kicker kicker--on"><?php echo esc_html( dominicos_opt( 'inscrip_kicker' ) ); ?></p>
        <?php endif; ?>

        <h2 class="h2 h2--xl"><?php dominicos_the_title_opt( 'inscrip_title' ); ?></h2>

        <?php if ( dominicos_opt( 'inscrip_text' ) ) : ?>
          <p class="lead"><?php echo esc_html( dominicos_opt( 'inscrip_text' ) ); ?></p>
        <?php endif; ?>

        <?php if ( dominicos_opt( 'inscrip_btn_label' ) ) : ?>
          <a class="btn btn--primary" href="<?php echo esc_url( $btn_url ); ?>">
            <?php echo esc_html( dominicos_opt( 'inscrip_btn_label' ) ); ?>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>
          </a>
        <?php endif; ?>
      </div>

      <?php if ( $docs ) : ?>
        <ul class="docs">
          <?php foreach ( $docs as $doc ) : ?>
            <li>
              <?php if ( ! empty( $doc['url'] ) ) : ?>
                <a href="<?php echo esc_url( $doc['url'] ); ?>" download>
                  <span><?php echo esc_html( $doc['title'] ); ?></span>
                  <em><?php echo esc_html( $doc['type'] ); ?></em>
                </a>
              <?php else : ?>
                <?php /* Todavía sin archivo: se ve, pero no enlaza a ninguna parte. */ ?>
                <span class="docs__soon">
                  <span><?php echo esc_html( $doc['title'] ); ?></span>
                  <em><?php esc_html_e( 'Próximamente', 'dominicos' ); ?></em>
                </span>
              <?php endif; ?>
            </li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>
    </div>
  </div>
</section>
