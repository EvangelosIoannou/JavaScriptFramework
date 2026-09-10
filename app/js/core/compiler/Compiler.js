import {
	tokenize
}
from "./TemplateTokeniser.js";

import {
	parse
}
from "./TemplateParser.js";

import {
	generateDOM
}
from "./DomGenerator.js";

/* -------------------------------- */
/* COMPILE */
/* -------------------------------- */

export function compile(
	template,
	component
) {

	const normalized =
		tokenize(
			template
		);

	const ast =
		parse(
			normalized
		);

	return generateDOM(
		ast,
		component
	);
}