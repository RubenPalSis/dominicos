<?php
/**
 * Portada del sitio.
 *
 * Reproduce el diseño de la web original, con el contenido de cada sección
 * traído del Personalizador, de las Entradas y del tipo de contenido Equipos.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

get_template_part( 'template-parts/front/hero' );

if ( dominicos_opt( 'ticker_show' ) ) {
	get_template_part( 'template-parts/front/ticker' );
}

if ( dominicos_opt( 'club_show' ) ) {
	get_template_part( 'template-parts/front/club' );
}

if ( dominicos_opt( 'equipos_show' ) && dominicos_has_equipos() ) {
	get_template_part( 'template-parts/front/equipos' );
}

if ( dominicos_opt( 'pista_show' ) ) {
	get_template_part( 'template-parts/front/pista' );
}

if ( dominicos_opt( 'noticias_show' ) ) {
	get_template_part( 'template-parts/front/noticias' );
}

if ( dominicos_opt( 'inscrip_show' ) ) {
	get_template_part( 'template-parts/front/inscripciones' );
}

if ( dominicos_opt( 'contacto_show' ) ) {
	get_template_part( 'template-parts/front/contacto' );
}

// Si la portada es una página estática con contenido escrito en el editor,
// se muestra al final para no alterar el diseño de las secciones.
if ( is_page() ) {
	while ( have_posts() ) {
		the_post();

		$dominicos_content = get_the_content();

		if ( '' !== trim( (string) $dominicos_content ) ) {
			echo '<section class="section front-extra"><div class="wrap prose reveal">';
			the_content();
			echo '</div></section>';
		}
	}
}

get_footer();
