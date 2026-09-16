<?php
/**
 * Ficha de equipo, en /equipos/nombre-del-equipo/.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$categoria = function_exists( 'dominicos_equipo_categoria' ) ? dominicos_equipo_categoria() : null;
	$grupo     = function_exists( 'dominicos_equipo_grupo' ) ? dominicos_equipo_grupo() : null;
	$cover     = has_post_thumbnail() ? get_the_post_thumbnail_url( get_the_ID(), 'dominicos-wide' ) : '';
	$horarios  = function_exists( 'dominicos_equipo_horarios' ) ? dominicos_equipo_horarios() : array();

	$datos = array();

	if ( function_exists( 'dominicos_equipo_meta' ) ) {
		$posibles = array(
			'entrenador'   => __( 'Entrenador/a', 'dominicos' ),
			'entrenador_2' => __( 'Segundo entrenador/a', 'dominicos' ),
			'delegado'     => __( 'Delegado/a', 'dominicos' ),
			'competicion'  => __( 'Competición', 'dominicos' ),
			'lugar'        => __( 'Lugar de entrenamiento', 'dominicos' ),
		);

		foreach ( $posibles as $key => $label ) {
			$value = dominicos_equipo_meta( $key );

			if ( '' !== $value ) {
				$datos[ $label ] = $value;
			}
		}

		if ( $categoria ) {
			$datos = array_merge(
				array( __( 'Categoría', 'dominicos' ) => $categoria->name ),
				$datos
			);
		}
	}

	$info = function_exists( 'dominicos_equipo_meta' ) ? dominicos_equipo_meta( 'info_adicional' ) : '';
	?>

	<article <?php post_class( 'single single--equipo' ); ?>>

		<?php
		get_template_part(
			'template-parts/page-hero',
			null,
			array(
				'kicker'   => $grupo ? $grupo->name : __( 'Equipos', 'dominicos' ),
				'title'    => get_the_title(),
				'image'    => $cover,
				'back_url' => get_post_type_archive_link( 'equipo' ),
				'back_txt' => __( 'Todos los equipos', 'dominicos' ),
			)
		);
		?>

		<section class="section section--top">
			<div class="wrap grid-2 grid-2--wide">

				<div class="reveal">
					<?php if ( trim( (string) get_the_content() ) ) : ?>
						<div class="prose"><?php the_content(); ?></div>
					<?php endif; ?>

					<?php if ( $info ) : ?>
						<div class="panel panel--note">
							<p class="kicker"><?php esc_html_e( 'Información adicional', 'dominicos' ); ?></p>
							<p class="lead"><?php echo nl2br( esc_html( $info ) ); ?></p>
						</div>
					<?php endif; ?>
				</div>

				<aside class="panel reveal">
					<?php if ( $datos ) : ?>
						<p class="kicker"><?php esc_html_e( 'El equipo', 'dominicos' ); ?></p>
						<ul class="contact contact--tight">
							<?php foreach ( $datos as $label => $value ) : ?>
								<li>
									<span><?php echo esc_html( $label ); ?></span>
									<b><?php echo esc_html( $value ); ?></b>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>

					<?php if ( $horarios ) : ?>
						<p class="kicker kicker--space"><?php esc_html_e( 'Horarios', 'dominicos' ); ?></p>
						<ul class="ticks">
							<?php foreach ( $horarios as $horario ) : ?>
								<li><?php echo esc_html( $horario ); ?></li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>

					<p class="panel__cta">
						<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/#contacto' ) ); ?>">
							<?php esc_html_e( 'Preguntar por este equipo', 'dominicos' ); ?>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>
						</a>
					</p>
				</aside>

			</div>
		</section>

		<?php
		// Resto de equipos del mismo grupo.
		$hermanos_args = array(
			'post_type'           => 'equipo',
			'post_status'         => 'publish',
			'posts_per_page'      => 4,
			'post__not_in'        => array( get_the_ID() ),
			'orderby'             => array( 'menu_order' => 'ASC', 'date' => 'ASC' ),
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		);

		if ( $grupo ) {
			$hermanos_args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				array(
					'taxonomy'         => 'categoria_equipo',
					'field'            => 'term_id',
					'terms'            => $grupo->term_id,
					'include_children' => true,
				),
			);
		}

		$hermanos = new WP_Query( $hermanos_args );

		if ( $hermanos->have_posts() ) :
			?>
			<section class="section equipos">
				<div class="wrap">
					<header class="sec-head reveal">
						<div>
							<p class="kicker"><?php esc_html_e( 'Más equipos', 'dominicos' ); ?></p>
							<h2 class="h2">
								<?php
								echo $grupo
									? esc_html( $grupo->name )
									: esc_html__( 'Otros equipos', 'dominicos' );
								?>
							</h2>
						</div>
						<a class="btn btn--ghost" href="<?php echo esc_url( get_post_type_archive_link( 'equipo' ) ); ?>">
							<?php esc_html_e( 'Ver todos', 'dominicos' ); ?>
						</a>
					</header>

					<div class="cards">
						<?php
						while ( $hermanos->have_posts() ) :
							$hermanos->the_post();
							get_template_part( 'template-parts/card', 'equipo' );
						endwhile;
						wp_reset_postdata();
						?>
					</div>
				</div>
			</section>
			<?php
		endif;
		?>

	</article>

	<?php
endwhile;

get_footer();
