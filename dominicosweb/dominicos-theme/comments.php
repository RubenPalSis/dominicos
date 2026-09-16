<?php
/**
 * Comentarios.
 *
 * @package Dominicos
 */

defined( 'ABSPATH' ) || exit;

if ( post_password_required() ) {
	return;
}
?>
<div id="comments" class="comments">
	<?php if ( have_comments() ) : ?>
		<h2 class="h2 h2--sm">
			<?php
			$dominicos_count = (int) get_comments_number();

			printf(
				/* translators: %d: número de comentarios. */
				esc_html( _n( '%d comentario', '%d comentarios', $dominicos_count, 'dominicos' ) ),
				(int) $dominicos_count
			);
			?>
		</h2>

		<ol class="comment-list">
			<?php
			wp_list_comments(
				array(
					'style'      => 'ol',
					'short_ping' => true,
					'avatar_size' => 44,
				)
			);
			?>
		</ol>

		<?php
		the_comments_pagination(
			array(
				'prev_text' => '&larr; ' . __( 'Anteriores', 'dominicos' ),
				'next_text' => __( 'Siguientes', 'dominicos' ) . ' &rarr;',
			)
		);
		?>
	<?php endif; ?>

	<?php
	comment_form(
		array(
			'title_reply'        => __( 'Deja un comentario', 'dominicos' ),
			'class_submit'       => 'submit btn btn--primary',
			'comment_notes_before' => '',
		)
	);
	?>
</div>
