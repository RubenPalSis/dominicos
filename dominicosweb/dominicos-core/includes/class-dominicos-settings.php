<?php
/**
 * Pantalla de ajustes del club: datos de contacto y documentos de inscripción.
 *
 * Vive en el plugin, no en el tema, para que la información se conserve
 * aunque en el futuro se cambie el diseño.
 *
 * @package Dominicos_Core
 */

defined( 'ABSPATH' ) || exit;

class Dominicos_Settings {

	const OPTION_GROUP = 'dominicos_core_settings';
	const OPTION_NAME  = 'dominicos_core_club';
	const MAX_DOCS     = 8;

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * Valores por defecto: los que ya aparecían en la web estática.
	 *
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		return array(
			'email'       => 'baloncestodominicos@gmail.com',
			'telefono'    => '622 70 81 07',
			'whatsapp'    => 'https://wa.me/34622708107',
			'instagram'   => 'https://instagram.com/cbdominicos',
			'twitter'     => 'https://x.com/dominicosbasket',
			'facebook'    => '',
			'youtube'     => '',
			'direccion'   => '',
			'mapa'        => '',
			'destinatario' => '',
			'docs'        => self::default_docs(),
		);
	}

	/**
	 * Los documentos que ya listaba la web del club. Vienen con el título
	 * puesto y sin archivo: basta con elegir el PDF de cada uno. Mientras no
	 * tengan archivo no se muestran en la web.
	 *
	 * @return array<int,array{title:string,url:string,type:string}>
	 */
	public static function default_docs() {
		$titles = array(
			'Autorización de derechos de imagen',
			'Benjamín, Alevín, Infantil y Cadete',
			'Escuela infantil y primaria',
			'Junior',
			'Senior',
		);

		$docs = array();

		foreach ( $titles as $title ) {
			$docs[] = array(
				'title' => $title,
				'url'   => '',
				'type'  => 'PDF',
			);
		}

		return $docs;
	}

	/**
	 * Campos de texto simples de la pantalla.
	 *
	 * @return array<string,array<string,string>>
	 */
	public static function text_fields() {
		return array(
			'email'        => array( 'label' => 'Email del club', 'type' => 'email', 'desc' => 'Se usa en la web y como remitente visible del formulario.' ),
			'destinatario' => array( 'label' => 'Recibir formularios en', 'type' => 'email', 'desc' => 'Si se deja vacío se usa el email del club.' ),
			'telefono'     => array( 'label' => 'Teléfono', 'type' => 'text', 'desc' => 'Tal y como quieres que se lea. Ej. 622 70 81 07' ),
			'whatsapp'     => array( 'label' => 'Enlace de WhatsApp', 'type' => 'url', 'desc' => 'Ej. https://wa.me/34622708107' ),
			'instagram'    => array( 'label' => 'Instagram', 'type' => 'url', 'desc' => '' ),
			'twitter'      => array( 'label' => 'X / Twitter', 'type' => 'url', 'desc' => '' ),
			'facebook'     => array( 'label' => 'Facebook', 'type' => 'url', 'desc' => '' ),
			'youtube'      => array( 'label' => 'YouTube', 'type' => 'url', 'desc' => '' ),
			'direccion'    => array( 'label' => 'Dirección', 'type' => 'text', 'desc' => '' ),
			'mapa'         => array( 'label' => 'Enlace al mapa', 'type' => 'url', 'desc' => '' ),
		);
	}

	public static function add_menu() {
		add_submenu_page(
			'edit.php?post_type=' . Dominicos_Post_Types::POST_TYPE,
			__( 'Datos del club', 'dominicos-core' ),
			__( 'Datos del club', 'dominicos-core' ),
			'manage_options',
			'dominicos-club',
			array( __CLASS__, 'render_page' )
		);
	}

	public static function register_settings() {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_NAME,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => self::defaults(),
			)
		);
	}

	/**
	 * @param string $hook Pantalla actual.
	 */
	public static function enqueue( $hook ) {
		if ( false === strpos( (string) $hook, 'dominicos-club' ) ) {
			return;
		}

		wp_enqueue_media();
		wp_enqueue_script(
			'dominicos-core-admin',
			DOMINICOS_CORE_URL . 'assets/js/admin.js',
			array( 'jquery' ),
			DOMINICOS_CORE_VERSION,
			true
		);
	}

	/**
	 * @param mixed $input Valores enviados por el formulario.
	 * @return array<string,mixed>
	 */
	public static function sanitize( $input ) {
		$clean = self::defaults();

		if ( ! is_array( $input ) ) {
			return $clean;
		}

		foreach ( self::text_fields() as $key => $field ) {
			if ( ! isset( $input[ $key ] ) ) {
				$clean[ $key ] = '';
				continue;
			}

			$raw = is_string( $input[ $key ] ) ? $input[ $key ] : '';

			switch ( $field['type'] ) {
				case 'email':
					$clean[ $key ] = sanitize_email( $raw );
					break;
				case 'url':
					$clean[ $key ] = esc_url_raw( $raw );
					break;
				default:
					$clean[ $key ] = sanitize_text_field( $raw );
			}
		}

		$clean['docs'] = array();

		if ( isset( $input['docs'] ) && is_array( $input['docs'] ) ) {
			foreach ( array_slice( $input['docs'], 0, self::MAX_DOCS ) as $doc ) {
				if ( ! is_array( $doc ) ) {
					continue;
				}

				$title = isset( $doc['title'] ) ? sanitize_text_field( $doc['title'] ) : '';
				$url   = isset( $doc['url'] ) ? esc_url_raw( $doc['url'] ) : '';
				$type  = isset( $doc['type'] ) ? sanitize_text_field( $doc['type'] ) : 'PDF';

				if ( '' === $title ) {
					continue;
				}

				$clean['docs'][] = array(
					'title' => $title,
					'url'   => $url,
					'type'  => '' === $type ? 'PDF' : $type,
				);
			}
		}

		return $clean;
	}

	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$options = dominicos_get_club_options();
		$docs    = $options['docs'];

		if ( empty( $docs ) ) {
			$docs = array( array( 'title' => '', 'url' => '', 'type' => 'PDF' ) );
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Datos del club', 'dominicos-core' ); ?></h1>
			<p><?php esc_html_e( 'Esta información la usa el tema en la cabecera, el pie, la sección de contacto y el bloque de inscripciones.', 'dominicos-core' ); ?></p>

			<form method="post" action="options.php">
				<?php settings_fields( self::OPTION_GROUP ); ?>

				<h2><?php esc_html_e( 'Contacto y redes', 'dominicos-core' ); ?></h2>
				<table class="form-table" role="presentation">
					<tbody>
					<?php foreach ( self::text_fields() as $key => $field ) : ?>
						<tr>
							<th scope="row">
								<label for="dominicos-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $field['label'] ); ?></label>
							</th>
							<td>
								<input
									type="<?php echo esc_attr( 'email' === $field['type'] ? 'email' : ( 'url' === $field['type'] ? 'url' : 'text' ) ); ?>"
									id="dominicos-<?php echo esc_attr( $key ); ?>"
									name="<?php echo esc_attr( self::OPTION_NAME ); ?>[<?php echo esc_attr( $key ); ?>]"
									value="<?php echo esc_attr( isset( $options[ $key ] ) ? $options[ $key ] : '' ); ?>"
									class="regular-text">
								<?php if ( ! empty( $field['desc'] ) ) : ?>
									<p class="description"><?php echo esc_html( $field['desc'] ); ?></p>
								<?php endif; ?>
							</td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>

				<h2><?php esc_html_e( 'Documentos de inscripción', 'dominicos-core' ); ?></h2>
				<p class="description"><?php esc_html_e( 'Aparecen como lista en el bloque de inscripciones de la portada. Sube los PDF a la Biblioteca de medios y selecciónalos aquí.', 'dominicos-core' ); ?></p>

				<table class="widefat striped" id="dominicos-docs" style="max-width:900px;margin:12px 0">
					<thead>
						<tr>
							<th style="width:45%"><?php esc_html_e( 'Título', 'dominicos-core' ); ?></th>
							<th style="width:35%"><?php esc_html_e( 'Archivo', 'dominicos-core' ); ?></th>
							<th style="width:10%"><?php esc_html_e( 'Etiqueta', 'dominicos-core' ); ?></th>
							<th style="width:10%"></th>
						</tr>
					</thead>
					<tbody>
					<?php foreach ( array_values( $docs ) as $i => $doc ) : ?>
						<tr class="dominicos-doc-row">
							<td><input type="text" class="widefat" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[docs][<?php echo (int) $i; ?>][title]" value="<?php echo esc_attr( $doc['title'] ); ?>"></td>
							<td>
								<input type="url" class="widefat dominicos-doc-url" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[docs][<?php echo (int) $i; ?>][url]" value="<?php echo esc_url( $doc['url'] ); ?>">
								<button type="button" class="button dominicos-doc-pick" style="margin-top:4px"><?php esc_html_e( 'Elegir archivo', 'dominicos-core' ); ?></button>
							</td>
							<td><input type="text" class="widefat" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[docs][<?php echo (int) $i; ?>][type]" value="<?php echo esc_attr( isset( $doc['type'] ) && '' !== $doc['type'] ? $doc['type'] : 'PDF' ); ?>"></td>
							<td><button type="button" class="button-link delete dominicos-doc-remove"><?php esc_html_e( 'Quitar', 'dominicos-core' ); ?></button></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>

				<p>
					<button type="button" class="button" id="dominicos-doc-add" data-option="<?php echo esc_attr( self::OPTION_NAME ); ?>" data-max="<?php echo (int) self::MAX_DOCS; ?>">
						<?php esc_html_e( 'Añadir documento', 'dominicos-core' ); ?>
					</button>
				</p>

				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}
}
