/* -------------------------------- */
/* EXPRESSION TOKENISER */
/* -------------------------------- */

export function tokenise(
	expression
) {

	const tokens = [];

	let index = 0;

	while (
		index <
		expression.length
	) {

		const char =
			expression[index];

		/* ---------------------------- */
		/* WHITESPACE */
		/* ---------------------------- */

		if (
			/\s/.test(
				char
			)
		) {

			index++;

			continue;
		}

		/* ---------------------------- */
		/* STRING */
		/* ---------------------------- */

		if (
			char === '"' ||
			char === "'"
		) {

			const result =
				readString(
					expression,
					index
				);

			tokens.push({

				type:
					"literal",

				value:
					result.value
			});

			index =
				result.index;

			continue;
		}

		/* ---------------------------- */
		/* NUMBER */
		/* ---------------------------- */

		if (
			/[0-9]/.test(
				char
			)
		) {

			const result =
				readNumber(
					expression,
					index
				);

			tokens.push({

				type:
					"literal",

				value:
					result.value
			});

			index =
				result.index;

			continue;
		}

		/* ---------------------------- */
		/* IDENTIFIER */
		/* ---------------------------- */

		if (
			/[A-Za-z_$]/.test(
				char
			)
		) {

			const result =
				readIdentifier(
					expression,
					index
				);

			tokens.push({

				type:
					"identifier",

				value:
					result.value
			});

			index =
				result.index;

			continue;
		}

		/* ---------------------------- */
		/* OPERATOR */
/* ---------------------------- */

		const operator =
			readOperator(
				expression,
				index
			);

		if (
			operator
		) {

			tokens.push({

				type:
					"operator",

				value:
					operator.value
			});

			index +=
				operator.length;

			continue;
		}

		throw new Error(

			`Unexpected character '${char}' in expression: ${expression}`
		);
	}

	tokens.push({

		type:
			"eof",

		value:
			null
	});

	return tokens;
}

/* -------------------------------- */
/* STRING */
/* -------------------------------- */

function readString(
	expression,
	start
) {

	const quote =
		expression[start];

	let value =
		"";

	let index =
		start + 1;

	while (
		index <
		expression.length
	) {

		const char =
			expression[index];

		if (
			char === "\\"
		) {

			const next =
				expression[
					index + 1
				];

			switch (
				next
			) {

				case "n":

					value += "\n";

					break;

				case "r":

					value += "\r";

					break;

				case "t":

					value += "\t";

					break;

				case "\\":

					value += "\\";

					break;

				case "'":

					value += "'";

					break;

				case '"':

					value += '"';

					break;

				default:

					value +=
						next;
			}

			index += 2;

			continue;
		}

		if (
			char === quote
		) {

			return {

				value,

				index:
					index + 1
			};
		}

		value +=
			char;

		index++;
	}

	throw new Error(
		"Unterminated string in expression"
	);
}

/* -------------------------------- */
/* NUMBER */
/* -------------------------------- */

function readNumber(
	expression,
	start
) {

	let index =
		start;

	let value =
		"";

	while (
		index <
		expression.length &&
		/[0-9.]/.test(
			expression[index]
		)
	) {

		value +=
			expression[index];

		index++;
	}

	const number =
		Number(
			value
		);

	if (
		Number.isNaN(
			number
		)
	) {

		throw new Error(

			`Invalid number '${value}'`
		);
	}

	return {

		value:
			number,

		index
	};
}

/* -------------------------------- */
/* IDENTIFIER */
/* -------------------------------- */

function readIdentifier(
	expression,
	start
) {

	let index =
		start;

	let value =
		"";

	while (
		index <
		expression.length &&
		/[A-Za-z0-9_$]/.test(
			expression[index]
		)
	) {

		value +=
			expression[index];

		index++;
	}

	return {

		value,

		index
	};
}

/* -------------------------------- */
/* OPERATOR */
/* -------------------------------- */

function readOperator(
	expression,
	index
) {

	const operators = [

		"===",
		"!==",
		"==",
		"!=",
		">=",
		"<=",
		"&&",
		"||",
		"??",

		"+",
		"-",
		"*",
		"/",
		"%",
		">",
		"<",
		"!",
		"?",
		":",
		".",
		",",

		"(",
		")",

		"[",
		"]"
	];

	for (
		const operator
		of operators
	) {

		if (
			expression.startsWith(
				operator,
				index
			)
		) {

			return {

				value:
					operator,

				length:
					operator.length
			};
		}
	}

	return null;
}