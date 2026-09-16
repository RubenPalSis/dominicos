<?php
/**
 * Arranque del tema Dominicos.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

define( 'DOMINICOS_VERSION', '1.0.0' );

require_once get_template_directory() . '/inc/setup.php';
require_once get_template_directory() . '/inc/enqueue.php';
require_once get_template_directory() . '/inc/nav-walker.php';
require_once get_template_directory() . '/inc/template-tags.php';
require_once get_template_directory() . '/inc/customizer.php';
require_once get_template_directory() . '/inc/setup-wizard.php';
