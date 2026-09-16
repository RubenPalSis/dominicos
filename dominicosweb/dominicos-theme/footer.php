<?php
/**
 * Pie del sitio.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;
?>
</main>

<footer class="foot">
  <div class="wrap foot__in">
    <div class="foot__brand">
      <?php if ( has_custom_logo() ) : ?>
        <?php
        echo wp_get_attachment_image(
            (int) get_theme_mod( 'custom_logo' ),
            array( 52, 52 ),
            false,
            array( 'alt' => '', 'width' => 52, 'height' => 52 )
        );
        ?>
      <?php else : ?>
        <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/logo.jpg' ); ?>" alt="" width="52" height="52">
      <?php endif; ?>
      <p>
        <b><?php echo esc_html( dominicos_opt( 'foot_name' ) ); ?></b>
        <?php if ( dominicos_opt( 'foot_place' ) ) : ?>
          <br><?php echo esc_html( dominicos_opt( 'foot_place' ) ); ?>
        <?php endif; ?>
      </p>
    </div>

    <nav class="foot__nav" aria-label="<?php esc_attr_e( 'Pie', 'dominicos' ); ?>">
      <?php
      wp_nav_menu(
          array(
              'theme_location' => 'footer',
              'container'      => false,
              'items_wrap'     => '%3$s',
              'depth'          => 1,
              'walker'         => new Dominicos_Nav_Walker(),
              'fallback_cb'    => 'dominicos_default_footer_menu',
          )
      );
      ?>
    </nav>

    <?php if ( is_active_sidebar( 'footer' ) ) : ?>
      <div class="foot__widgets"><?php dynamic_sidebar( 'footer' ); ?></div>
    <?php endif; ?>

    <p class="foot__legal">
      &copy; <?php echo esc_html( wp_date( 'Y' ) ); ?> <?php echo esc_html( dominicos_opt( 'foot_legal' ) ); ?>
    </p>
  </div>
</footer>

<!-- LIGHTBOX -->
<div class="lb" id="lb" hidden>
  <button class="lb__x" id="lbX" type="button" aria-label="<?php esc_attr_e( 'Cerrar', 'dominicos' ); ?>">&#10005;</button>
  <img id="lbImg" src="" alt="">
</div>

<?php wp_footer(); ?>
</body>
</html>
