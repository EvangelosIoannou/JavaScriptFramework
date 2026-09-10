import {
	createReactiveProps,
	createReactiveExpression,
	createReactiveAttribute
}
from "../reactivity/index.js";

import { NodeTypes } from "./AST.js";
import { getComponent } from "../ComponentRegistry.js";
import { processDirectives } from "./DirectiveProcessor.js";

import { effect } from "../reactivity/Effect.js";
import { getCurrentOwner } from "../reactivity/Owner.js";

import { renderRoot } from "../VDom.js";

import { KeyedList } from "./KeyedList.js";


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
	* The currently active owner is normally the render owner.
	*
	* KeyedList will create its own child owner underneath it.
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
					{
						...component,
						__scope: scope
					}
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
	* This effect belongs to the render owner.
	*
	* When the render tree is destroyed, this effect disappears
	* together with the list.
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


	/*
	* --------------------------------------------------------
	* COMPONENT OWNERSHIP
	* --------------------------------------------------------
	*
	* Compiler-created components must inherit the currently
	* active render owner.
	*
	* Without this, the child creates a completely independent
	* Owner:
	*
	*     Parent Render Owner
	*          |
	*          +-- Child Owner     <-- parent = null
	*
	* With this change:
	*
	*     Parent Render Owner
	*          |
	*          +-- Child Owner
	*
	* This means destroying the parent's render tree also
	* destroys the child component.
	*/
	const parentOwner =
		getCurrentOwner();


	const instance =
		new ComponentClass(
			{
				...reactiveProps,

				children:
					ast.children || [],

				slots
			},

			parentComponent.injector,

			parentOwner
		);


	/*
	* --------------------------------------------------------
	* CHILD RENDER
	* --------------------------------------------------------
	*
	* Render through the child's own render owner rather than
	* calling instance.render() directly.
	*
	* This ensures reactive resources created while rendering
	* the child are owned by the child render tree.
	*/
	const rendered =
		instance._renderWithOwner();


	/*
	* --------------------------------------------------------
	* STABLE DOM ROOT
	* --------------------------------------------------------
	*
	* A compiler component can return a DocumentFragment.
	*
	* renderRoot() converts that into a stable DOM node while
	* preserving the existing compiler behaviour.
	*/
	const element =
		renderRoot(
			rendered,
			parentComponent.injector
		);


	/*
	* Store the rendered root on the child component.
	*
	* This makes the compiler-created component behave like
	* components created through VDom.render().
	*/
	instance.el =
		element;


	instance._mounted =
		true;


	/*
	* The component now has a proper mount lifecycle point.
	*
	* This is intentionally called after the DOM root has been
	* established.
	*/
	instance.onMount();


	/*
	* Keep a reference to the component instance on its root.
	*
	* This gives us a useful debugging/introspection hook and
	* provides a path for future component DOM management.
	*/
	if (
		element &&
		typeof element === "object"
	) {

		element.__component =
			instance;
	}


	return element;
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

	const slots = {};


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