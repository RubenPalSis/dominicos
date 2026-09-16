<?php
/**
 * Campos propios de la ficha de equipo.
 *
 * @package Dominicos_Core
 */

defined( 'ABSPATH' ) || exit;

class Dominicos_Meta {

	const NONCE_ACTION = 'dominicos_save_equipo_meta';
	const NONCE_NAME   = 'dominicos_equipo_nonce';

	public static function init() {
		add_action( 'add_meta_boxes', array( __CLASS__, 'add_meta_boxes' ) );
		add_action( 'save_post_' . Dominicos_Post_Types::POST_TYPE, array( __CLASS__, 'save' ), 10, 2 );
		add_action( 'init', array( __CLASS__, 'register_meta' ) );
	}

	/**
	 * Definición única de los campos. De aquí salen el formulario, el guardado
	 * y el registro en la API REST.
	 *
	 * @return array<string,array<string,string>>
	 */
	public static function fields() {
		return array(
			'_dominicos_entrenador'    => array(
				'label' => __( 'Entrenador/a', 'dominicos-core' ),
				'type'  => 'text',
				'desc'  => '',
			),
			'_dominicos_entrenador_2'  => array(
				'label' => __( 'Segundo entrenador/a', 'dominicos-core' ),
				'type'  => 'text',
				'desc'  => '',
			),
			'_dominicos_delegado'      => array(
				'label' => __( 'Delegado/a', 'dominicos-core' ),
				'type'  => 'text',
				'desc'  => '',
			),
			'_dominicos_competicion'   => array(
				'label' => __( 'Competición', 'dominicos-core' ),
				'type'  => 'text',
				'desc'  => __( 'Ej. Liga escolar, Liga federada, 3x3…', 'dominicos-core' ),
			),
			'_dominicos_horarios'      => array(
				'label' => __( 'Horarios de entrenamiento', 'dominicos-core' ),
				'type'  => 'textarea',
				'desc'  => __( 'Una línea por día. Ej. Martes 18:00 – 19:30', 'dominicos-core' ),
			),
			'_dominicos_lugar'         => array(
				'label' => __( 'Lugar de entrenamiento', 'dominicos-core' ),
				'type'  => 'text',
				'desc'  => __( 'Ej. Pabellón o Patio superior.', 'dominicos-core' ),
			),
			'_dominicos_etiqueta'      => array(
				'label' => __( 'Etiqueta de la tarjeta', 'dominicos-core' ),
				'type'  => 'text',
				'desc'  => __( 'La pastilla roja sobre el nombre en el listado. Ej. Primaria, Mini, Mixto. Si se deja vacía se usa la categoría.', 'dominicos-core' ),
			),
			'_dominicos_resumen'       => array(
				'label' => __( 'Frase de la tarjeta', 'dominicos-core' ),
				'type'  => 'text',
				'desc'  => __( 'Texto corto bajo el nombre en el listado. Si se deja vacío se usa el extracto.', 'dominicos-core' ),
			),
			'_dominicos_info_adicional' => array(
				'label' => __( 'Información adicional', 'dominicos-core' ),
				'type'  => 'textarea',
				'desc'  => __( 'Cuotas, material, convocatorias, notas para las familias…', 'dominicos-core' ),
			),
		);
	}

	/**
	 * Expone los campos en la API REST para que el editor de bloques y
	 * cualquier integración futura puedan leerlos.
	 */
	public static function register_meta() {
		foreach ( self::fields() as $key => $field ) {
			register_post_meta(
				Dominicos_Post_Types::POST_TYPE,
				$key,
				array(
					'show_in_rest'      => true,
					'single'            => true,
					'type'              => 'string',
					'sanitize_callback' => 'textarea' === $field['type'] ? 'sanitize_textarea_field' : 'sanitize_text_field',
					'auth_callback'     => function () {
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}
	}

	public static function add_meta_boxes() {
		add_meta_box(
			'dominicos_equipo_datos',
			__( 'Datos del equipo', 'dominicos-core' ),
			array( __CLASS__, 'render' ),
			Dominicos_Post_Types::POST_TYPE,
			'normal',
			'high'
		);
	}

	/**
	 * @param WP_Post $post Equipo en edición.
	 */
	public static function render( $post ) {
		wp_nonce_field( self::NONCE_ACTION, self::NONCE_NAME );

		echo '<style>.dominicos-meta{display:grid;gap:16px}.dominicos-meta label{display:block;font-weight:600;margin-bottom:4px}.dominicos-meta input[type=text],.dominicos-meta textarea{width:100%}.dominicos-meta p.description{margin:4px 0 0}</style>';
		echo '<div class="dominicos-meta">';

		foreach ( self::fields() as $key => $field ) {
			$value = get_post_meta( $post->ID, $key, true );
			$id    = esc_attr( $key );

			echo '<div>';
			printf( '<label for="%1$s">%2$s</label>', $id, esc_html( $field['label'] ) );

			if ( 'textarea' === $field['type'] ) {
				printf(
					'<textarea id="%1$s" name="%1$s" rows="4">%2$s</textarea>',
					$id,
					esc_textarea( $value )
				);
			} else {
				printf(
					'<input type="text" id="%1$s" name="%1$s" value="%2$s">',
					$id,
					esc_attr( $value )
				);
			}

			if ( ! empty( $field['desc'] ) ) {
				printf( '<p class="description">%s</p>', esc_html( $field['desc'] ) );
			}

			echo '</div>';
		}

		echo '</div>';
	}

	/**
	 * @param int     $post_id ID del equipo.
	 * @param WP_Post $post    Equipo.
	 */
	public static function save( $post_id, $post ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}

		// Sin nonce no hacemos nada: puede ser un guardado por REST o por WP-CLI,
		// donde los campos ya se sanean en register_post_meta().
		if ( ! isset( $_POST[ self::NONCE_NAME ] ) || ! is_string( $_POST[ self::NONCE_NAME ] ) ) {
			return;
		}

		$nonce = sanitize_text_field( wp_unslash( $_POST[ self::NONCE_NAME ] ) );

		if ( ! wp_verify_nonce( $nonce, self::NONCE_ACTION ) ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		foreach ( self::fields() as $key => $field ) {
			if ( ! isset( $_POST[ $key ] ) || ! is_string( $_POST[ $key ] ) ) {
				delete_post_meta( $post_id, $key );
				continue;
			}

			$raw = wp_unslash( $_POST[ $key ] );

			$value = 'textarea' === $field['type']
				? sanitize_textarea_field( $raw )
				: sanitize_text_field( $raw );

			if ( '' === $value ) {
				delete_post_meta( $post_id, $key );
			} else {
				update_post_meta( $post_id, $key, $value );
			}
		}
	}
}
