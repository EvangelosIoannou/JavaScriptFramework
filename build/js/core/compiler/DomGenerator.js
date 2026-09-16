import {
	createReactiveProps,
	createReactiveExpression,
	createReactiveAttribute
}
from "../reactivity/index.js";

import { NodeTypes } from "./AST.js";

import {
	getComponent
}
from "../ComponentRegistry.js";

import {
	processDirectives
}
from "./DirectiveProcessor.js";

import {
	generateDynamicComponent
}
from "./DynamicComponent.js";

import {
	effect
}
from "../reactivity/Effect.js";

import {
	getCurrentOwner
}
from "../reactivity/Owner.js";

import {
	normaliseRoot
}
from "../DomRoot.js";

import {
	KeyedList
}
from "./KeyedList.js";


/* -------------------------------- */
/* GENERATE */
/* -------------------------------- */

export function generateDOM(
	ast,
	component
) {

	const scope =
		component?.__scope ||
		null;


	/* ---------------------------- */
	/* ROOT */
	/* ---------------------------- */

	if (
		ast.type ===
		NodeTypes.ROOT
	) {

		const fragment =
			document.createDocumentFragment();


		ast.children.forEach(
			child => {

				const node =
					generateDOM(
						child,
						component
					);


				if (
					node
				) {

					fragment.appendChild(
						node
					);

				}

			}
		);


		return fragment;

	}


	/* ---------------------------- */
	/* INTERPOLATION */
	/* ---------------------------- */

	if (
		ast.type ===
		NodeTypes.INTERPOLATION
	) {

		return createReactiveExpression(
			ast.expression,
			component,
			scope
		);

	}


	/* ---------------------------- */
	/* TEXT */
	/* ---------------------------- */

	if (
		ast.type ===
		NodeTypes.TEXT
	) {

		return document.createTextNode(
			ast.value
		);

	}


	/* ---------------------------- */
	/* FOR */
	/* ---------------------------- */

	if (
		ast.type ===
		NodeTypes.FOR
	) {

		return generateFor(
			ast,
			component
		);

	}


	/* ---------------------------- */
	/* SLOT */
	/* ---------------------------- */

	if (
		ast.type ===
		NodeTypes.SLOT
	) {

		return generateSlot(
			"default",
			ast,
			component
		);

	}


	/* ---------------------------- */
	/* NAMED SLOT */
	/* ---------------------------- */

	if (
		ast.type ===
		NodeTypes.NAMED_SLOT
	) {

		return generateSlot(
			ast.name,
			ast,
			component
		);

	}


	/* -------------------------------- */
	/* DYNAMIC COMPONENT */
	/* -------------------------------- */

	if (
		ast.type ===
		NodeTypes.DYNAMIC_COMPONENT
	) {

		return generateDynamicComponent(
			ast,
			component
		);

	}


	/* ---------------------------- */
	/* COMPONENT */
	/* ---------------------------- */

	if (
		ast.type ===
		NodeTypes.COMPONENT
	) {

		return generateComponent(
			ast,
			component
		);

	}


	/* ---------------------------- */
	/* ELEMENT */
	/* ---------------------------- */

	return generateElement(
		ast,
		component
	);

}


/* -------------------------------- */
/* FOR */
/* -------------------------------- */

function generateFor(
	ast,
	component
) {

	const anchor =
		document.createComment(
			`for ${ast.itemName} in ${ast.listName}`
		);


	const fragment =
		document.createDocumentFragment();


	fragment.appendChild(
		anchor
	);


	/*
	 * KeyedList remains responsible for its own
	 * identity and ownership.
	 *
	 * Do not move its ownership into the component
	 * reconciliation system.
	 */
	const parentOwner =
		getCurrentOwner();


	const keyedList =
		new KeyedList(
			anchor,
			component,

			(item, index, scope) => {

				return generateDOM(
					ast.template,
					component._createRenderScope(scope)
				);

			},

			ast.itemName,
			ast.listName,
			ast.keyExpression || null,
			parentOwner
		);


	anchor.__keyedList =
		keyedList;


	/*
	 * This effect belongs to the current render owner.
	 */
	const stop =
		effect(
			() => {

				const items =
					resolveListExpression(
						ast.listName,
						component
					);


				keyedList.update(
					items
				);

			}
		);


	anchor.__keyedListStop =
		stop;


	return fragment;

}


/* -------------------------------- */
/* RESOLVE LIST */
/* -------------------------------- */

function resolveList(
	expression,
	component
) {

	const value =
		component?.[
			expression
		];


	if (
		value &&
		typeof value.get ===
			"function"
	) {

		return value.get();

	}


	if (
		Array.isArray(
			value
		)
	) {

		return value;

	}


	return [];

}


/* -------------------------------- */
/* COMPONENT */
/* -------------------------------- */

