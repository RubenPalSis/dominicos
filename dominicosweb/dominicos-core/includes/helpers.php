<?php
/**
 * Funciones de lectura que usa el tema. Todas son seguras de llamar aunque
 * el plugin se desactive, porque el tema las envuelve en function_exists().
 *
 * @package Dominicos_Core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Datos del club guardados en Equipos → Datos del club.
 *
 * @return array<string,mixed>
 */
function dominicos_get_club_options() {
	$saved = get_option( Dominicos_Settings::OPTION_NAME, array() );

	if ( ! is_array( $saved ) ) {
		$saved = array();
	}

	$options = wp_parse_args( $saved, Dominicos_Settings::defaults() );

	if ( ! isset( $options['docs'] ) || ! is_array( $options['docs'] ) ) {
		$options['docs'] = array();
	}

	return $options;
}

/**
 * Un único dato del club.
 *
 * @param string $key      Clave.
 * @param mixed  $fallback Valor si está vacío.
 * @return mixed
 */
function dominicos_club( $key, $fallback = '' ) {
	$options = dominicos_get_club_options();

	if ( ! isset( $options[ $key ] ) || '' === $options[ $key ] || array() === $options[ $key ] ) {
		return $fallback;
	}

	return $options[ $key ];
}

/**
 * Documentos de inscripción.
 *
 * @return array<int,array{title:string,url:string,type:string}>
 */
function dominicos_get_documentos() {
	$docs = dominicos_club( 'docs', array() );

	if ( ! is_array( $docs ) ) {
		return array();
	}

	// Se devuelven también los que aún no tienen archivo: la plantilla los
	// pinta sin enlace, para que el bloque no cambie de forma mientras se
	// suben los PDF.
	return array_values(
		array_filter(
			$docs,
			static function ( $doc ) {
				return is_array( $doc ) && ! empty( $doc['title'] );
			}
		)
	);
}

/**
 * Metadato de un equipo.
 *
 * @param string   $key     Clave sin el prefijo _dominicos_.
 * @param int|null $post_id ID del equipo.
 * @return string
 */
function dominicos_equipo_meta( $key, $post_id = null ) {
	$post_id = $post_id ? (int) $post_id : get_the_ID();

	if ( ! $post_id ) {
		return '';
	}

	$value = get_post_meta( $post_id, '_dominicos_' . $key, true );

	return is_string( $value ) ? $value : '';
}

/**
 * Término más específico (hoja) asignado a un equipo. Es el que se pinta como
 * etiqueta en la tarjeta.
 *
 * @param int|null $post_id ID del equipo.
 * @return WP_Term|null
 */
function dominicos_equipo_categoria( $post_id = null ) {
	$post_id = $post_id ? (int) $post_id : get_the_ID();
	$terms   = get_the_terms( $post_id, Dominicos_Post_Types::TAXONOMY );

	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return null;
	}

	foreach ( $terms as $term ) {
		if ( $term->parent ) {
			return $term;
		}
	}

	return $terms[0];
}

/**
 * Grupo de primer nivel (Base, Formación, Senior) al que pertenece un equipo.
 * Es el valor que usan los chips de filtro del listado.
 *
 * @param int|null $post_id ID del equipo.
 * @return WP_Term|null
 */
function dominicos_equipo_grupo( $post_id = null ) {
	$term = dominicos_equipo_categoria( $post_id );

	if ( ! $term ) {
		return null;
	}

	while ( $term->parent ) {
		$parent = get_term( $term->parent, Dominicos_Post_Types::TAXONOMY );

		if ( ! $parent || is_wp_error( $parent ) ) {
			break;
		}

		$term = $parent;
	}

	return $term;
}

/**
 * Términos de primer nivel, en el orden en que se muestran los filtros.
 *
 * @return WP_Term[]
 */
function dominicos_get_grupos() {
	$terms = get_terms(
		array(
			'taxonomy'   => Dominicos_Post_Types::TAXONOMY,
			'parent'     => 0,
			'hide_empty' => false,
			'orderby'    => 'term_order',
		)
	);

	return is_wp_error( $terms ) ? array() : $terms;
}

/**
 * Horarios de un equipo como lista de líneas.
 *
 * @param int|null $post_id ID del equipo.
 * @return string[]
 */
function dominicos_equipo_horarios( $post_id = null ) {
	$raw = dominicos_equipo_meta( 'horarios', $post_id );

	if ( '' === $raw ) {
		return array();
	}

	$lines = preg_split( '/\r\n|\r|\n/', $raw );
	$lines = array_map( 'trim', is_array( $lines ) ? $lines : array() );

	return array_values( array_filter( $lines, 'strlen' ) );
}

/**
 * Indica si el plugin está activo. El tema la usa para decidir si pinta
 * las secciones de equipos.
 *
 * @return bool
 */
function dominicos_core_active() {
	return true;
}
