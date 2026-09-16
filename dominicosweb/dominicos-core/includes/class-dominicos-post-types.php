<?php
/**
 * Tipos de contenido y taxonomías propias del club.
 *
 * @package Dominicos_Core
 */

defined( 'ABSPATH' ) || exit;

class Dominicos_Post_Types {

	const POST_TYPE = 'equipo';
	const TAXONOMY  = 'categoria_equipo';

	public static function init() {
		// La taxonomía se registra antes que el tipo de contenido para que su
		// regla de reescritura (/equipos/categoria/…) gane a la de la ficha
		// individual (/equipos/…), que si no se la comería.
		add_action( 'init', array( __CLASS__, 'register_taxonomies' ), 9 );
		add_action( 'init', array( __CLASS__, 'register_post_types' ), 10 );
		add_filter( 'post_type_link', array( __CLASS__, 'filter_permalink' ), 10, 2 );
		add_filter( 'enter_title_here', array( __CLASS__, 'filter_title_placeholder' ), 10, 2 );
	}

	/**
	 * CPT Equipos. El archivo vive en /equipos/ y cada ficha en /equipos/slug/.
	 */
	public static function register_post_types() {
		$labels = array(
			'name'                  => __( 'Equipos', 'dominicos-core' ),
			'singular_name'         => __( 'Equipo', 'dominicos-core' ),
			'menu_name'             => __( 'Equipos', 'dominicos-core' ),
			'add_new'               => __( 'Añadir nuevo', 'dominicos-core' ),
			'add_new_item'          => __( 'Añadir nuevo equipo', 'dominicos-core' ),
			'edit_item'             => __( 'Editar equipo', 'dominicos-core' ),
			'new_item'              => __( 'Nuevo equipo', 'dominicos-core' ),
			'view_item'             => __( 'Ver equipo', 'dominicos-core' ),
			'view_items'            => __( 'Ver equipos', 'dominicos-core' ),
			'search_items'          => __( 'Buscar equipos', 'dominicos-core' ),
			'not_found'             => __( 'No hay equipos todavía', 'dominicos-core' ),
			'not_found_in_trash'    => __( 'No hay equipos en la papelera', 'dominicos-core' ),
			'all_items'             => __( 'Todos los equipos', 'dominicos-core' ),
			'archives'              => __( 'Archivo de equipos', 'dominicos-core' ),
			'featured_image'        => __( 'Foto del equipo', 'dominicos-core' ),
			'set_featured_image'    => __( 'Establecer foto del equipo', 'dominicos-core' ),
			'remove_featured_image' => __( 'Quitar foto del equipo', 'dominicos-core' ),
			'use_featured_image'    => __( 'Usar como foto del equipo', 'dominicos-core' ),
		);

		register_post_type(
			self::POST_TYPE,
			array(
				'labels'             => $labels,
				'public'             => true,
				'publicly_queryable' => true,
				'show_ui'            => true,
				'show_in_menu'       => true,
				'show_in_rest'       => true,
				'show_in_nav_menus'  => true,
				'menu_position'      => 21,
				'menu_icon'          => 'dashicons-groups',
				'hierarchical'       => false,
				'has_archive'        => 'equipos',
				'rewrite'            => array(
					'slug'       => 'equipos',
					'with_front' => false,
				),
				'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'page-attributes', 'revisions', 'custom-fields' ),
				'taxonomies'         => array( self::TAXONOMY ),
			)
		);
	}

	/**
	 * Taxonomía jerárquica de categorías de equipo.
	 *
	 * Los términos de primer nivel (Base, Formación, Senior) son los que
	 * alimentan los filtros del listado. Los hijos (Escuela, Benjamín…) son
	 * la categoría concreta que se pinta en la tarjeta.
	 */
	public static function register_taxonomies() {
		$labels = array(
			'name'              => __( 'Categorías de equipo', 'dominicos-core' ),
			'singular_name'     => __( 'Categoría de equipo', 'dominicos-core' ),
			'menu_name'         => __( 'Categorías', 'dominicos-core' ),
			'all_items'         => __( 'Todas las categorías', 'dominicos-core' ),
			'edit_item'         => __( 'Editar categoría', 'dominicos-core' ),
			'update_item'       => __( 'Actualizar categoría', 'dominicos-core' ),
			'add_new_item'      => __( 'Añadir nueva categoría', 'dominicos-core' ),
			'new_item_name'     => __( 'Nombre de la nueva categoría', 'dominicos-core' ),
			'parent_item'       => __( 'Grupo superior', 'dominicos-core' ),
			'parent_item_colon' => __( 'Grupo superior:', 'dominicos-core' ),
			'search_items'      => __( 'Buscar categorías', 'dominicos-core' ),
		);

		register_taxonomy(
			self::TAXONOMY,
			array( self::POST_TYPE ),
			array(
				'labels'            => $labels,
				'public'            => true,
				'hierarchical'      => true,
				'show_ui'           => true,
				'show_in_rest'      => true,
				'show_admin_column' => true,
				'show_in_nav_menus' => true,
				'rewrite'           => array(
					'slug'       => 'equipos/categoria',
					'with_front' => false,
				),
			)
		);
	}

	/**
	 * Categorías sembradas en la activación. Se pueden renombrar, borrar o
	 * ampliar desde el panel: solo se crean si la taxonomía está vacía.
	 *
	 * @return array<string,int> Mapa slug => term_id de los términos creados.
	 */
	public static function seed_default_terms() {
		$existing = get_terms(
			array(
				'taxonomy'   => self::TAXONOMY,
				'hide_empty' => false,
				'fields'     => 'ids',
			)
		);

		if ( is_wp_error( $existing ) || ! empty( $existing ) ) {
			return array();
		}

		$tree = array(
			'Base'      => array( 'Escuela', 'Benjamín', 'Alevín' ),
			'Formación' => array( 'Preinfantil', 'Infantil', 'Cadete', 'Junior' ),
			'Senior'    => array( 'Senior Femenino', 'Senior Masculino' ),
		);

		$created = array();

		foreach ( $tree as $parent_name => $children ) {
			$parent = wp_insert_term( $parent_name, self::TAXONOMY );

			if ( is_wp_error( $parent ) ) {
				continue;
			}

			$created[ get_term( $parent['term_id'] )->slug ] = $parent['term_id'];

			foreach ( $children as $child_name ) {
				$child = wp_insert_term( $child_name, self::TAXONOMY, array( 'parent' => $parent['term_id'] ) );

				if ( ! is_wp_error( $child ) ) {
					$created[ get_term( $child['term_id'] )->slug ] = $child['term_id'];
				}
			}
		}

		return $created;
	}

	/**
	 * Evita el doble prefijo /equipos/equipos/ si alguien cambia el slug base.
	 *
	 * @param string  $permalink Enlace generado.
	 * @param WP_Post $post      Entrada.
	 * @return string
	 */
	public static function filter_permalink( $permalink, $post ) {
		if ( self::POST_TYPE !== $post->post_type ) {
			return $permalink;
		}

		return str_replace( '/equipos/equipos/', '/equipos/', $permalink );
	}

	/**
	 * @param string  $text Texto del marcador de posición.
	 * @param WP_Post $post Entrada en edición.
	 * @return string
	 */
	public static function filter_title_placeholder( $text, $post ) {
		if ( isset( $post->post_type ) && self::POST_TYPE === $post->post_type ) {
			return __( 'Nombre del equipo (ej. Infantil Femenino)', 'dominicos-core' );
		}

		return $text;
	}
}
