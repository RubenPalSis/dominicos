<?php
/**
 * Personalizador: todos los textos de la portada y del pie.
 *
 * Los valores por defecto son exactamente los de la web original, así que
 * nada más activar el tema la portada se ve igual que antes. A partir de ahí
 * todo es editable sin tocar código.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

/**
 * Definición de secciones y campos. De aquí salen el Personalizador, los
 * valores por defecto y el saneado.
 *
 * @return array<string,array<string,mixed>>
 */
function dominicos_customizer_config() {
	$config = array(
		'hero'        => array(
			'title'  => __( 'Portada · Hero', 'dominicos' ),
			'fields' => array(
				'hero_eyebrow'    => array( 'label' => __( 'Línea superior', 'dominicos' ), 'type' => 'text', 'default' => 'Temporada 2022–2023' ),
				'hero_l1'         => array( 'label' => __( 'Título, línea 1', 'dominicos' ), 'type' => 'text', 'default' => 'Baloncesto' ),
				'hero_l2'         => array( 'label' => __( 'Título, línea 2 (en rojo)', 'dominicos' ), 'type' => 'text', 'default' => 'Dominicos' ),
				'hero_l3'         => array( 'label' => __( 'Título, línea 3', 'dominicos' ), 'type' => 'text', 'default' => 'Zaragoza' ),
				'hero_text'       => array( 'label' => __( 'Texto', 'dominicos' ), 'type' => 'textarea', 'default' => 'Un club de barrio, de cantera y de patio. De la escuela al senior, aquí se aprende a jugar, a competir y a ser equipo.' ),
				'hero_cta1_label' => array( 'label' => __( 'Botón principal', 'dominicos' ), 'type' => 'text', 'default' => 'Inscríbete' ),
				'hero_cta1_url'   => array( 'label' => __( 'Enlace del botón principal', 'dominicos' ), 'type' => 'url', 'default' => '#inscripciones' ),
				'hero_cta2_label' => array( 'label' => __( 'Botón secundario', 'dominicos' ), 'type' => 'text', 'default' => 'Ver equipos' ),
				'hero_cta2_url'   => array( 'label' => __( 'Enlace del botón secundario', 'dominicos' ), 'type' => 'url', 'default' => '#equipos' ),
				'hero_image'      => array( 'label' => __( 'Imagen de fondo', 'dominicos' ), 'type' => 'image', 'default' => '' ),
				'hero_image_alt'  => array( 'label' => __( 'Texto alternativo de la imagen', 'dominicos' ), 'type' => 'text', 'default' => 'Partido de categoría benjamín del CB Dominicos en pista exterior' ),
			),
		),
		'ticker'      => array(
			'title'  => __( 'Portada · Marquesina', 'dominicos' ),
			'fields' => array(
				'ticker_show'  => array( 'label' => __( 'Mostrar la marquesina', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'ticker_items' => array(
					'label'   => __( 'Palabras, una por línea', 'dominicos' ),
					'type'    => 'textarea',
					'default' => "Escuela\nBenjamín\nAlevín Mixto\nPreinfantil\nInfantil\nCadete\nJunior\nSenior Fem\nSenior Masc\n3x3",
				),
			),
		),
		'club'        => array(
			'title'  => __( 'Portada · El club', 'dominicos' ),
			'fields' => array(
				'club_show'   => array( 'label' => __( 'Mostrar la sección', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'club_kicker' => array( 'label' => __( 'Antetítulo', 'dominicos' ), 'type' => 'text', 'default' => 'El club' ),
				'club_title'  => array(
					'label'       => __( 'Titular', 'dominicos' ),
					'type'        => 'rich',
					'default'     => 'Se empieza en el patio.<br><em>Se acaba siendo equipo.</em>',
					'description' => __( 'Se admiten &lt;br&gt; y &lt;em&gt;. El texto dentro de &lt;em&gt; sale en rojo.', 'dominicos' ),
				),
				'club_text_1' => array( 'label' => __( 'Párrafo 1', 'dominicos' ), 'type' => 'textarea', 'default' => 'El CB Dominicos es un club formativo de Zaragoza con equipos en todas las categorías, desde la escuela de primaria hasta el senior masculino y femenino. Competimos en la liga escolar y federada, en torneos y en el 3x3.' ),
				'club_text_2' => array( 'label' => __( 'Párrafo 2', 'dominicos' ), 'type' => 'textarea', 'default' => 'Jugamos en el patio o en el pabellón, ambos con canastas adaptables a cada categoría. Y cada partido acaba en la galería: más de 6.000 fotos de temporadas desde 2009.' ),
				'club_ticks'  => array(
					'label'   => __( 'Lista con marcas, una por línea', 'dominicos' ),
					'type'    => 'textarea',
					'default' => "Formación por encima del resultado\nEquipos mixtos en categorías base\nTorneos, convivencias y campus",
				),
				'stat_1_value' => array( 'label' => __( 'Dato 1 · cifra', 'dominicos' ), 'type' => 'text', 'default' => '10', 'description' => __( 'Se anima al entrar en pantalla. Admite sufijo, como 6000+.', 'dominicos' ) ),
				'stat_1_label' => array( 'label' => __( 'Dato 1 · texto', 'dominicos' ), 'type' => 'text', 'default' => 'categorías en competición' ),
				'stat_2_value' => array( 'label' => __( 'Dato 2 · cifra', 'dominicos' ), 'type' => 'text', 'default' => '6000+' ),
				'stat_2_label' => array( 'label' => __( 'Dato 2 · texto', 'dominicos' ), 'type' => 'text', 'default' => 'fotos en el archivo del club' ),
				'stat_3_value' => array( 'label' => __( 'Dato 3 · cifra', 'dominicos' ), 'type' => 'text', 'default' => '2009' ),
				'stat_3_label' => array( 'label' => __( 'Dato 3 · texto', 'dominicos' ), 'type' => 'text', 'default' => 'temporadas documentadas desde' ),
				'stat_4_value' => array( 'label' => __( 'Dato 4 · cifra', 'dominicos' ), 'type' => 'text', 'default' => '2' ),
				'stat_4_label' => array( 'label' => __( 'Dato 4 · texto', 'dominicos' ), 'type' => 'text', 'default' => 'pistas: patio y pabellón' ),
			),
		),
		'equipos'     => array(
			'title'  => __( 'Portada · Equipos', 'dominicos' ),
			'fields' => array(
				'equipos_show'   => array( 'label' => __( 'Mostrar la sección', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'equipos_kicker' => array( 'label' => __( 'Antetítulo', 'dominicos' ), 'type' => 'text', 'default' => 'Equipos' ),
				'equipos_title'  => array( 'label' => __( 'Titular', 'dominicos' ), 'type' => 'rich', 'default' => 'Una categoría para cada edad' ),
				'equipos_count'  => array( 'label' => __( 'Cuántos equipos mostrar', 'dominicos' ), 'type' => 'number', 'default' => 12, 'description' => __( 'Usa -1 para mostrarlos todos.', 'dominicos' ) ),
				'equipos_link'   => array( 'label' => __( 'Mostrar enlace al listado completo', 'dominicos' ), 'type' => 'checkbox', 'default' => false ),
			),
		),
		'pista'       => array(
			'title'  => __( 'Portada · Pista', 'dominicos' ),
			'fields' => array(
				'pista_show'      => array( 'label' => __( 'Mostrar la sección', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'pista_kicker'    => array( 'label' => __( 'Antetítulo', 'dominicos' ), 'type' => 'text', 'default' => 'Entrenamientos' ),
				'pista_title'     => array( 'label' => __( 'Titular', 'dominicos' ), 'type' => 'rich', 'default' => 'Horarios y calendario' ),
				'pista_text'      => array( 'label' => __( 'Texto', 'dominicos' ), 'type' => 'textarea', 'default' => 'El calendario de entrenamientos de la temporada 2022–2023 se publica al inicio de curso. Cada equipo lo recibe además por su responsable.' ),
				'pista_pill'      => array( 'label' => __( 'Etiqueta de la nota', 'dominicos' ), 'type' => 'text', 'default' => 'Próximamente' ),
				'pista_note'      => array( 'label' => __( 'Nota', 'dominicos' ), 'type' => 'text', 'default' => 'Consulta con el responsable de tu equipo o escríbenos.' ),
				'pista_btn_label' => array( 'label' => __( 'Botón', 'dominicos' ), 'type' => 'text', 'default' => 'Preguntar horarios' ),
				'pista_btn_url'   => array( 'label' => __( 'Enlace del botón', 'dominicos' ), 'type' => 'url', 'default' => '#contacto' ),
				'pista_image'     => array( 'label' => __( 'Foto', 'dominicos' ), 'type' => 'image', 'default' => '' ),
				'pista_cap_title' => array( 'label' => __( 'Pie de foto · título', 'dominicos' ), 'type' => 'text', 'default' => 'Instalaciones' ),
				'pista_cap_text'  => array( 'label' => __( 'Pie de foto · texto', 'dominicos' ), 'type' => 'text', 'default' => 'Patio y pabellón, con canastas adaptables a cada categoría.' ),
			),
		),
		'noticias'    => array(
			'title'  => __( 'Portada · Noticias', 'dominicos' ),
			'fields' => array(
				'noticias_show'   => array( 'label' => __( 'Mostrar la sección', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'noticias_kicker' => array( 'label' => __( 'Antetítulo', 'dominicos' ), 'type' => 'text', 'default' => 'Noticias' ),
				'noticias_title'  => array( 'label' => __( 'Titular', 'dominicos' ), 'type' => 'rich', 'default' => 'Lo último en la pista' ),
				'noticias_count'  => array( 'label' => __( 'Cuántas noticias mostrar', 'dominicos' ), 'type' => 'number', 'default' => 3 ),
				'noticias_thumb'  => array(
					'label'       => __( 'Mostrar miniatura', 'dominicos' ),
					'type'        => 'checkbox',
					'default'     => false,
					'description' => __( 'Añade la imagen destacada a cada fila. Desactivado reproduce el diseño original.', 'dominicos' ),
				),
				'noticias_link'   => array( 'label' => __( 'Mostrar enlace a todas las noticias', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
			),
		),
		'inscripciones' => array(
			'title'  => __( 'Portada · Inscripciones', 'dominicos' ),
			'fields' => array(
				'inscrip_show'      => array( 'label' => __( 'Mostrar la sección', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'inscrip_kicker'    => array( 'label' => __( 'Antetítulo', 'dominicos' ), 'type' => 'text', 'default' => 'Inscripciones 2022–2023' ),
				'inscrip_title'     => array( 'label' => __( 'Titular', 'dominicos' ), 'type' => 'rich', 'default' => 'Ven a jugar<br>con nosotros' ),
				'inscrip_text'      => array( 'label' => __( 'Texto', 'dominicos' ), 'type' => 'textarea', 'default' => 'Descarga la ficha de tu categoría, rellénala y envíala por correo o entrégasela al responsable de tu equipo.' ),
				'inscrip_btn_label' => array( 'label' => __( 'Botón', 'dominicos' ), 'type' => 'text', 'default' => 'Enviar inscripción' ),
				'inscrip_btn_url'   => array( 'label' => __( 'Enlace del botón', 'dominicos' ), 'type' => 'url', 'default' => '', 'description' => __( 'Si se deja vacío se compone un correo al email del club.', 'dominicos' ) ),
			),
		),
		'contacto'    => array(
			'title'  => __( 'Portada · Contacto', 'dominicos' ),
			'fields' => array(
				'contacto_show'   => array( 'label' => __( 'Mostrar la sección', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'contacto_kicker' => array( 'label' => __( 'Antetítulo', 'dominicos' ), 'type' => 'text', 'default' => 'Contacto' ),
				'contacto_title'  => array( 'label' => __( 'Titular', 'dominicos' ), 'type' => 'rich', 'default' => 'Escríbenos' ),
				'contacto_text'   => array( 'label' => __( 'Texto', 'dominicos' ), 'type' => 'textarea', 'default' => 'Para dudas sobre equipos, horarios, inscripciones o cualquier otra cosa.' ),
				'contacto_form'   => array( 'label' => __( 'Mostrar el formulario', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'contacto_cats'   => array(
					'label'   => __( 'Categorías del formulario, una por línea', 'dominicos' ),
					'type'    => 'textarea',
					'default' => "Escuela\nBenjamín\nAlevín\nPreinfantil\nInfantil\nCadete\nJunior\nSenior Femenino\nSenior Masculino\nOtra consulta",
				),
			),
		),
		'identidad'   => array(
			'title'  => __( 'Cabecera y pie', 'dominicos' ),
			'fields' => array(
				'brand_name'    => array( 'label' => __( 'Nombre en la cabecera', 'dominicos' ), 'type' => 'text', 'default' => 'Dominicos', 'description' => __( 'Va en grande junto al escudo. Si se deja vacío se usa el nombre del sitio.', 'dominicos' ) ),
				'brand_tagline' => array( 'label' => __( 'Bajada de la cabecera', 'dominicos' ), 'type' => 'text', 'default' => 'Zaragoza · Baloncesto' ),
				'theme_toggle'  => array( 'label' => __( 'Mostrar el botón de tema claro/oscuro', 'dominicos' ), 'type' => 'checkbox', 'default' => true ),
				'foot_name'     => array( 'label' => __( 'Nombre en el pie', 'dominicos' ), 'type' => 'text', 'default' => 'Club Baloncesto Dominicos' ),
				'foot_place'    => array( 'label' => __( 'Localidad en el pie', 'dominicos' ), 'type' => 'text', 'default' => 'Zaragoza' ),
				'foot_legal'    => array(
					'label'       => __( 'Línea legal del pie', 'dominicos' ),
					'type'        => 'text',
					'default'     => 'CB Dominicos Zaragoza',
					'description' => __( 'Se antepone «© año». Los enlaces legales se gestionan con el menú del pie.', 'dominicos' ),
				),
			),
		),
	);

	return apply_filters( 'dominicos_customizer_config', $config );
}

/**
 * Valores por defecto en un solo array plano.
 *
 * @return array<string,mixed>
 */
function dominicos_defaults() {
	static $defaults = null;

	if ( null !== $defaults ) {
		return $defaults;
	}

	$defaults = array();

	foreach ( dominicos_customizer_config() as $section ) {
		foreach ( $section['fields'] as $key => $field ) {
			$defaults[ $key ] = $field['default'];
		}
	}

	return $defaults;
}

/**
 * Registra el panel del Personalizador.
 *
 * @param WP_Customize_Manager $wp_customize Gestor del Personalizador.
 */
function dominicos_customize_register( $wp_customize ) {
	$wp_customize->add_panel(
		'dominicos',
		array(
			'title'       => __( 'Dominicos', 'dominicos' ),
			'description' => __( 'Textos e imágenes del diseño del club.', 'dominicos' ),
			'priority'    => 20,
		)
	);

	$priority = 10;

	foreach ( dominicos_customizer_config() as $section_id => $section ) {
		$wp_customize->add_section(
			'dominicos_' . $section_id,
			array(
				'title'    => $section['title'],
				'panel'    => 'dominicos',
				'priority' => $priority,
			)
		);

		$priority += 10;

		foreach ( $section['fields'] as $key => $field ) {
			$wp_customize->add_setting(
				$key,
				array(
					'default'           => $field['default'],
					'type'              => 'theme_mod',
					'capability'        => 'edit_theme_options',
					'transport'         => 'refresh',
					'sanitize_callback' => dominicos_sanitize_callback( $field['type'] ),
				)
			);

			$control = array(
				'label'       => $field['label'],
				'section'     => 'dominicos_' . $section_id,
				'description' => isset( $field['description'] ) ? $field['description'] : '',
			);

			switch ( $field['type'] ) {
				case 'image':
					$wp_customize->add_control(
						new WP_Customize_Image_Control( $wp_customize, $key, $control )
					);
					break;

				case 'textarea':
				case 'rich':
					$control['type'] = 'textarea';
					$wp_customize->add_control( $key, $control );
					break;

				case 'checkbox':
					$control['type'] = 'checkbox';
					$wp_customize->add_control( $key, $control );
					break;

				case 'number':
					$control['type']        = 'number';
					$control['input_attrs'] = array( 'min' => -1, 'step' => 1 );
					$wp_customize->add_control( $key, $control );
					break;

				case 'url':
					$control['type'] = 'text';
					$wp_customize->add_control( $key, $control );
					break;

				default:
					$control['type'] = 'text';
					$wp_customize->add_control( $key, $control );
			}
		}
	}
}
add_action( 'customize_register', 'dominicos_customize_register' );

/**
 * Función de saneado según el tipo de campo.
 *
 * @param string $type Tipo declarado en la configuración.
 * @return callable
 */
function dominicos_sanitize_callback( $type ) {
	switch ( $type ) {
		case 'textarea':
			return 'sanitize_textarea_field';
		case 'rich':
			return 'dominicos_sanitize_rich';
		case 'checkbox':
			return 'dominicos_sanitize_checkbox';
		case 'number':
			return 'dominicos_sanitize_int';
		case 'url':
			return 'dominicos_sanitize_link';
		case 'image':
			return 'esc_url_raw';
		default:
			return 'sanitize_text_field';
	}
}

/**
 * Titulares: solo se permiten saltos y énfasis.
 *
 * @param string $value Valor enviado.
 * @return string
 */
function dominicos_sanitize_rich( $value ) {
	return wp_kses(
		$value,
		array(
			'br'     => array(),
			'em'     => array(),
			'strong' => array(),
			'span'   => array( 'class' => array() ),
		)
	);
}

/**
 * @param mixed $value Valor enviado.
 * @return bool
 */
function dominicos_sanitize_checkbox( $value ) {
	return (bool) $value;
}

/**
 * @param mixed $value Valor enviado.
 * @return int
 */
function dominicos_sanitize_int( $value ) {
	return (int) $value;
}

/**
 * Acepta tanto URLs como anclas internas (#equipos) y mailto:.
 *
 * @param string $value Valor enviado.
 * @return string
 */
function dominicos_sanitize_link( $value ) {
	$value = trim( (string) $value );

	if ( '' === $value ) {
		return '';
	}

	if ( 0 === strpos( $value, '#' ) ) {
		return '#' . sanitize_title( substr( $value, 1 ) );
	}

	return esc_url_raw( $value, array( 'http', 'https', 'mailto', 'tel' ) );
}
