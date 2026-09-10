import {
	reactiveText
}
from "./ReactiveText.js";

/* -------------------------------- */
/* INTERPOLATION */
/* -------------------------------- */

export function createInterpolation(
	expression,
	component
) {

	return reactiveText(
		() => {

			const value =
				resolvePath(
					component,
					expression
				);

			/*
				Signal
			*/

			if (

				value &&

				typeof value.get ===
					"function"

			) {

				return value.get();
			}

			return value;
		}
	);
}

/* -------------------------------- */
/* PATH RESOLUTION */
/* -------------------------------- */

function resolvePath(
	component,
	expression
) {

	const parts =
		expression.split(
			"."
		);

	let current =
		component;

	for (
		const part
		of parts
	) {

		current =
			current?.[
				part
			];
	}

	return current;
}