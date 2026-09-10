import { h } from "./VDom.js";
import {
	hasComponent,
	getComponent
}
from "./ComponentRegistry.js";

export function html(
	template,
	component = null
) {

	const parser =
		new DOMParser();

	const doc =
		parser.parseFromString(
			template,
			"text/html"
		);

	const root =
		doc.body.firstElementChild;

	return elementToVNode(
		root,
		component,
		{}
	);
}

function elementToVNode(
	node,
	component,
	scope = {}
) {

	/* ---------------------------- */
	/* TEXT NODE */
	/* ---------------------------- */

	if (
		node.nodeType ===
		Node.TEXT_NODE
	) {

		let text =
			node.textContent;

		text =
			interpolate(
				text,
				component,
				scope
			);

		text =
			text.trim();

		return text || null;
	}

	/* ---------------------------- */
	/* CONDITIONALS */
	/* ---------------------------- */

	const ifExpression =
		node.getAttribute?.(
			"if"
		);

	if (
		ifExpression &&
		!resolveExpression(
			ifExpression,
			component,
			scope
		)
	) {

		return null;
	}

	/* ---------------------------- */
	/* LOOPS */
	/* ---------------------------- */

	const forExpression =
		node.getAttribute?.(
			"for"
		);

	if (
		forExpression
	) {

		const [
			variable,
			,
			listName
		] =
			forExpression
				.split(" ");

		const list =
			resolveExpression(
				listName,
				component,
				scope
			) || [];

		return list.map(
			item => {

				const cloned =
					node.cloneNode(
						true
					);

				cloned.removeAttribute(
					"for"
				);

				return elementToVNode(
					cloned,
					component,
					{
						...scope,
						[variable]:
							item
					}
				);
			}
		);
	}

	/* ---------------------------- */
	/* PROPS */
	/* ---------------------------- */

	const props = {};

	Array.from(
		node.attributes || []
	).forEach(attr => {

		/* EVENTS */

		if (
			attr.name.startsWith(
				"@"
			)
		) {

			const eventName =
				"on" +
				attr.name
					.substring(1)
					.charAt(0)
					.toUpperCase() +
				attr.name
					.substring(2);

			props[eventName] =
				component
					?.methods?.()[
						attr.value
					];

			return;
		}

		/* BIND */

		if (
			attr.name ===
			"bind"
		) {

			const key =
				attr.value;

			props.value =
				component.state[
					key
				] || "";

			props.onInput =
				e => {

					component.setState({

						[key]:
							e.target.value
					});
				};

			return;
		}

		/* FRAMEWORK ATTRIBUTES */

		if (
			attr.name === "if" ||
			attr.name === "for"
		) {

			return;
		}

		props[
			attr.name
		] = attr.value;
	});

	/* ---------------------------- */
	/* CHILDREN */
	/* ---------------------------- */

	const children =
		Array.from(
			node.childNodes
		)
		.flatMap(child =>
			elementToVNode(
				child,
				component,
				scope
			)
		)
		.filter(Boolean);

		const tagName = node.tagName;

		if (
			hasComponent(
				tagName
			)
		) {

			return h(
				getComponent(
					tagName
				),
				props,
				children
			);
		}

		return h(
			tagName.toLowerCase(),
			props,
			children
		);
}

/* -------------------------------- */
/* INTERPOLATION */
/* -------------------------------- */

function interpolate(
	text,
	component,
	scope
) {

	return text.replace(

		/\{\{\s*(.*?)\s*\}\}/g,

		(
			match,
			expression
		) => {

			const value =
				resolveExpression(
					expression,
					component,
					scope
				);

			return value ?? "";
		}
	);
}

/* -------------------------------- */
/* EXPRESSION RESOLUTION */
/* -------------------------------- */

function resolveExpression(
	expression,
	component,
	scope
) {

	const parts =
		expression.split(
			"."
		);

	/* ---------------------------- */
	/* LOOP SCOPE */
	/* ---------------------------- */

	let current =
		scope;

	for (
		const part
		of parts
	) {

		if (
			current?.[
				part
			] !== undefined
		) {

			current =
				current[
					part
				];

		} else {

			current =
				undefined;

			break;
		}
	}

	if (
		current !==
		undefined
	) {

		return current;
	}

	/* ---------------------------- */
	/* COMPUTED */
	/* ---------------------------- */

	if (
		parts.length === 1
	) {

		const computed =
			component
				?.computed?.();

		if (
			computed &&
			typeof computed[
				expression
			] ===
			"function"
		) {

			return computed[
				expression
			]();
		}
	}

	/* ---------------------------- */
	/* COMPONENT STATE */
	/* ---------------------------- */

	current =
		component?.state;

	for (
		const part
		of parts
	) {

		if (
			current?.[
				part
			] !== undefined
		) {

			current =
				current[
					part
				];

		} else {

			current =
				undefined;

			break;
		}
	}

	if (
		current !==
		undefined
	) {

		return current;
	}

	return null;
}