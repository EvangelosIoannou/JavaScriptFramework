import {
	tokenise
}
from "./ExpressionTokeniser.js";

/* -------------------------------- */
/* CACHE */
/* -------------------------------- */

const cache =
	new Map();

/* -------------------------------- */
/* PARSE */
/* -------------------------------- */

export function parseExpression(
	expression
) {

	const cached =
		cache.get(
			expression
		);

	if (
		cached
	) {

		return cached;
	}

	const parser =
		new ExpressionParser(
			tokenise(
				expression
			)
		);

	const ast =
		parser.parse();

	cache.set(
		expression,
		ast
	);

	return ast;
}

/* -------------------------------- */
/* PARSER */
/* -------------------------------- */

class ExpressionParser {

	constructor(
		tokens
	) {

		this.tokens =
			tokens;

		this.index =
			0;
	}

	/* ---------------------------- */
	/* PARSE */
	/* ---------------------------- */

	parse() {

		const expression =
			this.parseConditional();

		this.expect(
			"eof"
		);

		return expression;
	}

	/* ---------------------------- */
	/* CONDITIONAL */
	/* ---------------------------- */

	parseConditional() {

		let expression =
			this.parseLogicalOr();

		if (
			this.match(
				"?"
			)
		) {

			const consequent =
				this.parseConditional();

			this.expect(
				":"
			);

			const alternate =
				this.parseConditional();

			expression = {

				type:
					"conditional",

				test:
					expression,

				consequent,

				alternate
			};
		}

		return expression;
	}

	/* ---------------------------- */
	/* LOGICAL OR */
	/* ---------------------------- */

	parseLogicalOr() {

		let expression =
			this.parseLogicalAnd();

		while (
			this.match(
				"||"
			) ||
			this.match(
				"??"
			)
		) {

			const operator =
				this.previous()
					.value;

			const right =
				this.parseLogicalAnd();

			expression = {

				type:
					"logical",

				operator,

				left:
					expression,

				right
			};
		}

		return expression;
	}

	/* ---------------------------- */
	/* LOGICAL AND */
	/* ---------------------------- */

	parseLogicalAnd() {

		let expression =
			this.parseEquality();

		while (
			this.match(
				"&&"
			)
		) {

			const operator =
				this.previous()
					.value;

			const right =
				this.parseEquality();

			expression = {

				type:
					"logical",

				operator,

				left:
					expression,

				right
			};
		}

		return expression;
	}

	/* ---------------------------- */
	/* EQUALITY */
	/* ---------------------------- */

	parseEquality() {

		let expression =
			this.parseComparison();

		while (
			this.match("===") ||
			this.match("!==") ||
			this.match("==") ||
			this.match("!=")
		) {

			const operator =
				this.previous()
					.value;

			const right =
				this.parseComparison();

			expression = {

				type:
					"binary",

				operator,

				left:
					expression,

				right
			};
		}

		return expression;
	}

	/* ---------------------------- */
	/* COMPARISON */
	/* ---------------------------- */

	parseComparison() {

		let expression =
			this.parseAdditive();

		while (
			this.match(">") ||
			this.match("<") ||
			this.match(">=") ||
			this.match("<=")
		) {

			const operator =
				this.previous()
					.value;

			const right =
				this.parseAdditive();

			expression = {

				type:
					"binary",

				operator,

				left:
					expression,

				right
			};
		}

		return expression;
	}

	/* ---------------------------- */
	/* ADDITIVE */
	/* ---------------------------- */

	parseAdditive() {

		let expression =
			this.parseMultiplicative();

		while (
			this.match("+") ||
			this.match("-")
		) {

			const operator =
				this.previous()
					.value;

			const right =
				this.parseMultiplicative();

			expression = {

				type:
					"binary",

				operator,

				left:
					expression,

				right
			};
		}

		return expression;
	}

	/* ---------------------------- */
	/* MULTIPLICATIVE */
	/* ---------------------------- */

