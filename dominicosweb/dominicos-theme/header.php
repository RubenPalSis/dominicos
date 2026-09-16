<?php
/**
 * Cabecera del sitio.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

$dominicos_home    = trailingslashit( home_url( '/' ) );
$dominicos_brand   = dominicos_opt( 'brand_name' );
$dominicos_brand   = '' !== $dominicos_brand ? $dominicos_brand : get_bloginfo( 'name' );
$dominicos_tagline = dominicos_opt( 'brand_tagline' );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> data-theme="dark">
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div class="progress" id="progress" aria-hidden="true"></div>

<a class="skip" href="#main"><?php esc_html_e( 'Saltar al contenido', 'dominicos' ); ?></a>

<header class="nav" id="nav">
  <div class="nav__in">
    <a class="brand" href="<?php echo esc_url( $dominicos_home ); ?>">
      <?php if ( has_custom_logo() ) : ?>
        <?php
        $dominicos_logo_id = (int) get_theme_mod( 'custom_logo' );
        echo wp_get_attachment_image(
            $dominicos_logo_id,
            array( 44, 44 ),
            false,
            array(
                'alt'    => esc_attr( sprintf( __( 'Escudo de %s', 'dominicos' ), get_bloginfo( 'name' ) ) ),
                'width'  => 44,
                'height' => 44,
            )
        );
        ?>
      <?php else : ?>
        <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/logo.jpg' ); ?>"
             alt="<?php echo esc_attr( sprintf( __( 'Escudo de %s', 'dominicos' ), get_bloginfo( 'name' ) ) ); ?>"
             width="44" height="44">
      <?php endif; ?>
      <span class="brand__txt">
        <b><?php echo esc_html( $dominicos_brand ); ?></b>
        <?php if ( $dominicos_tagline ) : ?>
          <small><?php echo esc_html( $dominicos_tagline ); ?></small>
        <?php endif; ?>
      </span>
    </a>

    <nav class="menu" id="menu" aria-label="<?php esc_attr_e( 'Principal', 'dominicos' ); ?>">
      <?php
      wp_nav_menu(
          array(
              'theme_location' => 'primary',
              'container'      => false,
              'items_wrap'     => '%3$s',
              'depth'          => 1,
              'walker'         => new Dominicos_Nav_Walker(),
              'fallback_cb'    => 'dominicos_default_menu',
          )
      );
      ?>
    </nav>

    <div class="nav__tools">
      <?php if ( dominicos_opt( 'theme_toggle' ) ) : ?>
      <button class="icon-btn" id="theme" type="button" aria-label="<?php esc_attr_e( 'Cambiar tema', 'dominicos' ); ?>" title="<?php esc_attr_e( 'Cambiar tema', 'dominicos' ); ?>">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-sun" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41"/><circle class="i-sun" cx="12" cy="12" r="4"/><path class="i-moon" d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>
      </button>
      <?php endif; ?>
      <button class="burger" id="burger" type="button" aria-label="<?php esc_attr_e( 'Menú', 'dominicos' ); ?>" aria-expanded="false" aria-controls="menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<main id="main">
