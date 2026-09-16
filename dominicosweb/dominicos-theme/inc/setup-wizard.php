<?php
/**
 * Configuración automática de la primera vez.
 *
 * Deja el sitio listo sin que nadie tenga que tocar Ajustes: crea las páginas
 * Inicio y Noticias, las asigna como portada y página de entradas, monta los
 * menús de cabecera y de pie, pone los enlaces permanentes bonitos y sube el
 * escudo del club.
 *
 * Cada paso se comprueba por separado y solo actúa si no había nada. En una
 * instalación con contenido no pisa nada de lo que ya exista.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

/**
 * Versión de la configuración. Si algún día hay que añadir un paso nuevo, se
 * sube este número y se vuelve a ejecutar una sola vez.
 */
define( 'DOMINICOS_SETUP_VERSION', '1' );

/**
 * Lanza la configuración una única vez.
 */
function dominicos_maybe_run_setup() {
	if ( get_option( 'dominicos_setup_version' ) === DOMINICOS_SETUP_VERSION ) {
		return;
	}

	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	dominicos_setup_permalinks();
	$pages = dominicos_setup_pages();
	dominicos_setup_front_page( $pages );
	dominicos_setup_menus( $pages );
	dominicos_setup_branding();
	dominicos_setup_tidy_defaults();
	dominicos_setup_clear_footer_widgets();

	update_option( 'dominicos_setup_version', DOMINICOS_SETUP_VERSION );
	set_transient( 'dominicos_setup_notice', 1, HOUR_IN_SECONDS );
}
add_action( 'admin_init', 'dominicos_maybe_run_setup' );

/**
 * Enlaces permanentes por nombre. Sin esto /equipos/ y /noticias/ dan 404.
 */
function dominicos_setup_permalinks() {
	if ( '' === get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
	}

	flush_rewrite_rules( false );
}

/**
 * Crea las páginas que el diseño necesita, si no existen ya.
 *
 * @return array<string,int> Mapa slug => ID.
 */
function dominicos_setup_pages() {
	$wanted = array(
		'inicio'   => __( 'Inicio', 'dominicos' ),
		'noticias' => __( 'Noticias', 'dominicos' ),
	);

	$pages = array();

	foreach ( $wanted as $slug => $title ) {
		$existing = get_page_by_path( $slug, OBJECT, 'page' );

		if ( $existing instanceof WP_Post ) {
			$pages[ $slug ] = (int) $existing->ID;
			continue;
		}

		$page_id = wp_insert_post(
			array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'post_title'     => $title,
				'post_name'      => $slug,
				'post_content'   => '',
				'comment_status' => 'closed',
			)
		);

		if ( ! is_wp_error( $page_id ) ) {
			$pages[ $slug ] = (int) $page_id;
		}
	}

	return $pages;
}

/**
 * Portada estática y página de entradas.
 *
 * @param array<string,int> $pages Páginas creadas.
 */
function dominicos_setup_front_page( $pages ) {
	if ( empty( $pages['inicio'] ) || empty( $pages['noticias'] ) ) {
		return;
	}

	// Si ya hay una portada estática puesta a mano, la respetamos.
	if ( 'page' === get_option( 'show_on_front' ) && (int) get_option( 'page_on_front' ) ) {
		return;
	}

	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $pages['inicio'] );
	update_option( 'page_for_posts', $pages['noticias'] );
}

/**
 * Menú de cabecera y menú de pie, con los mismos enlaces que la web original.
 *
 * @param array<string,int> $pages Páginas creadas.
 */
