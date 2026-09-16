<?php
/**
 * Walker del menú principal.
 *
 * El CSS de la web original ataca directamente `.menu a`, sin listas. Este
 * walker reproduce exactamente ese marcado: una serie de <a> sueltos dentro
 * del <nav class="menu">, para no tener que tocar ni una línea de CSS.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

class Dominicos_Nav_Walker extends Walker_Nav_Menu {

	/**
	 * No abrimos sublistas: el menú es de un solo nivel.
	 *
	 * @param string   $output Marcado acumulado.
	 * @param int      $depth  Profundidad.
	 * @param stdClass $args   Argumentos.
	 */
	public function start_lvl( &$output, $depth = 0, $args = null ) {}

	/**
	 * @param string   $output Marcado acumulado.
	 * @param int      $depth  Profundidad.
	 * @param stdClass $args   Argumentos.
	 */
	public function end_lvl( &$output, $depth = 0, $args = null ) {}

	/**
	 * @param string   $output Marcado acumulado.
	 * @param WP_Post  $item   Elemento del menú.
	 * @param int      $depth  Profundidad.
	 * @param stdClass $args   Argumentos.
	 * @param int      $id     ID del elemento.
	 */
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		if ( $depth > 0 ) {
			return;
		}

		$classes = empty( $item->classes ) ? array() : (array) $item->classes;

		// Los enlaces a una sección de la portada (…/#club) los marca WordPress
		// como actuales todos a la vez, porque comparten URL base. De esos se
		// encarga el JS según la sección visible, así que aquí los dejamos.
		$is_anchor = ( false !== strpos( (string) $item->url, '#' ) );

		if ( ! $is_anchor && ( in_array( 'current-menu-item', $classes, true ) || in_array( 'current_page_item', $classes, true ) ) ) {
			$classes[] = 'is-active';
		}

		// Solo dejamos pasar las clases de presentación que entiende el diseño.
		$allowed = array( 'menu__cta', 'is-active' );
		$classes = array_values( array_intersect( array_unique( $classes ), $allowed ) );

		$atts = array(
			'href'   => ! empty( $item->url ) ? $item->url : '',
			'title'  => ! empty( $item->attr_title ) ? $item->attr_title : '',
			'target' => ! empty( $item->target ) ? $item->target : '',
			'rel'    => ! empty( $item->xfn ) ? $item->xfn : '',
			'class'  => implode( ' ', $classes ),
		);

		if ( '_blank' === $atts['target'] && empty( $atts['rel'] ) ) {
			$atts['rel'] = 'noopener';
		}

		if ( in_array( 'is-active', $classes, true ) ) {
			$atts['aria-current'] = 'page';
		}

		$markup = '';

		foreach ( $atts as $attr => $value ) {
			if ( '' === $value || false === $value ) {
				continue;
			}

			$value   = ( 'href' === $attr ) ? esc_url( $value ) : esc_attr( $value );
			$markup .= sprintf( ' %s="%s"', esc_attr( $attr ), $value );
		}

		$title = apply_filters( 'the_title', $item->title, $item->ID );

		$output .= '<a' . $markup . '>' . esc_html( $title ) . '</a>';
	}

	/**
	 * Sin <li> que cerrar.
	 *
	 * @param string   $output Marcado acumulado.
	 * @param WP_Post  $item   Elemento.
	 * @param int      $depth  Profundidad.
	 * @param stdClass $args   Argumentos.
	 */
	public function end_el( &$output, $item, $depth = 0, $args = null ) {}
}

/**
 * Menú de respaldo cuando todavía no se ha asignado ninguno en Apariencia →
 * Menús. Reproduce el menú de la web original apuntando a las anclas de la
 * portada, para que el sitio nunca se quede sin navegación.
 */
function dominicos_default_menu() {
	$home  = trailingslashit( home_url( '/' ) );
	$items = array(
		'#club'          => __( 'Club', 'dominicos' ),
		'#equipos'       => __( 'Equipos', 'dominicos' ),
		'#pista'         => __( 'Pista', 'dominicos' ),
		'#noticias'      => __( 'Noticias', 'dominicos' ),
		'#inscripciones' => __( 'Inscripciones', 'dominicos' ),
		'#contacto'      => __( 'Contacto', 'dominicos' ),
	);

	foreach ( $items as $anchor => $label ) {
		printf(
			'<a href="%1$s">%2$s</a>',
			esc_url( is_front_page() ? $anchor : $home . $anchor ),
			esc_html( $label )
		);
	}

	printf(
		'<a class="menu__cta" href="%1$s">%2$s</a>',
		esc_url( is_front_page() ? '#inscripciones' : $home . '#inscripciones' ),
		esc_html__( 'Ven a jugar', 'dominicos' )
	);
}

/**
 * Menú de respaldo del pie, con los mismos enlaces que la web original.
 */
function dominicos_default_footer_menu() {
	$home  = trailingslashit( home_url( '/' ) );
	$items = array(
		'#club'          => __( 'Club', 'dominicos' ),
		'#equipos'       => __( 'Equipos', 'dominicos' ),
		'#pista'         => __( 'Instalaciones', 'dominicos' ),
		'#inscripciones' => __( 'Inscripciones', 'dominicos' ),
		'#contacto'      => __( 'Contacto', 'dominicos' ),
	);

	foreach ( $items as $anchor => $label ) {
		printf(
			'<a href="%1$s">%2$s</a>',
			esc_url( is_front_page() ? $anchor : $home . $anchor ),
			esc_html( $label )
		);
	}
}
