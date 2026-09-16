<?php
/**
 * Cabecera de las páginas interiores.
 *
 * Mismo lenguaje visual que la portada — antetítulo rojo, titular en Archivo
 * Black — pero en formato compacto, para que la cabecera fija no tape nada.
 *
 * @package Dominicos
 *
 * @var array $args {
 *     @type string $kicker   Antetítulo.
 *     @type string $title    Titular.
 *     @type string $text     Texto de apoyo.
 *     @type string $image    URL de imagen de fondo.
 *     @type string $back_url Enlace de vuelta.
 *     @type string $back_txt Texto del enlace de vuelta.
 * }
 */

defined( 'ABSPATH' ) || exit;

$kicker   = isset( $args['kicker'] ) ? $args['kicker'] : '';
$title    = isset( $args['title'] ) ? $args['title'] : '';
$text     = isset( $args['text'] ) ? $args['text'] : '';
$image    = isset( $args['image'] ) ? $args['image'] : '';
$back_url = isset( $args['back_url'] ) ? $args['back_url'] : '';
$back_txt = isset( $args['back_txt'] ) ? $args['back_txt'] : '';
?>
<section class="phero<?php echo $image ? ' phero--img' : ''; ?>">
  <?php if ( $image ) : ?>
    <div class="phero__media">
      <img src="<?php echo esc_url( $image ); ?>" alt="" fetchpriority="high" decoding="async">
    </div>
  <?php endif; ?>

  <div class="wrap phero__in">
    <?php if ( $back_url && $back_txt ) : ?>
      <a class="phero__back" href="<?php echo esc_url( $back_url ); ?>">&larr; <?php echo esc_html( $back_txt ); ?></a>
    <?php endif; ?>

    <?php if ( $kicker ) : ?>
      <p class="kicker"><?php echo esc_html( $kicker ); ?></p>
    <?php endif; ?>

    <h1 class="h2"><?php echo esc_html( $title ); ?></h1>

    <?php if ( $text ) : ?>
      <p class="lead"><?php echo esc_html( $text ); ?></p>
    <?php endif; ?>
  </div>
</section>
