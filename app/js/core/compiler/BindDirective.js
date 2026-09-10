import {
	effect
}
from "../reactivity/index.js";

/* -------------------------------- */
/* BIND DIRECTIVE */
/* -------------------------------- */

export function processBind(
	element,
	signal
) {

	/*
		Initial Value
	*/

	element.value =
		signal.get();

	/*
		Signal → DOM
	*/

	effect(
		() => {

			const value =
				signal.get();

			if (
				element.value !== value
			) {

				element.value =
					value;
			}
		}
	);

	/*
		DOM → Signal
	*/

	element.addEventListener(
		"input",
		e => {

			signal.set(
				e.target.value
			);
		}
	);
}