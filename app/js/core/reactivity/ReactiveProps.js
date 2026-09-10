import {
	effect
}
from "./Effect.js";

/* -------------------------------- */
/* REACTIVE PROPS */
/* -------------------------------- */

export function createReactiveProps(
	props,
	parentComponent
) {

	const values = {

		...props
	};

	const signals = {};

	Object.entries(
		props || {}
	)
	.forEach(
		([name, value]) => {

			if (
				typeof value !==
				"string"
			) {

				return;
			}

			const signal =
				resolveSignal(
					value,
					parentComponent
				);

			if (
				signal
			) {

				signals[
					name
				] =
					signal;

				values[
					name
				] =
					signal.get();
			}
		}
	);

	return new Proxy(
		values,
		{

			get(
				target,
				property
			) {

				const signal =
					signals[
						property
					];

				if (
					signal
				) {

					return signal.get();
				}

				return target[
					property
				];
			},

			set(
				target,
				property,
				value
			) {

				target[
					property
				] =
					value;

				return true;
			}
		}
	);
}

/* -------------------------------- */
/* RESOLVE SIGNAL */
/* -------------------------------- */

function resolveSignal(
	expression,
	component
) {

	const value =
		expression.trim();

	const match =
		value.match(
			/^\{\{\s*(.*?)\s*\}\}$/
		);

	if (
		!match
	) {

		return null;
	}

	const parts =
		match[1]
			.trim()
			.split(".");

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

		if (
			current ===
			undefined
		) {

			return null;
		}
	}

	if (
		current &&
		typeof current.get ===
			"function"
	) {

		return current;
	}

	return null;
}