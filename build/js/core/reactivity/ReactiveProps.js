import {
	parseExpression
}
from "../compiler/ExpressionParser.js";

import {
	evaluateExpression
}
from "../compiler/ExpressionEvaluator.js";


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

	const expressions = new Map();


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


			const expression =
				extractExpression(
					value
				);

			if (
				expression ===
				null
			) {

				return;
			}


			expressions.set(
				name,

				parseExpression(
					expression
				)
			);
		}
	);


	return new Proxy(
		values,
		{

			get(
				target,
				property
			) {

				const ast =
					expressions.get(
						property
					);

				if (
					ast
				) {

					return evaluateExpression(
						ast,
						parentComponent
					);
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

				/*
					If a property was originally
					expression-backed, assigning a
					new value replaces the expression
					with a normal value.
				*/

				expressions.delete(
					property
				);


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
/* EXPRESSION */
/* -------------------------------- */

function extractExpression(
	value
) {

	const match =
		value
			.trim()
			.match(
				/^\{\{\s*(.*?)\s*\}\}$/
			);


	if (
		!match
	) {

		return null;
	}


	const expression =
		match[1].trim();


	return expression ||
		null;
}