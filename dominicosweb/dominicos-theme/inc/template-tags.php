<?php
/**
 * Funciones que usan las plantillas.
 *
 * Todo lo que depende del plugin dominicos-core se consulta con
 * function_exists() para que el tema siga funcionando si se desactiva.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

/**
 * Valor del Personalizador con su valor por defecto.
 *
 * @param string $key      Clave del ajuste.
 * @param mixed  $fallback Valor alternativo si no hay defecto declarado.
 * @return mixed
 */
function dominicos_opt( $key, $fallback = '' ) {
	$defaults = dominicos_defaults();
	$default  = array_key_exists( $key, $defaults ) ? $defaults[ $key ] : $fallback;

	return get_theme_mod( $key, $default );
}

/**
 * Convierte un campo de varias líneas en un array limpio.
 *
 * @param string $key Clave del ajuste.
 * @return string[]
 */
function dominicos_opt_lines( $key ) {
	$raw   = (string) dominicos_opt( $key );
	$lines = preg_split( '/\r\n|\r|\n/', $raw );
	$lines = array_map( 'trim', is_array( $lines ) ? $lines : array() );

	return array_values( array_filter( $lines, 'strlen' ) );
}

/**
 * Imprime un titular admitiendo <br> y <em>.
 *
 * @param string $key Clave del ajuste.
 */
function dominicos_the_title_opt( $key ) {
	echo wp_kses(
		(string) dominicos_opt( $key ),
		array(
			'br'     => array(),
			'em'     => array(),
			'strong' => array(),
			'span'   => array( 'class' => array() ),
		)
	);
}

/**
 * URL de una imagen del Personalizador, con la del tema como respaldo.
 *
 * @param string $key      Clave del ajuste de imagen.
 * @param string $fallback Nombre del archivo en assets/images.
 * @return string
 */
function dominicos_image_url( $key, $fallback ) {
	$url = (string) dominicos_opt( $key );

	if ( '' !== $url ) {
		return $url;
	}

	return get_template_directory_uri() . '/assets/images/' . $fallback;
}

/**
 * Descompone una cifra de las estadísticas en los atributos que espera el
 * contador animado: «6000+» → data-to="6000" data-suffix="+",
 * «2009» → data-to="2009" data-plain="1" (los años no llevan separador).
 *
 * @param string $value Cifra escrita en el Personalizador.
 * @return string Atributos listos para imprimir.
 */
function dominicos_stat_attrs( $value ) {
	$value = trim( (string) $value );

	if ( ! preg_match( '/^(\d+)(.*)$/u', $value, $m ) ) {
		return '';
	}

	$number = (int) $m[1];
	$suffix = trim( $m[2] );
	$atts   = sprintf( ' data-to="%d"', $number );

	if ( '' !== $suffix ) {
		$atts .= sprintf( ' data-suffix="%s"', esc_attr( $suffix ) );
	}

	// Un número de cuatro cifras en rango de año se escribe sin punto de millar.
	if ( $number >= 1900 && $number <= 2100 && 4 === strlen( $m[1] ) ) {
		$atts .= ' data-plain="1"';
	}

	return $atts;
}

/* -------------------------------------------------------------------------
 * Puentes con el plugin dominicos-core
 * ---------------------------------------------------------------------- */

/**
 * ¿Está activo el plugin con el tipo de contenido Equipos?
 *
 * @return bool
 */
function dominicos_has_equipos() {
	return post_type_exists( 'equipo' );
}

/**
 * Dato del club, con respaldo si el plugin no está activo.
 *
 * @param string $key      Clave.
 * @param string $fallback Valor alternativo.
 * @return string
 */
function dominicos_club_data( $key, $fallback = '' ) {
	if ( function_exists( 'dominicos_club' ) ) {
		$value = dominicos_club( $key, $fallback );

		return is_string( $value ) ? $value : $fallback;
	}

	return $fallback;
}

/**
 * Email del club.
 *
 * @return string
 */
function dominicos_email() {
	$email = dominicos_club_data( 'email', get_option( 'admin_email' ) );

	return is_email( $email ) ? $email : get_option( 'admin_email' );
}

/**
 * Enlaces de contacto para la sección de contacto y el pie.
 *
 * @return array<int,array{label:string,text:string,url:string,external:bool}>
 */
function dominicos_contact_links() {
	$email     = dominicos_email();
	$whatsapp  = dominicos_club_data( 'whatsapp' );
	$telefono  = dominicos_club_data( 'telefono' );
	$instagram = dominicos_club_data( 'instagram' );
	$twitter   = dominicos_club_data( 'twitter' );
	$facebook  = dominicos_club_data( 'facebook' );
	$youtube   = dominicos_club_data( 'youtube' );

	$links = array();

	if ( $email ) {
		$links[] = array(
			'label'    => __( 'Email', 'dominicos' ),
			'text'     => $email,
			'url'      => 'mailto:' . $email,
			'external' => false,
		);
	}

	if ( $whatsapp ) {
		$links[] = array(
			'label'    => __( 'WhatsApp', 'dominicos' ),
			'text'     => $telefono ? $telefono : $whatsapp,
			'url'      => $whatsapp,
			'external' => true,
		);
	}

	foreach ( array(
		'Instagram'    => $instagram,
		'X / Twitter'  => $twitter,
		'Facebook'     => $facebook,
		'YouTube'      => $youtube,
	) as $label => $url ) {
		if ( ! $url ) {
			continue;
		}

		$handle = wp_parse_url( $url, PHP_URL_PATH );
		$handle = is_string( $handle ) ? trim( $handle, '/' ) : '';

		$links[] = array(
			'label'    => $label,
			'text'     => '' !== $handle ? '@' . $handle : $url,
			'url'      => $url,
			'external' => true,
		);
	}

	return $links;
}

