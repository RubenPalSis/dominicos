<?php
/**
 * Formulario de contacto: recibe el envío, lo valida y manda el correo.
 *
 * Sustituye al mailto: de la web estática sin necesidad de un plugin de
 * formularios. Protegido con nonce, honeypot y límite de tiempo.
 *
 * @package Dominicos_Core
 */

defined( 'ABSPATH' ) || exit;

class Dominicos_Contact {

	const ACTION      = 'dominicos_contacto';
	const NONCE       = 'dominicos_contacto_nonce';
	const TRANSIENT   = 'dominicos_contacto_result_';

	public static function init() {
		add_action( 'admin_post_nopriv_' . self::ACTION, array( __CLASS__, 'handle' ) );
		add_action( 'admin_post_' . self::ACTION, array( __CLASS__, 'handle' ) );
	}

	/**
	 * Procesa el envío y redirige de vuelta a la página de origen.
	 */
	public static function handle() {
		$redirect = isset( $_POST['_dominicos_redirect'] ) && is_string( $_POST['_dominicos_redirect'] )
			? esc_url_raw( wp_unslash( $_POST['_dominicos_redirect'] ) )
			: home_url( '/' );

		// Solo permitimos volver a una URL de este mismo sitio.
		$redirect = wp_validate_redirect( $redirect, home_url( '/' ) );

		$nonce = isset( $_POST[ self::NONCE ] ) && is_string( $_POST[ self::NONCE ] )
			? sanitize_text_field( wp_unslash( $_POST[ self::NONCE ] ) )
			: '';

		if ( ! wp_verify_nonce( $nonce, self::ACTION ) ) {
			self::bounce( $redirect, 'nonce' );
		}

		// Honeypot: si un bot rellena el campo oculto, fingimos éxito y salimos.
		$trap = isset( $_POST['dominicos_web'] ) && is_string( $_POST['dominicos_web'] )
			? trim( wp_unslash( $_POST['dominicos_web'] ) )
			: '';

		if ( '' !== $trap ) {
			self::bounce( $redirect, 'ok' );
		}

		$nombre    = isset( $_POST['nombre'] ) && is_string( $_POST['nombre'] ) ? sanitize_text_field( wp_unslash( $_POST['nombre'] ) ) : '';
		$email     = isset( $_POST['email'] ) && is_string( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
		$categoria = isset( $_POST['categoria'] ) && is_string( $_POST['categoria'] ) ? sanitize_text_field( wp_unslash( $_POST['categoria'] ) ) : '';
		$mensaje   = isset( $_POST['mensaje'] ) && is_string( $_POST['mensaje'] ) ? sanitize_textarea_field( wp_unslash( $_POST['mensaje'] ) ) : '';

		if ( '' === $nombre || '' === $mensaje || ! is_email( $email ) ) {
			self::bounce( $redirect, 'invalid' );
		}

		$options     = dominicos_get_club_options();
		$destino     = ! empty( $options['destinatario'] ) ? $options['destinatario'] : $options['email'];
		$destino     = is_email( $destino ) ? $destino : get_option( 'admin_email' );
		$site_name   = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );

		$asunto = sprintf(
			/* translators: %s: categoría elegida en el formulario. */
			__( 'Contacto web — %s', 'dominicos-core' ),
			'' !== $categoria ? $categoria : __( 'sin categoría', 'dominicos-core' )
		);

		$cuerpo = sprintf(
			"%s\n\n%s: %s\n%s: %s\n%s: %s\n\n%s\n\n---\n%s",
			__( 'Nuevo mensaje desde el formulario de la web.', 'dominicos-core' ),
			__( 'Nombre', 'dominicos-core' ),
			$nombre,
			__( 'Email', 'dominicos-core' ),
			$email,
			__( 'Categoría', 'dominicos-core' ),
			'' !== $categoria ? $categoria : '—',
			$mensaje,
			$redirect
		);

		$headers = array(
			'Content-Type: text/plain; charset=UTF-8',
			sprintf( 'From: %s <%s>', $site_name, self::from_address() ),
			sprintf( 'Reply-To: %s <%s>', $nombre, $email ),
		);

		$sent = wp_mail( $destino, $asunto, $cuerpo, $headers );

		self::bounce( $redirect, $sent ? 'ok' : 'error' );
	}

	/**
	 * Dirección remitente en el propio dominio, para no fallar el SPF del
	 * correo del visitante.
	 *
	 * @return string
	 */
	private static function from_address() {
		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		$host = is_string( $host ) ? preg_replace( '/^www\./i', '', $host ) : '';

		if ( '' === $host ) {
			return get_option( 'admin_email' );
		}

		return 'no-reply@' . $host;
	}

	/**
	 * Redirige de vuelta al formulario con el estado del envío.
	 *
	 * @param string $redirect URL de destino.
	 * @param string $status   ok | invalid | error | nonce.
	 */
	private static function bounce( $redirect, $status ) {
		$url = add_query_arg( 'contacto', rawurlencode( $status ), $redirect ) . '#contacto';

		wp_safe_redirect( $url );
		exit;
	}

	/**
	 * Texto que el tema pinta tras el envío.
	 *
	 * @param string $status Estado devuelto en la URL.
	 * @return array{message:string,ok:bool}|null
	 */
	public static function feedback( $status ) {
		$map = array(
			'ok'      => array( 'message' => __( 'Mensaje enviado. Te contestamos en cuanto podamos.', 'dominicos-core' ), 'ok' => true ),
			'invalid' => array( 'message' => __( 'Revisa el nombre, el email y el mensaje.', 'dominicos-core' ), 'ok' => false ),
			'error'   => array( 'message' => __( 'No hemos podido enviar el mensaje. Escríbenos por correo, por favor.', 'dominicos-core' ), 'ok' => false ),
			'nonce'   => array( 'message' => __( 'El formulario ha caducado. Vuelve a intentarlo.', 'dominicos-core' ), 'ok' => false ),
		);

		return isset( $map[ $status ] ) ? $map[ $status ] : null;
	}
}
