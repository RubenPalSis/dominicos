<?php
/**
 * Portada · Contacto.
 *
 * El formulario lo procesa el plugin dominicos-core por admin-post.php. Si el
 * plugin no está activo, se degrada a un enlace mailto: como en la web
 * original.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$links      = dominicos_contact_links();
$categorias = dominicos_opt_lines( 'contacto_cats' );
$has_plugin = class_exists( 'Dominicos_Contact' );

$feedback = null;

if ( $has_plugin && isset( $_GET['contacto'] ) && is_string( $_GET['contacto'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- solo pinta un aviso.
	$feedback = Dominicos_Contact::feedback( sanitize_key( wp_unslash( $_GET['contacto'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}
?>
<section class="section contacto" id="contacto">
  <div class="wrap grid-2">
    <div class="reveal">
      <?php if ( dominicos_opt( 'contacto_kicker' ) ) : ?>
        <p class="kicker"><?php echo esc_html( dominicos_opt( 'contacto_kicker' ) ); ?></p>
      <?php endif; ?>

      <h2 class="h2"><?php dominicos_the_title_opt( 'contacto_title' ); ?></h2>

      <?php if ( dominicos_opt( 'contacto_text' ) ) : ?>
        <p class="lead"><?php echo esc_html( dominicos_opt( 'contacto_text' ) ); ?></p>
      <?php endif; ?>

      <?php if ( $links ) : ?>
        <ul class="contact">
          <?php foreach ( $links as $link ) : ?>
            <li>
              <span><?php echo esc_html( $link['label'] ); ?></span>
              <a href="<?php echo esc_url( $link['url'] ); ?>"<?php echo $link['external'] ? ' target="_blank" rel="noopener"' : ''; ?>>
                <?php echo esc_html( $link['text'] ); ?>
              </a>
            </li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>
    </div>

    <?php if ( dominicos_opt( 'contacto_form' ) ) : ?>
      <?php if ( $has_plugin ) : ?>
        <form class="form reveal" id="form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
          <input type="hidden" name="action" value="<?php echo esc_attr( Dominicos_Contact::ACTION ); ?>">
          <input type="hidden" name="_dominicos_redirect" value="<?php echo esc_url( is_page() ? get_permalink() : home_url( '/' ) ); ?>">
          <?php wp_nonce_field( Dominicos_Contact::ACTION, Dominicos_Contact::NONCE ); ?>

          <label><?php esc_html_e( 'Nombre', 'dominicos' ); ?>
            <input type="text" name="nombre" required placeholder="<?php esc_attr_e( 'Tu nombre', 'dominicos' ); ?>">
          </label>
          <label><?php esc_html_e( 'Email', 'dominicos' ); ?>
            <input type="email" name="email" required placeholder="tu@email.com">
          </label>
          <label><?php esc_html_e( 'Categoría', 'dominicos' ); ?>
            <select name="categoria">
              <?php foreach ( $categorias as $categoria ) : ?>
                <option value="<?php echo esc_attr( $categoria ); ?>"><?php echo esc_html( $categoria ); ?></option>
              <?php endforeach; ?>
            </select>
          </label>
          <label><?php esc_html_e( 'Mensaje', 'dominicos' ); ?>
            <textarea name="mensaje" rows="4" required placeholder="<?php esc_attr_e( 'Cuéntanos…', 'dominicos' ); ?>"></textarea>
          </label>

          <?php /* Trampa para bots: invisible y sin foco para quien navega. */ ?>
          <p class="hp" aria-hidden="true">
            <label>
              <?php esc_html_e( 'No rellenes este campo', 'dominicos' ); ?>
              <input type="text" name="dominicos_web" tabindex="-1" autocomplete="off">
            </label>
          </p>

          <button class="btn btn--primary" type="submit"><?php esc_html_e( 'Enviar', 'dominicos' ); ?></button>

          <p class="form__msg<?php echo ( $feedback && $feedback['ok'] ) ? ' ok' : ''; ?>" id="formMsg" role="status">
            <?php echo $feedback ? esc_html( $feedback['message'] ) : ''; ?>
          </p>
        </form>
      <?php else : ?>
        <div class="form reveal">
          <p class="lead"><?php esc_html_e( 'Escríbenos por correo y te contestamos en cuanto podamos.', 'dominicos' ); ?></p>
          <a class="btn btn--primary" href="<?php echo esc_url( 'mailto:' . dominicos_email() ); ?>"><?php esc_html_e( 'Enviar un correo', 'dominicos' ); ?></a>
        </div>
      <?php endif; ?>
    <?php endif; ?>
  </div>
</section>
