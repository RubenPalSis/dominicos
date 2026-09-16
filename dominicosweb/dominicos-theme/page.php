<?php
/**
 * Página normal: El club, Historia, Instalaciones, Contacto…
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$cover = has_post_thumbnail() ? get_the_post_thumbnail_url( get_the_ID(), 'dominicos-wide' ) : '';
	$intro = has_excerpt() ? get_the_excerpt() : '';

	get_template_part(
		'template-parts/page-hero',
		null,
		array(
			'title' => get_the_title(),
			'text'  => $intro,
			'image' => $cover,
		)
	);
	?>

	<section class="section section--top">
		<div class="wrap">
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
			if ( comments_open() || get_comments_number() ) {
				comments_template();
			}
			?>
		</div>
	</section>

	<?php
endwhile;

get_footer();
