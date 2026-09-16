<?php
/**
 * Contenido de partida.
 *
 * Crea los equipos y las noticias que ya tenía la web del club, con sus
 * mismas fotos y sus mismos textos, para que al activar el tema la portada se
 * vea igual que antes. No se inventa nada: los campos que la web estática no
 * tenía (entrenadores, horarios) se dejan vacíos para rellenarlos desde el
 * panel.
 *
 * Todo lo que crea queda marcado y se puede borrar de una vez desde
 * Equipos → Contenido inicial.
 *
 * @package Dominicos_Core
 */

defined( 'ABSPATH' ) || exit;

class Dominicos_Seed {

	const FLAG        = '_dominicos_seed';
	const OPTION_DONE = 'dominicos_core_seeded';
	const NONCE       = 'dominicos_seed_nonce';
	const ACTION_MAKE = 'dominicos_seed_create';
	const ACTION_WIPE = 'dominicos_seed_delete';

	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'maybe_seed' ) );
		add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
		add_action( 'admin_post_' . self::ACTION_MAKE, array( __CLASS__, 'handle_create' ) );
		add_action( 'admin_post_' . self::ACTION_WIPE, array( __CLASS__, 'handle_delete' ) );
		add_action( 'admin_notices', array( __CLASS__, 'notice' ) );
	}

	/**
	 * Siembra automática la primera vez, sin que nadie tenga que pulsar nada.
	 *
	 * Se hace en admin_init y no en el gancho de activación porque necesita
	 * que el tema esté activo (de ahí salen las fotos) y el orden en que se
	 * activan el tema y el plugin no está garantizado.
	 */
	public static function maybe_seed() {
		if ( get_option( self::OPTION_DONE ) ) {
			return;
		}

		if ( ! self::theme_is_ready() ) {
			return;
		}

		// Si ya hay equipos publicados, esta instalación no está vacía:
		// no tocamos nada.
		$existing = get_posts(
			array(
				'post_type'      => Dominicos_Post_Types::POST_TYPE,
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
			)
		);

		if ( ! empty( $existing ) ) {
			update_option( self::OPTION_DONE, '1' );
			return;
		}

		Dominicos_Post_Types::seed_default_terms();
		self::create_equipos();
		self::create_noticias();

		update_option( self::OPTION_DONE, '1' );
	}

	/**
	 * Las fotos salen de la carpeta del tema, así que solo sembramos si el
	 * tema de Dominicos está activo.
	 *
	 * @return bool
	 */
	private static function theme_is_ready() {
		return file_exists( get_template_directory() . '/assets/images/escuela.jpg' );
	}

	/**
	 * Los nueve equipos de la web original, con su foto, su etiqueta y su
	 * frase, tal cual estaban escritos.
	 *
	 * @return array<int,array<string,string>>
	 */
	private static function equipos() {
		return array(
			array(
				'title'    => 'Escuela',
				'term'     => 'escuela',
				'etiqueta' => 'Primaria',
				'image'    => 'escuela.jpg',
				'resumen'  => 'Primeros botes, primeras canastas.',
				'alt'      => 'Escuela de baloncesto Dominicos',
			),
			array(
				'title'    => 'Benjamín',
				'term'     => 'benjamin',
				'etiqueta' => 'Mini',
				'image'    => 'benjamin.jpg',
				'resumen'  => 'Liga escolar y torneos de primavera.',
				'alt'      => 'Equipo benjamín',
			),
			array(
				'title'    => 'Alevín',
				'term'     => 'alevin',
				'etiqueta' => 'Mixto',
				'image'    => 'alevin.jpg',
				'resumen'  => 'Equipo mixto, mucha pista para todos.',
				'alt'      => 'Equipo alevín mixto',
			),
			array(
				'title'    => 'Preinfantil',
				'term'     => 'preinfantil',
				'etiqueta' => 'Formación',
				'image'    => 'preinfantil.jpg',
				'resumen'  => 'El salto a la pista grande.',
				'alt'      => 'Equipo preinfantil',
			),
			array(
				'title'    => 'Infantil',
				'term'     => 'infantil',
				'etiqueta' => 'Formación',
				'image'    => 'infantil.jpg',
				'resumen'  => 'Final Four de la copa de primavera.',
				'alt'      => 'Equipo infantil',
			),
			array(
				'title'    => 'Cadete',
				'term'     => 'cadete',
				'etiqueta' => 'Formación',
				'image'    => 'cadete.jpg',
				'resumen'  => 'Ritmo, físico y lectura de juego.',
				'alt'      => 'Equipo cadete',
			),
			array(
				'title'    => 'Junior',
				'term'     => 'junior',
				'etiqueta' => 'Formación',
				'image'    => 'junior.jpg',
				'resumen'  => 'La antesala del senior.',
				'alt'      => 'Equipo junior',
			),
			array(
				'title'    => 'Senior Femenino',
				'term'     => 'senior-femenino',
				'etiqueta' => 'Senior',
				'image'    => 'senior-femenino.jpg',
				'resumen'  => 'Competición y cantera del club.',
				'alt'      => 'Equipo senior femenino',
			),
			array(
				'title'    => 'Senior Masculino',
				'term'     => 'senior-masculino',
				'etiqueta' => 'Senior',
				'image'    => 'senior-masculino.jpg',
				'resumen'  => 'Los que siguen siendo Dominicos.',
				'alt'      => 'Equipo senior masculino',
			),
		);
	}

	/**
	 * Las tres noticias que ya salían en la portada, con sus fechas.
	 *
	 * @return array<int,array<string,string>>
	 */
	private static function noticias() {
		return array(
			array(
				'title'    => 'Benjamín y Cadete en el Día del Deporte del Bajo Aragón',
				'excerpt'  => 'Jornada completa de partidos y convivencia con clubes de la comarca.',
				'category' => 'Competición',
				'date'     => '2022-06-11 10:00:00',
				'image'    => 'benjamin.jpg',
			),
			array(
				'title'    => 'El Infantil, en la Final Four de la Copa Primavera',
				'excerpt'  => 'Dos días de competición para cerrar la temporada por todo lo alto.',
				'category' => 'Competición',
				'date'     => '2022-06-11 12:00:00',
				'image'    => 'infantil.jpg',
			),
			array(
				'title'    => 'Torneo de Cuarte',
				'excerpt'  => 'Otro clásico del calendario del club, con varios equipos desplazados.',
				'category' => 'Competición',
				'date'     => '2022-04-22 10:00:00',
				'image'    => 'cadete.jpg',
			),
		);
	}

	/**
	 * @return int Equipos creados.
	 */
	private static function create_equipos() {
		$count = 0;
		$order = 0;

		foreach ( self::equipos() as $data ) {
			$order++;

			if ( self::exists( Dominicos_Post_Types::POST_TYPE, $data['title'] ) ) {
				continue;
			}

			$post_id = wp_insert_post(
				array(
					'post_type'    => Dominicos_Post_Types::POST_TYPE,
					'post_status'  => 'publish',
					'post_title'   => $data['title'],
					'post_excerpt' => $data['resumen'],
					'post_content' => '',
					'menu_order'   => $order,
				),
				true
			);

			if ( is_wp_error( $post_id ) ) {
				continue;
			}

			update_post_meta( $post_id, self::FLAG, '1' );
			update_post_meta( $post_id, '_dominicos_resumen', $data['resumen'] );
			update_post_meta( $post_id, '_dominicos_etiqueta', $data['etiqueta'] );

			$term = get_term_by( 'slug', $data['term'], Dominicos_Post_Types::TAXONOMY );

			if ( $term && ! is_wp_error( $term ) ) {
				wp_set_object_terms( $post_id, array( (int) $term->term_id ), Dominicos_Post_Types::TAXONOMY );
			}

			self::attach_image( $post_id, $data['image'], $data['alt'] );
			$count++;
		}

		return $count;
	}

	/**
	 * @return int Noticias creadas.
	 */
	private static function create_noticias() {
		$count = 0;

		foreach ( self::noticias() as $data ) {
			if ( self::exists( 'post', $data['title'] ) ) {
				continue;
			}

			$post_id = wp_insert_post(
				array(
					'post_type'     => 'post',
					'post_status'   => 'publish',
					'post_title'    => $data['title'],
					'post_excerpt'  => $data['excerpt'],
					'post_content'  => $data['excerpt'],
					'post_date'     => $data['date'],
					'post_date_gmt' => get_gmt_from_date( $data['date'] ),
				),
				true
			);

			if ( is_wp_error( $post_id ) ) {
				continue;
			}

			update_post_meta( $post_id, self::FLAG, '1' );

			$term = term_exists( $data['category'], 'category' );

			if ( ! $term ) {
				$term = wp_insert_term( $data['category'], 'category' );
			}

			if ( ! is_wp_error( $term ) && isset( $term['term_id'] ) ) {
				wp_set_post_terms( $post_id, array( (int) $term['term_id'] ), 'category' );
			}

			self::attach_image( $post_id, $data['image'], $data['title'] );
			$count++;
		}

		return $count;
	}

	/**
	 * Copia una imagen del tema a la biblioteca y la deja como destacada.
	 *
	 * @param int    $post_id  Entrada destino.
	 * @param string $filename Archivo dentro de assets/images del tema.
	 * @param string $alt      Texto alternativo.
	 */
	private static function attach_image( $post_id, $filename, $alt ) {
		$source = get_template_directory() . '/assets/images/' . $filename;

		if ( ! file_exists( $source ) ) {
			return;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$tmp = wp_tempnam( $filename );

		if ( ! $tmp || ! copy( $source, $tmp ) ) {
			return;
		}

		$file = array(
			'name'     => $filename,
			'tmp_name' => $tmp,
		);

		$attachment_id = media_handle_sideload( $file, $post_id, $alt );

		if ( is_wp_error( $attachment_id ) ) {
			if ( file_exists( $tmp ) ) {
				wp_delete_file( $tmp );
			}
			return;
		}

		update_post_meta( $attachment_id, self::FLAG, '1' );
		update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt );
		set_post_thumbnail( $post_id, $attachment_id );
	}

	/**
	 * @param string $post_type Tipo de contenido.
	 * @param string $title     Título exacto.
	 * @return bool
	 */
	private static function exists( $post_type, $title ) {
		$found = get_posts(
			array(
				'post_type'      => $post_type,
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'title'          => $title,
			)
		);

		return ! empty( $found );
	}

	/* ---------------------------------------------------------------------
	 * Pantalla del panel
	 * ------------------------------------------------------------------ */

	public static function add_menu() {
		add_submenu_page(
			'edit.php?post_type=' . Dominicos_Post_Types::POST_TYPE,
			__( 'Contenido inicial', 'dominicos-core' ),
			__( 'Contenido inicial', 'dominicos-core' ),
			'manage_options',
			'dominicos-seed',
			array( __CLASS__, 'render_page' )
		);
	}

	public static function handle_create() {
		self::guard( self::ACTION_MAKE );

		Dominicos_Post_Types::seed_default_terms();
		$total = self::create_equipos() + self::create_noticias();

		update_option( self::OPTION_DONE, '1' );
		self::bounce( 'created', $total );
	}

	public static function handle_delete() {
		self::guard( self::ACTION_WIPE );

		$ids = get_posts(
			array(
				'post_type'      => array( 'post', Dominicos_Post_Types::POST_TYPE ),
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'meta_key'       => self::FLAG,
				'meta_value'     => '1',
			)
		);

		$deleted = 0;

		foreach ( $ids as $id ) {
			$thumb_id = get_post_thumbnail_id( $id );

			if ( $thumb_id && get_post_meta( $thumb_id, self::FLAG, true ) ) {
				wp_delete_attachment( $thumb_id, true );
			}

			if ( wp_delete_post( $id, true ) ) {
				$deleted++;
			}
		}

		self::bounce( 'deleted', $deleted );
	}

	/**
	 * @param string $action Acción esperada.
	 */
	private static function guard( $action ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'No tienes permisos para hacer esto.', 'dominicos-core' ) );
		}

		check_admin_referer( $action, self::NONCE );
	}

	/**
	 * @param string $status Estado.
	 * @param int    $count  Elementos afectados.
	 */
	private static function bounce( $status, $count ) {
		$url = add_query_arg(
			array(
				'post_type'       => Dominicos_Post_Types::POST_TYPE,
				'page'            => 'dominicos-seed',
				'dominicos_seed'  => $status,
				'dominicos_count' => (int) $count,
			),
			admin_url( 'edit.php' )
		);

		wp_safe_redirect( $url );
		exit;
	}

	public static function notice() {
		if ( ! isset( $_GET['dominicos_seed'] ) || ! is_string( $_GET['dominicos_seed'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- solo pinta un aviso.
			return;
		}

		$status = sanitize_key( wp_unslash( $_GET['dominicos_seed'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$count  = isset( $_GET['dominicos_count'] ) ? absint( wp_unslash( $_GET['dominicos_count'] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( 'created' === $status ) {
			$text = sprintf(
				/* translators: %d: número de elementos. */
				_n( 'Creado %d elemento.', 'Creados %d elementos.', $count, 'dominicos-core' ),
				$count
			);
		} elseif ( 'deleted' === $status ) {
			$text = sprintf(
				/* translators: %d: número de elementos. */
				_n( 'Borrado %d elemento.', 'Borrados %d elementos.', $count, 'dominicos-core' ),
				$count
			);
		} else {
			return;
		}

		printf( '<div class="notice notice-success is-dismissible"><p>%s</p></div>', esc_html( $text ) );
	}

	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$existing = get_posts(
			array(
				'post_type'      => array( 'post', Dominicos_Post_Types::POST_TYPE ),
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'meta_key'       => self::FLAG,
				'meta_value'     => '1',
			)
		);
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Contenido inicial', 'dominicos-core' ); ?></h1>

			<p><?php esc_html_e( 'Al instalar el plugin se crearon solos los 9 equipos y las 3 noticias que ya tenía la web del club, con sus mismas fotos y sus mismos textos, para que la portada se viera igual desde el primer momento.', 'dominicos-core' ); ?></p>
			<p><?php esc_html_e( 'Los campos que la web antigua no tenía (entrenadores, horarios, lugar) están vacíos a propósito: rellénalos desde Equipos → editar cada equipo. No se ha inventado ningún dato.', 'dominicos-core' ); ?></p>

			<p>
				<?php
				printf(
					/* translators: %d: número de elementos. */
					esc_html__( 'Quedan %d elementos del contenido inicial sin borrar.', 'dominicos-core' ),
					count( $existing )
				);
				?>
			</p>

			<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<input type="hidden" name="action" value="<?php echo esc_attr( self::ACTION_MAKE ); ?>">
					<?php wp_nonce_field( self::ACTION_MAKE, self::NONCE ); ?>
					<?php submit_button( __( 'Volver a crear lo que falte', 'dominicos-core' ), 'secondary', 'submit', false ); ?>
				</form>

				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" onsubmit="return confirm('<?php echo esc_js( __( 'Se borrarán los equipos y las noticias creados automáticamente, junto con sus fotos. Lo que hayas creado tú no se toca. ¿Seguir?', 'dominicos-core' ) ); ?>');">
					<input type="hidden" name="action" value="<?php echo esc_attr( self::ACTION_WIPE ); ?>">
					<?php wp_nonce_field( self::ACTION_WIPE, self::NONCE ); ?>
					<?php submit_button( __( 'Borrar el contenido inicial', 'dominicos-core' ), 'delete', 'submit', false ); ?>
				</form>
			</div>
		</div>
		<?php
	}
}
