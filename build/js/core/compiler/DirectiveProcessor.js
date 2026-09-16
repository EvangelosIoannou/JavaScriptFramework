import {
	processBind
}
from "./BindDirective.js";

import {
	processIf
}
from "./IfDirective.js";

/* -------------------------------- */
/* DIRECTIVES */
/* -------------------------------- */

export function processDirectives(
	element,
	props,
	component
) {

	Object.entries(
		props || {}
	)
	.forEach(
		([name, value]) => {

			/* ---------------------------- */
			/* CLICK */
			/* ---------------------------- */

			if (
				name === "@click"
			) {

				const method =
					component[
						value
					];

				if (
					typeof method ===
					"function"
				) {

					element.addEventListener(

						"click",

						method.bind(
							component
						)
					);
				}

				return;
			}

			/* ---------------------------- */
			/* BIND */
			/* ---------------------------- */

			if (
				name === "bind"
			) {

				const signal =
					component[
						value
					];

				if (
					signal &&
					typeof signal.get ===
						"function" &&
					typeof signal.set ===
						"function"
				) {

					processBind(
						element,
						signal
					);
				}

				return;
			}

			/* ---------------------------- */
			/* IF */
			/* ---------------------------- */

			if (
				name === "if"
			) {

				const signal =
					component[
						value
					];

				if (
					signal &&
					typeof signal.get ===
						"function"
				) {

					processIf(
						element,
						signal
					);
				}

				return;
			}

			/* ---------------------------- */
			/* NORMAL ATTR */
			/* ---------------------------- */

			element.setAttribute(
				name,
				value
			);
		}
	);
}