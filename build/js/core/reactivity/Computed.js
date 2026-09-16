import {
	signal
}
from "./Signal.js";

import {
	effect
}
from "./Effect.js";

/* -------------------------------- */
/* COMPUTED */
/* -------------------------------- */

export function computed(
	getter
) {

	const result =
		signal(
			undefined
		);

	let initialised =
		false;

	const stop =
		effect(
			() => {

				const value =
					getter();

				/*
					A computed value is only
					updated when its result
					actually changes.
				*/

				if (
					!initialised ||
					!Object.is(
						result.peek(),
						value
					)
				) {

					initialised =
						true;

					result.set(
						value
					);
				}
			}
		);

	return {

		/* ---------------------------- */
		/* GET */
/* ---------------------------- */

		get() {

			return result.get();
		},

		/* ---------------------------- */
		/* PEEK */
/* ---------------------------- */

		peek() {

			return result.peek();
		},

		/* ---------------------------- */
		/* STOP */
/* ---------------------------- */

		stop() {

			stop();
		}
	};
}