/**
 * Documentos de inscripción.
 *
 * @return array<int,array{title:string,url:string,type:string}>
 */
function dominicos_documentos() {
	if ( function_exists( 'dominicos_get_documentos' ) ) {
		return dominicos_get_documentos();
	}

	return array();
}

/**
 * Grupos de equipos (términos raíz) para los chips de filtro.
 *
 * @return WP_Term[]
 */
function dominicos_grupos() {
	if ( function_exists( 'dominicos_get_grupos' ) ) {
		return dominicos_get_grupos();
	}

	return array();
}

/**
 * Slug del grupo al que pertenece un equipo, para el atributo data-cat.
 *
 * @param int|null $post_id ID del equipo.
 * @return string
 */
function dominicos_grupo_slug( $post_id = null ) {
	if ( ! function_exists( 'dominicos_equipo_grupo' ) ) {
		return '';
	}

	$term = dominicos_equipo_grupo( $post_id );

	return $term ? $term->slug : '';
}

/**
 * Etiqueta que se pinta en la tarjeta de un equipo.
 *
 * Primero la etiqueta escrita a mano en la ficha — así la tarjeta puede decir
 * «Primaria» o «Mixto» como en la web original — y, si está vacía, el nombre
 * de la categoría.
 *
 * @param int|null $post_id ID del equipo.
 * @return string
 */
function dominicos_equipo_tag( $post_id = null ) {
	if ( ! function_exists( 'dominicos_equipo_meta' ) ) {
		return '';
	}

	$etiqueta = dominicos_equipo_meta( 'etiqueta', $post_id );

	if ( '' !== $etiqueta ) {
		return $etiqueta;
	}

	if ( ! function_exists( 'dominicos_equipo_categoria' ) ) {
		return '';
	}

	$term = dominicos_equipo_categoria( $post_id );

	return $term ? $term->name : '';
}

/* -------------------------------------------------------------------------
 * Noticias
 * ---------------------------------------------------------------------- */

/**
 * URL del listado de noticias: la página asignada a las entradas o, si no
 * hay ninguna, la portada de entradas.
 *
 * @return string
 */
function dominicos_noticias_url() {
	$page_id = (int) get_option( 'page_for_posts' );

	if ( $page_id ) {
		return get_permalink( $page_id );
	}

	return home_url( '/' );
}

/**
 * Primera categoría de una entrada, saltándose «Sin categoría».
 *
 * @param int|null $post_id ID de la entrada.
 * @return WP_Term|null
 */
function dominicos_post_category( $post_id = null ) {
	$terms = get_the_category( $post_id ? (int) $post_id : get_the_ID() );

	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return null;
	}

	$default = (int) get_option( 'default_category' );

	foreach ( $terms as $term ) {
		if ( $term->term_id !== $default ) {
			return $term;
		}
	}

	return $terms[0];
}

/**
 * Extracto recortado para las tarjetas.
 *
 * @param int $words Número de palabras.
 * @return string
 */
function dominicos_excerpt( $words = 22 ) {
	$text = has_excerpt() ? get_the_excerpt() : wp_strip_all_tags( get_the_content() );
	$text = strip_shortcodes( $text );

	return wp_trim_words( $text, $words, '…' );
}

/**
 * Paginación con el aspecto del resto del sitio.
 */
function dominicos_pagination() {
	$links = paginate_links(
		array(
			'type'      => 'array',
			'mid_size'  => 1,
			'prev_text' => '← ' . __( 'Anteriores', 'dominicos' ),
			'next_text' => __( 'Siguientes', 'dominicos' ) . ' →',
		)
	);

	if ( empty( $links ) ) {
		return;
	}

	echo '<nav class="pager" aria-label="' . esc_attr__( 'Paginación', 'dominicos' ) . '">';

	foreach ( $links as $link ) {
		echo wp_kses(
			$link,
			array(
				'a'    => array( 'href' => array(), 'class' => array() ),
				'span' => array( 'class' => array(), 'aria-current' => array() ),
			)
		);
	}

	echo '</nav>';
}

/**
 * Línea de datos de una noticia: fecha y categoría.
 *
 * @param bool $with_author Incluir el autor.
 * @param bool $link_cat    Enlazar la categoría. Se desactiva dentro de las
 *                          filas de la portada, que ya son un enlace entero:
 *                          un <a> dentro de otro <a> es marcado inválido.
 */
function dominicos_post_meta( $with_author = false, $link_cat = true ) {
	$cat = dominicos_post_category();

	echo '<span class="news__d">';
	echo '<time datetime="' . esc_attr( get_the_date( DATE_W3C ) ) . '">' . esc_html( get_the_date() ) . '</time>';

	if ( $cat ) {
		echo ' <span class="news__sep" aria-hidden="true">·</span> ';

		if ( $link_cat ) {
			echo '<a class="news__cat" href="' . esc_url( get_category_link( $cat ) ) . '">' . esc_html( $cat->name ) . '</a>';
		} else {
			echo '<span class="news__cat">' . esc_html( $cat->name ) . '</span>';
		}
	}

	if ( $with_author ) {
		echo ' <span class="news__sep" aria-hidden="true">·</span> ';
		echo '<span class="news__by">' . esc_html( get_the_author() ) . '</span>';
	}

	echo '</span>';
}