function dominicos_setup_menus( $pages ) {
	$locations = get_theme_mod( 'nav_menu_locations', array() );
	$locations = is_array( $locations ) ? $locations : array();

	$home       = trailingslashit( home_url( '/' ) );
	$noticias   = ! empty( $pages['noticias'] ) ? (int) $pages['noticias'] : 0;
	$changed    = false;

	$definitions = array(
		'primary' => array(
			'name'  => __( 'Principal', 'dominicos' ),
			'items' => array(
				array( 'title' => __( 'Club', 'dominicos' ), 'url' => $home . '#club' ),
				array( 'title' => __( 'Equipos', 'dominicos' ), 'url' => $home . '#equipos' ),
				array( 'title' => __( 'Pista', 'dominicos' ), 'url' => $home . '#pista' ),
				array( 'title' => __( 'Noticias', 'dominicos' ), 'page' => $noticias ),
				array( 'title' => __( 'Inscripciones', 'dominicos' ), 'url' => $home . '#inscripciones' ),
				array( 'title' => __( 'Contacto', 'dominicos' ), 'url' => $home . '#contacto' ),
				array( 'title' => __( 'Ven a jugar', 'dominicos' ), 'url' => $home . '#inscripciones', 'classes' => 'menu__cta' ),
			),
		),
		'footer'  => array(
			'name'  => __( 'Pie', 'dominicos' ),
			'items' => array(
				array( 'title' => __( 'Club', 'dominicos' ), 'url' => $home . '#club' ),
				array( 'title' => __( 'Equipos', 'dominicos' ), 'url' => $home . '#equipos' ),
				array( 'title' => __( 'Instalaciones', 'dominicos' ), 'url' => $home . '#pista' ),
				array( 'title' => __( 'Inscripciones', 'dominicos' ), 'url' => $home . '#inscripciones' ),
				array( 'title' => __( 'Contacto', 'dominicos' ), 'url' => $home . '#contacto' ),
			),
		),
	);

	foreach ( $definitions as $location => $definition ) {
		// Si ya hay un menú asignado a esta ubicación, no lo tocamos.
		if ( ! empty( $locations[ $location ] ) && is_nav_menu( $locations[ $location ] ) ) {
			continue;
		}

		$menu = wp_get_nav_menu_object( $definition['name'] );

		if ( ! $menu ) {
			$menu_id = wp_create_nav_menu( $definition['name'] );

			if ( is_wp_error( $menu_id ) ) {
				continue;
			}

			foreach ( $definition['items'] as $item ) {
				$args = array(
					'menu-item-title'   => $item['title'],
					'menu-item-status'  => 'publish',
					'menu-item-classes' => isset( $item['classes'] ) ? $item['classes'] : '',
				);

				if ( ! empty( $item['page'] ) ) {
					$args['menu-item-type']      = 'post_type';
					$args['menu-item-object']    = 'page';
					$args['menu-item-object-id'] = (int) $item['page'];
				} else {
					$args['menu-item-type'] = 'custom';
					$args['menu-item-url']  = $item['url'];
				}

				wp_update_nav_menu_item( $menu_id, 0, $args );
			}
		} else {
			$menu_id = (int) $menu->term_id;
		}

		$locations[ $location ] = $menu_id;
		$changed                = true;
	}

	if ( $changed ) {
		set_theme_mod( 'nav_menu_locations', $locations );
	}
}

/**
 * Escudo del club como logotipo y como icono del sitio.
 */
function dominicos_setup_branding() {
	if ( has_custom_logo() && has_site_icon() ) {
		return;
	}

	$logo_id = dominicos_sideload_theme_image( 'logo.jpg', __( 'Escudo del CB Dominicos Zaragoza', 'dominicos' ) );

	if ( ! $logo_id ) {
		return;
	}

	if ( ! has_custom_logo() ) {
		set_theme_mod( 'custom_logo', $logo_id );
	}

	if ( ! has_site_icon() ) {
		update_option( 'site_icon', $logo_id );
	}
}

/**
 * Sube una imagen del tema a la biblioteca de medios, una sola vez.
 *
 * @param string $filename Archivo dentro de assets/images.
 * @param string $alt      Texto alternativo.
 * @return int ID del adjunto, o 0 si no se ha podido.
 */
function dominicos_sideload_theme_image( $filename, $alt = '' ) {
	$source = get_template_directory() . '/assets/images/' . $filename;

	if ( ! file_exists( $source ) ) {
		return 0;
	}

	// Si ya la subimos en una pasada anterior, la reutilizamos.
	$known = get_option( 'dominicos_uploaded_' . sanitize_key( $filename ) );

	if ( $known && get_post( (int) $known ) ) {
		return (int) $known;
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$tmp = wp_tempnam( $filename );

	if ( ! $tmp || ! copy( $source, $tmp ) ) {
		return 0;
	}

	$attachment_id = media_handle_sideload(
		array(
			'name'     => $filename,
			'tmp_name' => $tmp,
		),
		0,
		$alt
	);

	if ( is_wp_error( $attachment_id ) ) {
		if ( file_exists( $tmp ) ) {
			wp_delete_file( $tmp );
		}

		return 0;
	}

	update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt );
	update_option( 'dominicos_uploaded_' . sanitize_key( $filename ), (int) $attachment_id );

	return (int) $attachment_id;
}

/**
 * Manda a la papelera el contenido de ejemplo de WordPress, pero solo si
 * sigue intacto: si alguien lo ha editado, se queda.
 */
