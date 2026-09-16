import {
	NodeTypes
}
from "./AST.js";

import {
	HTML_TAGS
}
from "./HtmlTags.js";


/* -------------------------------- */
/* PARSER */
/* -------------------------------- */

export function parse(
	template
) {

	const parser =
		new DOMParser();

	const doc =
		parser.parseFromString(
			template,
			"text/html"
		);

	return {

		type:
			NodeTypes.ROOT,

		children:
			Array.from(
				doc.body.childNodes
			)
			.map(
				parseChild
			)
			.flat()
			.filter(
				Boolean
			)
	};
}


/* -------------------------------- */
/* NODE */
/* -------------------------------- */

function parseNode(
	node
) {

	/*
		COMPONENT
	*/

	const isDynamicComponent =
		node.tagName ===
		"COMPONENT";

	const isComponent =
		!HTML_TAGS.has(
			node.tagName
		);


	/* ---------------------------- */
	/* FOR */
	/* ---------------------------- */

	const forExpression =
		node.getAttribute(
			"for"
		);

	if (
		forExpression
	) {

		const match =
			forExpression.match(

				/^\s*(\w+)\s+in\s+(.+?)\s*$/

			);

		if (
			!match
		) {

			throw new Error(

				`Invalid for expression '${forExpression}'`
			);
		}

		const itemName =
			match[1];

		const listName =
			match[2];

		const keyExpression =
			node.getAttribute(
				"key"
			);

		node.removeAttribute(
			"for"
		);

		node.removeAttribute(
			"key"
		);

		return {

			type:
				NodeTypes.FOR,

			itemName,

			listName,

			keyExpression,

			template:
				parseNode(
					node
				)
		};
	}


	/* ---------------------------- */
	/* DYNAMIC COMPONENT */
	/* ---------------------------- */

	if (
		isDynamicComponent
	) {

		const expression =
			node.getAttribute(
				":is"
			);

		if (
			!expression
		) {

			throw new Error(
				"Dynamic component requires a ':is' expression"
			);
		}

		return {

			type:
				NodeTypes.DYNAMIC_COMPONENT,

			expression,

			props:
				parseProps(
					node
				),

			children:
				[]
		};
	}


	/* ---------------------------- */
	/* NORMAL NODE */
	/* ---------------------------- */

	const astNode = {

		type:

			isComponent

				?

				NodeTypes.COMPONENT

				:

				NodeTypes.ELEMENT,

		tag:
			node.tagName,

		props:
			parseProps(
				node
			),

		children:
			[]
	};


	Array.from(
		node.childNodes
	)
	.forEach(
		child => {

			const parsed =
				parseChild(
					child
				);

			if (
				parsed
			) {

				if (
					Array.isArray(
						parsed
					)
				) {

					astNode.children.push(
						...parsed
					);

				} else {

					astNode.children.push(
						parsed
					);
				}
			}
		}
	);


	return astNode;
}


/* -------------------------------- */
/* CHILD */
/* -------------------------------- */

function parseChild(
	node
) {

	/*
		TEXT
	*/

	if (
		node.nodeType ===
		Node.TEXT_NODE
	) {

		return parseText(
			node.textContent
		);
	}


	/*
		ELEMENT
	*/

	if (
		node.nodeType ===
		Node.ELEMENT_NODE
	) {

		return parseNode(
			node
		);
	}


	return null;
}


/* -------------------------------- */
/* TEXT */
/* -------------------------------- */

function parseText(
	text
) {

	/*
		Remove whitespace-only text nodes.
	*/

	if (
		!text ||
		!text.trim()
	) {

		return null;
	}


	const nodes = [];

	const interpolationPattern =
		/\{\{\s*(.*?)\s*\}\}/g;

	let lastIndex =
		0;

	let match;


	while (
		(
			match =
				interpolationPattern.exec(
					text
				)
		) !== null
	) {

		/* ---------------------------- */
		/* TEXT BEFORE INTERPOLATION */
		/* ---------------------------- */

		const before =
			text.substring(
				lastIndex,
				match.index
			);

		if (
			before.trim()
		) {

			nodes.push({

				type:
					NodeTypes.TEXT,

				value:
					before.trim()
			});
		}


		/* ---------------------------- */
		/* INTERPOLATION */
		/* ---------------------------- */

		const expression =
			match[1].trim();

		if (
			expression
		) {

			nodes.push({

				type:
					NodeTypes.INTERPOLATION,

				expression
			});
		}


		lastIndex =
			interpolationPattern.lastIndex;
	}


	/* ---------------------------- */
	/* TEXT AFTER LAST INTERPOLATION */
	/* ---------------------------- */

	const after =
		text.substring(
			lastIndex
		);

	if (
		after.trim()
	) {

		nodes.push({

			type:
				NodeTypes.TEXT,

			value:
				after.trim()
		});
	}


	/*
		No interpolation was found.
	*/

	if (
		!nodes.length
	) {

		return {

			type:
				NodeTypes.TEXT,

			value:
				text.trim()
		};
	}


	return nodes;
}


/* -------------------------------- */
/* PROPS */
/* -------------------------------- */

function parseProps(
	node
) {

	const props = {};

	Array.from(
		node.attributes
	)
	.forEach(
		attr => {

			/*
				Framework structural attributes
				are not passed to the DOM element.
			*/

			if (
				attr.name ===
				"for" ||

				attr.name ===
				"key" ||

				attr.name ===
				":is"
			) {

				return;
			}


			props[
				attr.name
			] =
				attr.value;
		}
	);


	return props;
}