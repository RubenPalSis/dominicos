<?php
/**
 * Noticia individual.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$cat   = dominicos_post_category();
	$cover = has_post_thumbnail() ? get_the_post_thumbnail_url( get_the_ID(), 'dominicos-wide' ) : '';
	?>

	<article <?php post_class( 'single' ); ?>>

		<?php
		get_template_part(
			'template-parts/page-hero',
			null,
			array(
				'kicker'   => $cat ? $cat->name : __( 'Noticias', 'dominicos' ),
				'title'    => get_the_title(),
				'image'    => $cover,
				'back_url' => dominicos_noticias_url(),
				'back_txt' => __( 'Noticias', 'dominicos' ),
			)
		);
		?>

		<section class="section section--top">
			<div class="wrap">

				<p class="single__meta">
					<?php dominicos_post_meta( true ); ?>
				</p>

				<div class="prose reveal">
					<?php
					the_content();

					wp_link_pages(
						array(
							'before' => '<nav class="pager">',
							'after'  => '</nav>',
						)
					);
					?>
				</div>

				<?php
				$tags = get_the_tag_list( '', '', '' );

				if ( $tags && ! is_wp_error( $tags ) ) :
					?>
					<p class="single__tags">
						<?php
						echo wp_kses(
							$tags,
							array(
								'a' => array(
									'href'  => array(),
									'rel'   => array(),
									'class' => array(),
								),
							)
						);
						?>
					</p>
				<?php endif; ?>

				<?php
				$prev = get_previous_post();
				$next = get_next_post();

				if ( $prev || $next ) :
					?>
					<nav class="adjacent" aria-label="<?php esc_attr_e( 'Más noticias', 'dominicos' ); ?>">
						<?php if ( $prev ) : ?>
							<a class="adjacent__it" href="<?php echo esc_url( get_permalink( $prev ) ); ?>" rel="prev">
								<span class="news__d"><?php esc_html_e( 'Noticia anterior', 'dominicos' ); ?></span>
								<b><?php echo esc_html( get_the_title( $prev ) ); ?></b>
							</a>
						<?php endif; ?>

						<?php if ( $next ) : ?>
							<a class="adjacent__it adjacent__it--next" href="<?php echo esc_url( get_permalink( $next ) ); ?>" rel="next">
								<span class="news__d"><?php esc_html_e( 'Noticia siguiente', 'dominicos' ); ?></span>
								<b><?php echo esc_html( get_the_title( $next ) ); ?></b>
							</a>
						<?php endif; ?>
					</nav>
				<?php endif; ?>

			</div>
		</section>

		<?php
		// Relacionadas: misma categoría y, si no hay suficientes, las últimas.
		$related_args = array(
			'post_type'           => 'post',
			'post_status'         => 'publish',
			'posts_per_page'      => 3,
			'post__not_in'        => array( get_the_ID() ),
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		);

		if ( $cat ) {
			$related_args['cat'] = $cat->term_id;
		}

		$related = new WP_Query( $related_args );

		if ( ! $related->have_posts() && $cat ) {
			unset( $related_args['cat'] );
			$related = new WP_Query( $related_args );
		}

		if ( $related->have_posts() ) :
			?>
			<section class="section equipos">
				<div class="wrap">
					<header class="sec-head reveal">
						<div>
							<p class="kicker"><?php esc_html_e( 'Sigue leyendo', 'dominicos' ); ?></p>
							<h2 class="h2"><?php esc_html_e( 'Noticias relacionadas', 'dominicos' ); ?></h2>
						</div>
						<a class="btn btn--ghost" href="<?php echo esc_url( dominicos_noticias_url() ); ?>">
							<?php esc_html_e( 'Todas las noticias', 'dominicos' ); ?>
						</a>
					</header>

					<div class="ncards">
						<?php
						while ( $related->have_posts() ) :
							$related->the_post();
							get_template_part( 'template-parts/card', 'noticia' );
						endwhile;
						wp_reset_postdata();
						?>
					</div>
				</div>
			</section>
			<?php
		endif;
		?>

		<?php
		if ( comments_open() || get_comments_number() ) {
			echo '<section class="section section--top"><div class="wrap prose">';
			comments_template();
			echo '</div></section>';
		}
		?>

	</article>

	<?php
endwhile;

get_footer();