	parseMultiplicative() {

		let expression =
			this.parseUnary();

		while (
			this.match("*") ||
			this.match("/") ||
			this.match("%")
		) {

			const operator =
				this.previous()
					.value;

			const right =
				this.parseUnary();

			expression = {

				type:
					"binary",

				operator,

				left:
					expression,

				right
			};
		}

		return expression;
	}

	/* ---------------------------- */
	/* UNARY */
	/* ---------------------------- */

	parseUnary() {

		if (
			this.match("!") ||
			this.match("-") ||
			this.match("+")
		) {

			return {

				type:
					"unary",

				operator:
					this.previous()
						.value,

				argument:
					this.parseUnary()
			};
		}

		return this.parsePostfix();
	}

	/* ---------------------------- */
	/* POSTFIX */
	/* ---------------------------- */

	parsePostfix() {

		let expression =
			this.parsePrimary();

		while (true) {

			/* ------------------------ */
			/* MEMBER */
			/* ------------------------ */

			if (
				this.match(".")
			) {

				const property =
					this.expect(
						"identifier"
					);

				expression = {

					type:
						"member",

					object:
						expression,

					property:
						property.value
				};

				continue;
			}

			/* ------------------------ */
			/* INDEX */
			/* ------------------------ */

			if (
				this.match("[")
			) {

				const property =
					this.parseConditional();

				this.expect(
					"]"
				);

				expression = {

					type:
						"computed-member",

					object:
						expression,

					property
				};

				continue;
			}

			/* ------------------------ */
			/* CALL */
			/* ------------------------ */

			if (
				this.match("(")
			) {

				const argumentsList =
					[];

				if (
					!this.check(
						")"
					)
				) {

					do {

						argumentsList.push(
							this.parseConditional()
						);

					}
					while (
						this.match(",")
					);
				}

				this.expect(
					")"
				);

				expression = {

					type:
						"call",

					callee:
						expression,

					arguments:
						argumentsList
				};

				continue;
			}

			break;
		}

		return expression;
	}

	/* ---------------------------- */
	/* PRIMARY */
	/* ---------------------------- */

	parsePrimary() {

		if (
			this.match(
				"literal"
			)
		) {

			return {

				type:
					"literal",

				value:
					this.previous()
						.value
			};
		}

		if (
			this.match(
				"identifier"
			)
		) {

			const value =
				this.previous()
					.value;

			if (
				value ===
				"true"
			) {

				return {

					type:
						"literal",

					value:
						true
				};
			}

			if (
				value ===
				"false"
			) {

				return {

					type:
						"literal",

					value:
						false
				};
			}

			if (
				value ===
				"null"
			) {

				return {

					type:
						"literal",

					value:
						null
				};
			}

			if (
				value ===
				"undefined"
			) {

				return {

					type:
						"literal",

					value:
						undefined
				};
			}

			return {

				type:
					"identifier",

				name:
					value
			};
		}

		if (
			this.match("(")
		) {

			const expression =
				this.parseConditional();

			this.expect(
				")"
			);

			return expression;
		}

		throw new Error(
			`Unexpected token '${this.current().value}'`
		);
	}

	/* ---------------------------- */
	/* MATCH */
	/* ---------------------------- */

	match(
		value
	) {

		if (
			this.check(
				value
			)
		) {

			this.index++;

			return true;
		}

		return false;
	}

	/* ---------------------------- */
	/* CHECK */
	/* ---------------------------- */

	check(
		value
	) {

		const token =
			this.current();

		return (
			token.type === value ||
			token.value === value
		);
	}

	/* ---------------------------- */
	/* EXPECT */
	/* ---------------------------- */

	expect(
		value
	) {

		if (
			this.check(
				value
			)
		) {

			return this.tokens[
				this.index++
			];
		}

		throw new Error(
			`Expected '${value}' but found '${this.current().value}'`
		);
	}

	/* ---------------------------- */
	/* CURRENT */
	/* ---------------------------- */

	current() {

		return this.tokens[
			this.index
		];
	}

	/* ---------------------------- */
	/* PREVIOUS */
	/* ---------------------------- */

	previous() {

		return this.tokens[
			this.index - 1
		];
	}
}