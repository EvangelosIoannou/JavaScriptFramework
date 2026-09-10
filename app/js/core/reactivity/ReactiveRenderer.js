import {
	reactiveText
}
from "./ReactiveText.js";

/* -------------------------------- */
/* REACTIVE RENDERER */
/* -------------------------------- */

export function renderSignal(
	getter
) {

	return reactiveText(
		getter
	);
}