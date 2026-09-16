import {
	resolveExpression
}
from "./../reactivity/ReactiveExpression.js";

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


/* -------------------------------- */
/* DYNAMIC COMPONENT */
/* -------------------------------- */

export function generateDynamicComponent(
	ast,
	parentComponent
) {

	const anchor =
		document.createComment(
			"dynamic-component"
		);


	const fragment =
		document.createDocumentFragment();


	fragment.appendChild(
		anchor
	);


	const parentOwner =
		getCurrentOwner();


	let currentComponent =
		null;

	let currentElement =
		null;


	/* ---------------------------- */
	/* CREATE COMPONENT */
	/* ---------------------------- */

	const createComponent =
		ComponentClass => {

			if (
				typeof ComponentClass !==
				"function"
			) {

				return null;
			}


			const instance =
				new ComponentClass(

					{
						...ast.props
					},

					parentComponent.injector,

					parentOwner
				);


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


			instance.onMount();


			if (
				element &&
				typeof element ===
					"object"
			) {

				element.__component =
					instance;
			}


			return {
				instance,
				element
			};
		};


	/* ---------------------------- */
	/* MOUNT INITIAL COMPONENT */
	/* ---------------------------- */

	const initialClass =
		resolveExpression(
			ast.expression,
			parentComponent
		);


	if (
		initialClass
	) {

		const created =
			createComponent(
				initialClass
			);


		if (
			created
		) {

			currentComponent =
				created.instance;

			currentElement =
				created.element;

			fragment.insertBefore(
				currentElement,
				anchor
			);
		}
	}


	/* ---------------------------- */
	/* REACTIVE COMPONENT */
	/* ---------------------------- */

	const stop =
		effect(
			() => {

				const ComponentClass =
					resolveExpression(
						ast.expression,
						parentComponent
					);


				if (
					ComponentClass ===
					currentComponent?.constructor
				) {

					return;
				}


				const created =
					ComponentClass
						?

						createComponent(
							ComponentClass
						)

						:

						null;


				const nextElement =
					created?.element ||
					null;


				if (
					anchor.parentNode
				) {

					const parent =
						anchor.parentNode;


					if (
						nextElement
					) {

						parent.insertBefore(
							nextElement,
							anchor
						);
					}


					if (
						currentElement
					) {

						parent.removeChild(
							currentElement
						);
					}
				}


				if (
					currentComponent
				) {

					currentComponent.destroy();
				}


				currentComponent =
					created?.instance ||
					null;

				currentElement =
					nextElement;
			}
		);


	anchor.__dynamicComponentStop =
		stop;


	anchor.__dynamicComponent =
		() => currentComponent;


	return fragment;
}