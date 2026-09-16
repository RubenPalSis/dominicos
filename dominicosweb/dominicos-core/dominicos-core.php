<?php
/**
 * Plugin Name:       Dominicos Core
 * Plugin URI:        https://baloncestodominicos.es/
 * Description:       Funcionalidad propia del CB Dominicos Zaragoza: equipos, categorías, datos del club, documentos de inscripción y formulario de contacto. Independiente del tema.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            CB Dominicos Zaragoza
 * License:           GPL-2.0-or-later
 * Text Domain:       dominicos-core
 */

defined( 'ABSPATH' ) || exit;

define( 'DOMINICOS_CORE_VERSION', '1.0.0' );
define( 'DOMINICOS_CORE_FILE', __FILE__ );
define( 'DOMINICOS_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'DOMINICOS_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once DOMINICOS_CORE_PATH . 'includes/helpers.php';
require_once DOMINICOS_CORE_PATH . 'includes/class-dominicos-post-types.php';
require_once DOMINICOS_CORE_PATH . 'includes/class-dominicos-meta.php';
require_once DOMINICOS_CORE_PATH . 'includes/class-dominicos-settings.php';
require_once DOMINICOS_CORE_PATH . 'includes/class-dominicos-contact.php';
require_once DOMINICOS_CORE_PATH . 'includes/class-dominicos-seed.php';

/**
 * Arranca todos los módulos del plugin.
 */
function dominicos_core_bootstrap() {
	Dominicos_Post_Types::init();
	Dominicos_Meta::init();
	Dominicos_Settings::init();
	Dominicos_Contact::init();
	Dominicos_Seed::init();
}
add_action( 'plugins_loaded', 'dominicos_core_bootstrap' );

/**
 * Al activar: registra los tipos de contenido, siembra las categorías por
 * defecto y refresca los enlaces permanentes para que /equipos/ funcione.
 */
function dominicos_core_activate() {
	Dominicos_Post_Types::register_taxonomies();
	Dominicos_Post_Types::register_post_types();
	Dominicos_Post_Types::seed_default_terms();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'dominicos_core_activate' );

/**
 * Al desactivar solo se limpian las reglas de reescritura. El contenido
 * (equipos, categorías y ajustes) se conserva siempre.
 */
function dominicos_core_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'dominicos_core_deactivate' );
