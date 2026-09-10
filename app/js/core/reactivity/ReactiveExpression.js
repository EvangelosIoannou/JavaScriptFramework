import {
	effect
}
from "./Effect.js";

import {
	parseExpression
}
from "../compiler/ExpressionParser.js";

import {
	evaluateExpression
}
from "../compiler/ExpressionEvaluator.js";

/* -------------------------------- */
/* EXPRESSION CACHE */
/* -------------------------------- */

const expressionCache =
	new Map();

/* -------------------------------- */
/* REACTIVE EXPRESSION */
/* -------------------------------- */

export function createReactiveExpression(
	expression,
	component,
	scope = null
) {

	const textNode =
		document.createTextNode(
			""
		);

	const ast =
		getExpressionAST(
			expression
		);

	const stop =
		effect(
			() => {

				const value =
					evaluateExpression(

						ast,

						component,

						scope
					);

				textNode.nodeValue =
					value ?? "";
			}
		);

	/*
		Expose metadata for the
		developer tools and future
		compiler optimisations.
	*/

	textNode.__reactiveEffect =
		stop;

	textNode.__expression =
		expression;

	textNode.__expressionAST =
		ast;

	return textNode;
}

/* -------------------------------- */
/* RESOLVE EXPRESSION */
/* -------------------------------- */

export function resolveExpression(
	expression,
	component,
	scope = null
) {

	const ast =
		getExpressionAST(
			expression
		);

	return evaluateExpression(

		ast,

		component,

		scope
	);
}

/* -------------------------------- */
/* GET EXPRESSION AST */
/* -------------------------------- */

function getExpressionAST(
	expression
) {

	if (
		expressionCache.has(
			expression
		)
	) {

		return expressionCache.get(
			expression
		);
	}

	const ast =
		parseExpression(
			expression
		);

	expressionCache.set(
		expression,
		ast
	);

	return ast;
}