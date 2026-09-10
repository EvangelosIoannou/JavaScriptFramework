import {
	effect
}
from "./Effect.js";

/* -------------------------------- */
/* REACTIVE TEXT */
/* -------------------------------- */

export function reactiveText(
	getter
) {

	const node =
		document.createTextNode(
			""
		);

	effect(
		() => {

			const value =
				getter();

			node.textContent =
				value ?? "";
		}
	);

	return node;
}

/* -------------------------------- */
/* IS SIGNAL */
/* -------------------------------- */

export function isSignal(
	value
) {

	return (

		value &&

		typeof value.get ===
			"function"

	);
}