<?php
/**
 * Soportes del tema, menús y tamaños de imagen.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registra todo lo que el tema declara soportar.
 */
function dominicos_setup() {
	load_theme_textdomain( 'dominicos', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' )
	);
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 88,
			'width'       => 88,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	// La paleta del escudo, disponible también en el editor de bloques.
	add_theme_support(
		'editor-color-palette',
		array(
			array(
				'name'  => __( 'Rojo dominico', 'dominicos' ),
				'slug'  => 'rojo',
				'color' => '#e01f26',
			),
			array(
				'name'  => __( 'Rojo claro', 'dominicos' ),
				'slug'  => 'rojo-claro',
				'color' => '#ff4b52',
			),
			array(
				'name'  => __( 'Negro pista', 'dominicos' ),
				'slug'  => 'negro',
				'color' => '#0b0c0f',
			),
			array(
				'name'  => __( 'Gris texto', 'dominicos' ),
				'slug'  => 'gris',
				'color' => '#a2a8b5',
			),
			array(
				'name'  => __( 'Blanco', 'dominicos' ),
				'slug'  => 'blanco',
				'color' => '#ffffff',
			),
		)
	);

	register_nav_menus(
		array(
			'primary' => __( 'Menú principal (cabecera)', 'dominicos' ),
			'footer'  => __( 'Menú del pie', 'dominicos' ),
		)
	);

	// Recortes usados por las tarjetas y las cabeceras de noticia.
	add_image_size( 'dominicos-card', 720, 900, true );    // 4:5, tarjetas de equipo.
	add_image_size( 'dominicos-news', 960, 640, true );    // 3:2, tarjetas de noticia.
	add_image_size( 'dominicos-wide', 1800, 900, true );   // 2:1, cabeceras.
}
add_action( 'after_setup_theme', 'dominicos_setup' );

/**
 * Ancho del contenido por defecto.
 */
function dominicos_content_width() {
	$GLOBALS['content_width'] = 1200;
}
add_action( 'after_setup_theme', 'dominicos_content_width', 0 );

/**
 * Zona de widgets del pie, opcional.
 */
function dominicos_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Pie de página', 'dominicos' ),
			'id'            => 'footer',
			'description'   => __( 'Se muestra sobre la línea legal del pie.', 'dominicos' ),
			'before_widget' => '<div id="%1$s" class="foot__widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h2 class="foot__widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'dominicos_widgets_init' );

/**
 * Longitud del extracto automático, pensada para las tarjetas.
 *
 * @param int $length Longitud por defecto.
 * @return int
 */
function dominicos_excerpt_length( $length ) {
	return is_admin() ? $length : 24;
}
add_filter( 'excerpt_length', 'dominicos_excerpt_length' );

/**
 * @param string $more Texto de continuación.
 * @return string
 */
function dominicos_excerpt_more( $more ) {
	return is_admin() ? $more : '…';
}
add_filter( 'excerpt_more', 'dominicos_excerpt_more' );

/**
 * Clases extra en el body para poder afinar estilos por contexto.
 *
 * @param string[] $classes Clases actuales.
 * @return string[]
 */
function dominicos_body_class( $classes ) {
	if ( ! is_front_page() ) {
		$classes[] = 'has-fixed-nav';
	}

	if ( is_singular() && has_post_thumbnail() ) {
		$classes[] = 'has-cover';
	}

	return $classes;
}
add_filter( 'body_class', 'dominicos_body_class' );

/**
 * El tema oscuro se aplica en <html data-theme>. Como el atributo lo escribe
 * PHP y el JS lo puede cambiar antes de pintar, evitamos el parpadeo inicial
 * inyectando la preferencia guardada lo antes posible.
 */
function dominicos_theme_preference_script() {
	?>
	<script>
	(function(){try{var t=localStorage.getItem('dom-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
	</script>
	<?php
}
add_action( 'wp_head', 'dominicos_theme_preference_script', 1 );

/**
 * Favicon del club cuando no se ha configurado un icono del sitio.
 */
function dominicos_fallback_favicon() {
	if ( has_site_icon() ) {
		return;
	}

	printf(
		'<link rel="icon" href="%s">' . "\n",
		esc_url( get_template_directory_uri() . '/assets/images/favicon.jpg' )
	);
}
add_action( 'wp_head', 'dominicos_fallback_favicon' );

/**
 * Número de noticias por página en el listado, configurable desde el
 * Personalizador sin tocar los ajustes globales de lectura.
 *
 * @param WP_Query $query Consulta principal.
 */
function dominicos_pre_get_posts( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}

	if ( $query->is_post_type_archive( 'equipo' ) || $query->is_tax( 'categoria_equipo' ) ) {
		$query->set( 'posts_per_page', -1 );
		$query->set( 'orderby', array( 'menu_order' => 'ASC', 'date' => 'ASC' ) );
	}
}
add_action( 'pre_get_posts', 'dominicos_pre_get_posts' );
