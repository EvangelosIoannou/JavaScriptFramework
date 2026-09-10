import { getCurrentOwner } from "./reactivity/Owner.js";


/*
 * ------------------------------------------------------------
 * VDOM NODE CREATION
 * ------------------------------------------------------------
 */

export function h(tag, props = {}, children = []) {
	return {
		tag,
		props,
		children: children.flat()
	};
}


/*
 * ------------------------------------------------------------
 * VDOM RENDERING
 * ------------------------------------------------------------
 *
 * render()
 *   Converts a VNode into a real DOM node.
 *
 * renderRoot()
 *   Converts a component/root render result into a stable DOM
 *   root.
 *
 * This distinction is important because compiler-generated
 * templates may naturally return a DocumentFragment.
 *
 * A DocumentFragment is not a stable DOM element once it has
 * been inserted into the document. Therefore component.el must
 * never point at the fragment itself.
 */


/**
 * Render a VNode/value into a DOM node.
 */
export function render(vnode, injector = null) {

	/*
	 * Empty values
	 */
	if (
		vnode === null ||
		vnode === undefined ||
		vnode === false
	) {
		return document.createComment("empty");
	}


	/*
	 * Already-created DOM node
	 */
	if (vnode instanceof Node) {
		return vnode;
	}


	/*
	 * Primitive values
	 */
	if (
		typeof vnode === "string" ||
		typeof vnode === "number"
	) {
		return document.createTextNode(vnode);
	}


	/*
	 * Component VNode
	 */
	if (typeof vnode.tag === "function") {

		const parentOwner = getCurrentOwner();

		const component = new vnode.tag(
			{
				...vnode.props,
				children: vnode.children
			},
			injector,
			parentOwner
		);

		/*
		 * Every framework Component should provide
		 * _renderWithOwner().
		 */
		if (
			typeof component._renderWithOwner !== "function"
		) {
			throw new Error(
				`Component "${vnode.tag.name}" does not extend the current Component class. ` +
				`_renderWithOwner() is missing.`
			);
		}

		/*
		 * Render the component and make sure its root is a
		 * stable DOM node.
		 */
		const el = renderRoot(
			component._renderWithOwner(),
			injector
		);

		component.el = el;
		component._mounted = true;

		component.onMount();

		return el;
	}


	/*
	 * Invalid VNode
	 */
	if (
		!vnode ||
		typeof vnode.tag !== "string"
	) {
		return document.createComment("empty");
	}


	/*
	 * Normal DOM element
	 */
	const el = document.createElement(vnode.tag);

	updateProps(
		el,
		propsWithoutChildren(vnode.props)
	);

	vnode.children.forEach(child => {
		el.appendChild(
			render(child, injector)
		);
	});

	return el;
}


/**
 * Render something as a stable component/root DOM node.
 *
 * This is intentionally separate from render().
 *
 * Normal nested rendering must continue to support
 * DocumentFragments because compiler-generated constructs
 * such as loops and slots can legitimately produce them.
 *
 * Only a component/root boundary needs a stable node.
 */
export function renderRoot(vnode, injector = null) {

	const rendered = render(
		vnode,
		injector
	);


	/*
	 * Empty fragment
	 */
	if (rendered instanceof DocumentFragment) {

		const children = Array.from(
			rendered.childNodes
		);


		/*
		 * No root nodes.
		 *
		 * Give the component a stable placeholder.
		 */
		if (children.length === 0) {
			return document.createComment(
				"empty component"
			);
		}


		/*
		 * One root node.
		 *
		 * This is the ideal case and preserves the original
		 * DOM structure without introducing a wrapper.
		 */
		if (children.length === 1) {
			return children[0];
		}


		/*
		 * Multiple root nodes.
		 *
		 * A component needs one stable root for:
		 *
		 *   component.el
		 *   replaceChild()
		 *   lifecycle management
		 *   rerendering
		 *
		 * Therefore create a lightweight wrapper.
		 */
		const wrapper = document.createElement("div");

		wrapper.setAttribute(
			"data-component-root",
			"true"
		);

		children.forEach(child => {
			wrapper.appendChild(child);
		});

		return wrapper;
	}


	/*
	 * render() should normally already have returned a stable
	 * node here.
	 */
	return rendered;
}


/*
 * ------------------------------------------------------------
 * PROPS
 * ------------------------------------------------------------
 */

function propsWithoutChildren(props) {
	return props || {};
}


function updateProps(el, props) {

	Object.entries(props).forEach(
		([name, value]) => {

			/*
			 * Events
			 */
			if (name.startsWith("on")) {

				const eventName =
					name
						.substring(2)
						.toLowerCase();

				el.addEventListener(
					eventName,
					value
				);

				return;
			}


			/*
			 * Class
			 */
			if (name === "class") {

				el.className =
					value || "";

				return;
			}


			/*
			 * Value
			 */
			if (name === "value") {

				el.value =
					value || "";

				return;
			}


			/*
			 * Standard attribute
			 */
			el.setAttribute(
				name,
				value
			);
		}
	);
}