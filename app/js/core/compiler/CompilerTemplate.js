import {
	compile
}
from "./Compiler.js";

export function template(
	html,
	component
) {

	return compile(
		html,
		component
	);
}