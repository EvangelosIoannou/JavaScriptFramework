import {
	effect
}
from "../reactivity/index.js";

/* -------------------------------- */
/* IF DIRECTIVE */
/* -------------------------------- */

export function processIf(
	element,
	signal
) {

	const comment =
		document.createComment(
			"if"
		);

	const parent =
		element.parentNode;

	effect(
		() => {

			const visible =
				signal.get();

			if (
				visible
			) {

				if (
					comment.parentNode
				) {

					comment.parentNode
						.replaceChild(
							element,
							comment
						);
				}

			} else {

				if (
					element.parentNode
				) {

					element.parentNode
						.replaceChild(
							comment,
							element
						);
				}
			}
		}
	);
}