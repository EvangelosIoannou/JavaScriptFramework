import {
	effect
}
from "./Effect.js";

import {
	resolveExpression
}
from "./ReactiveExpression.js";

/* -------------------------------- */
/* REACTIVE ATTRIBUTE */
/* -------------------------------- */

export function createReactiveAttribute(
	element,
	name,
	expression,
	component,
	scope = null
) {

	effect(
		() => {

			const value =
				resolveExpression(

					expression,

					component,

					scope
				);

			applyValue(

				element,

				name,

				value
			);
		}
	);
}

/* -------------------------------- */
/* APPLY VALUE */
/* -------------------------------- */

function applyValue(
	element,
	name,
	value
) {

	/* ---------------------------- */
	/* CLASS */
	/* ---------------------------- */

	if (
		name ===
		"class"
	) {

		element.className =
			value ?? "";

		return;
	}

	/* ---------------------------- */
	/* BOOLEAN */
	/* ---------------------------- */

	if (
		isBooleanAttribute(
			name
		)
	) {

		element[
			name
		] =
			Boolean(
				value
			);

		return;
	}

	/* ---------------------------- */
	/* VALUE */
	/* ---------------------------- */

	if (
		name ===
		"value"
	) {

		element.value =
			value ?? "";

		return;
	}

	/* ---------------------------- */
	/* DOM PROPERTY */
	/* ---------------------------- */

	if (
		name in element &&
		typeof element[
			name
		] !==
		"function"
	) {

		element[
			name
		] =
			value ?? "";

		return;
	}

	/* ---------------------------- */
	/* ATTRIBUTE */
	/* ---------------------------- */

	if (
		value ===
		null ||
		value ===
		undefined
	) {

		element.removeAttribute(
			name
		);

		return;
	}

	element.setAttribute(
		name,
		value
	);
}

/* -------------------------------- */
/* BOOLEAN ATTRIBUTES */
/* -------------------------------- */

function isBooleanAttribute(
	name
) {

	return [

		"disabled",
		"checked",
		"selected",
		"readonly",
		"multiple",
		"required",
		"autofocus",
		"hidden",
		"open"

	].includes(
		name
	);
}