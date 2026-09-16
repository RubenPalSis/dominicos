<?php
/**
 * Carga de hojas de estilo, scripts y fuentes.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

/**
 * Encola los recursos del front. El orden importa: primero las fuentes de
 * Google, luego la hoja de la web original y por último style.css, que solo
 * añade lo propio de WordPress.
 */
function dominicos_enqueue_assets() {
	$dir = get_template_directory();
	$uri = get_template_directory_uri();

	wp_enqueue_style(
		'dominicos-fonts',
		'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=Archivo+Black&display=swap',
		array(),
		null // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- recurso externo versionado por Google.
	);

	wp_enqueue_style(
		'dominicos-main',
		$uri . '/assets/css/main.css',
		array( 'dominicos-fonts' ),
		dominicos_asset_version( $dir . '/assets/css/main.css' )
	);

	wp_enqueue_style(
		'dominicos-style',
		get_stylesheet_uri(),
		array( 'dominicos-main' ),
		dominicos_asset_version( get_stylesheet_directory() . '/style.css' )
	);

	wp_enqueue_script(
		'dominicos-main',
		$uri . '/assets/js/main.js',
		array(),
		dominicos_asset_version( $dir . '/assets/js/main.js' ),
		true
	);

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'dominicos_enqueue_assets' );

/**
 * Precarga de las fuentes, igual que hacía el HTML original.
 */
function dominicos_resource_hints_output() {
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}
add_action( 'wp_head', 'dominicos_resource_hints_output', 2 );

/**
 * Versión de un recurso a partir de su fecha de modificación, para que el
 * navegador no sirva una versión cacheada tras cada despliegue.
 *
 * @param string $path Ruta absoluta del archivo.
 * @return string
 */
function dominicos_asset_version( $path ) {
	$mtime = file_exists( $path ) ? filemtime( $path ) : false;

	return $mtime ? (string) $mtime : DOMINICOS_VERSION;
}

/**
 * Estilos del editor para que el contenido se escriba con la tipografía y los
 * colores reales del sitio.
 */
function dominicos_editor_styles() {
	add_editor_style( 'assets/css/editor.css' );
}
add_action( 'after_setup_theme', 'dominicos_editor_styles' );