function generateComponent(
	ast,
	parentComponent
) {
	const ComponentClass =
		getComponent(
			ast.tag
		);


	if (
		!ComponentClass
	) {

		throw new Error(
			`Component '${ast.tag}' not registered`
		);

	}


	const slots =
		collectSlots(
			ast.children
		);


	const reactiveProps =
		createReactiveProps(
			ast.props || {},
			parentComponent
		);


	reactiveProps.children =
		ast.children || [];


	reactiveProps.slots =
		slots;


	/*
	 * --------------------------------
	 * STABLE CHILD IDENTITY
	 * --------------------------------
	 *
	 * The child belongs to the parent component,
	 * not to the parent's current render owner.
	 *
	 * _nextChildIdentity() provides a stable structural
	 * position during the parent render.
	 */
	const identity =
		parentComponent._nextChildIdentity(
			ComponentClass
		);


	/*
	 * --------------------------------
	 * ACQUIRE CHILD
	 * --------------------------------
	 *
	 * Existing children are reused.
	 *
	 * New children are created with the parent
	 * component owner as their lifetime owner.
	 */
	const instance =
		parentComponent._acquireChild(
			identity,
			ComponentClass,
			reactiveProps
		);

	if (
		!instance
	) {

		return document.createComment(
			"destroyed component"
		);

	}


	/*
	 * --------------------------------
	 * NEW COMPONENT
	 * --------------------------------
	 *
	 * Only a newly-created component needs its
	 * initial render here.
	 *
	 * Existing components already own their DOM
	 * tree and are deliberately not rendered again.
	 */
	if (
		!instance._mounted
	) {

		const rendered =
			instance._renderWithOwner();


		const element =
			normaliseRoot(
				rendered
			);


		instance.el =
			element;


		instance._mounted =
			true;


		/*
		 * The component now has a proper mount lifecycle
		 * point.
		 */
		instance.onMount();


		/*
		 * Keep a reference to the component instance
		 * on its root.
		 */
		if (
			element &&
			typeof element ===
				"object"
		) {

			element.__component =
				instance;

		}

	}


	/*
	 * Existing components simply return their current
	 * DOM root.
	 *
	 * Their own reactive bindings remain alive.
	 */
	return instance.el;

}


/* -------------------------------- */
/* ELEMENT */
/* -------------------------------- */

function generateElement(
	ast,
	component
) {

	const element =
		document.createElement(
			ast.tag.toLowerCase()
		);


	/* ---------------------------- */
	/* PROPS */
	/* ---------------------------- */

	Object.entries(
		ast.props || {}
	)
	.forEach(
		(
			[name, value]
		) => {

			/*
			 * Reactive attribute
			 */
			if (
				name.startsWith(
					":"
				)
			) {

				createReactiveAttribute(
					element,
					name.substring(
						1
					),
					value,
					component
				);

				return;

			}


			processDirectives(
				element,
				{
					[name]:
						value
				},
				component
			);

		}
	);


	/* ---------------------------- */
	/* CHILDREN */
	/* ---------------------------- */

	ast.children.forEach(
		child => {

			const node =
				generateDOM(
					child,
					component
				);


			if (
				node
			) {

				element.appendChild(
					node
				);

			}

		}
	);


	return element;

}


/* -------------------------------- */
/* SLOT */
/* -------------------------------- */

function generateSlot(
	slotName,
	ast,
	component
) {

	const fragment =
		document.createDocumentFragment();


	const slots =
		component.props
			?.slots || {};


	const supplied =
		slots[
			slotName
		];


	if (
		supplied &&
		supplied.length
	) {

		supplied.forEach(
			child => {

				const node =
					generateDOM(
						child,
						component
					);


				if (
					node
				) {

					fragment.appendChild(
						node
					);

				}

			}
		);


		return fragment;

	}


	/*
	 * Fallback content.
	 */
	(
		ast.children || []
	)
	.forEach(
		child => {

			const node =
				generateDOM(
					child,
					component
				);


			if (
				node
			) {

				fragment.appendChild(
					node
				);

			}

		}
	);


	return fragment;

}


/* -------------------------------- */
/* COLLECT SLOTS */
/* -------------------------------- */

function collectSlots(
	children = []
) {

	const slots =
		{};


	children.forEach(
		child => {

			const slotName =
				child.props?.slot ||
				"default";


			if (
				!slots[
					slotName
				]
			) {

				slots[
					slotName
				] = [];

			}


			slots[
				slotName
			].push(
				child
			);

		}
	);


	return slots;

}


/* -------------------------------- */
/* RESOLVE LIST EXPRESSION */
/* -------------------------------- */

function resolveListExpression(
	expression,
	component
) {

	if (
		!expression
	) {

		return [];

	}


	/*
	 * Direct component property.
	 *
	 * Example:
	 *
	 *     for="user in users"
	 */
	if (
		component &&
		Object.prototype.hasOwnProperty.call(
			component,
			expression
		)
	) {

		const value =
			component[
				expression
			];


		if (
			value &&
			typeof value.get ===
				"function"
		) {

			return value.get();

		}


		return value;

	}


	/*
	 * Component state.
	 */
	if (
		component?.state &&
		Object.prototype.hasOwnProperty.call(
			component.state,
			expression
		)
	) {

		const value =
			component.state[
				expression
			];


		if (
			value &&
			typeof value.get ===
				"function"
		) {

			return value.get();

		}


		return value;

	}


	/*
	 * Props.
	 */
	if (
		component?.props &&
		Object.prototype.hasOwnProperty.call(
			component.props,
			expression
		)
	) {

		const value =
			component.props[
				expression
			];


		if (
			value &&
			typeof value.get ===
				"function"
		) {

			return value.get();

		}


		return value;

	}


	return [];

}