function dominicos_setup_tidy_defaults() {
	$hello = get_page_by_path( 'hello-world', OBJECT, 'post' );

	if ( $hello instanceof WP_Post && 'publish' === $hello->post_status && 1 === (int) $hello->ID ) {
		wp_trash_post( $hello->ID );
	}

	$sample = get_page_by_path( 'sample-page', OBJECT, 'page' );

	if ( $sample instanceof WP_Post && 'publish' === $sample->post_status ) {
		wp_trash_post( $sample->ID );
	}
}

/**
 * Al cambiar de tema, WordPress rellena la primera zona de widgets con los
 * suyos (Archivos, Categorías…). En el pie de este diseño no pintan nada, así
 * que se deja vacío. Si alguien pone widgets a mano, no se toca.
 */
function dominicos_setup_clear_footer_widgets() {
	$sidebars = get_option( 'sidebars_widgets' );

	if ( ! is_array( $sidebars ) || ! isset( $sidebars['footer'] ) ) {
		return;
	}

	$current = (array) $sidebars['footer'];

	// Los que coloca WordPress solo: bloques y los clásicos de siempre.
	foreach ( $current as $widget ) {
		if ( ! preg_match( '/^(block|archives|categories|search|recent-posts|recent-comments|meta)-\d+$/', (string) $widget ) ) {
			return;
		}
	}

	$sidebars['footer'] = array();
	update_option( 'sidebars_widgets', $sidebars );
}

/**
 * Aviso de bienvenida tras la configuración automática.
 */
function dominicos_setup_notice() {
	if ( ! get_transient( 'dominicos_setup_notice' ) ) {
		return;
	}

	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	delete_transient( 'dominicos_setup_notice' );
	?>
	<div class="notice notice-success is-dismissible">
		<p><strong><?php esc_html_e( 'La web de Dominicos ya está montada.', 'dominicos' ); ?></strong></p>
		<p><?php esc_html_e( 'Se han creado la portada, la página de noticias, los menús de cabecera y pie, y se ha puesto el escudo del club. Los equipos y las noticias de la web anterior también están cargados.', 'dominicos' ); ?></p>
		<p>
			<a class="button button-primary" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Ver la web', 'dominicos' ); ?></a>
			<a class="button" href="<?php echo esc_url( admin_url( 'customize.php' ) ); ?>"><?php esc_html_e( 'Editar los textos', 'dominicos' ); ?></a>
			<?php if ( post_type_exists( 'equipo' ) ) : ?>
				<a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=equipo&page=dominicos-club' ) ); ?>"><?php esc_html_e( 'Datos del club', 'dominicos' ); ?></a>
			<?php endif; ?>
		</p>
		<?php if ( ! post_type_exists( 'equipo' ) ) : ?>
			<p><em><?php esc_html_e( 'Falta activar el plugin Dominicos Core para que aparezcan los equipos.', 'dominicos' ); ?></em></p>
		<?php endif; ?>
	</div>
	<?php
}
add_action( 'admin_notices', 'dominicos_setup_notice' );

/**
 * Al cambiar a otro tema, se olvida la marca para que, si algún día se vuelve
 * a este, la configuración se revise otra vez.
 */
function dominicos_forget_setup() {
	delete_option( 'dominicos_setup_version' );
}
add_action( 'switch_theme', 'dominicos_forget_setup' );

/**
 * Si falta el plugin, la sección de equipos no existe. Conviene decirlo.
 */
function dominicos_missing_plugin_notice() {
	if ( post_type_exists( 'equipo' ) || ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	// Solo en las pantallas donde molesta poco y se entiende el contexto.
	if ( $screen && ! in_array( $screen->id, array( 'dashboard', 'themes', 'plugins' ), true ) ) {
		return;
	}
	?>
	<div class="notice notice-warning">
		<p>
			<strong><?php esc_html_e( 'Falta el plugin Dominicos Core.', 'dominicos' ); ?></strong>
			<?php esc_html_e( 'Sin él no hay equipos, ni datos del club, ni formulario de contacto: el resto de la web funciona igual.', 'dominicos' ); ?>
		</p>
		<p>
			<a class="button button-primary" href="<?php echo esc_url( admin_url( 'plugin-install.php?tab=upload' ) ); ?>">
				<?php esc_html_e( 'Subir el plugin', 'dominicos' ); ?>
			</a>
		</p>
	</div>
	<?php
}
add_action( 'admin_notices', 'dominicos_missing_plugin_notice' );
