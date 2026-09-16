/*
 * --------------------------------
 * DOM PATCHER
 * --------------------------------
 *
 * Updates an existing DOM tree so that it matches
 * a newly-rendered DOM tree.
 *
 * This is intentionally NOT a Virtual DOM.
 *
 * The framework renders real DOM and this module
 * patches that DOM directly.
 */


/*
 * --------------------------------
 * PATCH ROOT
 * --------------------------------
 */

export function patchDOM(
	oldNode,
	newNode
) {

	if (
		!oldNode ||
		!newNode
	) {

		return newNode;
	}


	/*
	 * Different node types cannot be patched
	 * against each other.
	 */
	if (
		oldNode.nodeType !==
		newNode.nodeType
	) {

		oldNode.replaceWith(
			newNode
		);

		return newNode;
	}


	/*
	 * TEXT
	 */

	if (
		oldNode.nodeType === Node.TEXT_NODE
	) {

		if (
			oldNode.nodeValue !==
			newNode.nodeValue
		) {

			oldNode.nodeValue =
				newNode.nodeValue;
		}

		return oldNode;
	}


	/*
	 * COMMENT
	 */

	if (
		oldNode.nodeType === Node.COMMENT_NODE
	) {

		if (
			oldNode.nodeValue !==
			newNode.nodeValue
		) {

			oldNode.nodeValue =
				newNode.nodeValue;
		}

		return oldNode;
	}


	/*
	 * ELEMENT
	 */

	if (
		oldNode.nodeType === Node.ELEMENT_NODE
	) {

		if (
			oldNode.nodeName !==
			newNode.nodeName
		) {

			oldNode.replaceWith(
				newNode
			);

			return newNode;
		}


		patchAttributes(
			oldNode,
			newNode
		);


		patchChildren(
			oldNode,
			newNode
		);


		return oldNode;
	}


	/*
	 * Unknown node types.
	 *
	 * Replace rather than attempting to
	 * make assumptions about them.
	 */

	oldNode.replaceWith(
		newNode
	);

	return newNode;

}


/*
 * --------------------------------
 * ATTRIBUTES
 * --------------------------------
 */

function patchAttributes(
	oldElement,
	newElement
) {

	/*
	 * Remove attributes that no longer exist.
	 */

	for (
		const attribute of Array.from(
			oldElement.attributes
		)
	) {

		if (
			!newElement.hasAttribute(
				attribute.name
			)
		) {

			oldElement.removeAttribute(
				attribute.name
			);

		}

	}


	/*
	 * Add or update attributes.
	 */

	for (
		const attribute of Array.from(
			newElement.attributes
		)
	) {

		const oldValue =
			oldElement.getAttribute(
				attribute.name
			);

		if (
			oldValue !==
			attribute.value
		) {

			oldElement.setAttribute(
				attribute.name,
				attribute.value
			);

		}

	}

}


/*
 * --------------------------------
 * CHILDREN
 * --------------------------------
 */

function patchChildren(
	oldElement,
	newElement
) {

	const oldChildren =
		Array.from(
			oldElement.childNodes
		);

	const newChildren =
		Array.from(
			newElement.childNodes
		);


	const commonLength =
		Math.min(
			oldChildren.length,
			newChildren.length
		);


	/*
	 * Patch children that exist in both
	 * trees.
	 */

	for (
		let index = 0;
		index < commonLength;
		index++
	) {

		patchDOM(
			oldChildren[index],
			newChildren[index]
		);

	}


	/*
	 * Remove children that no longer exist.
	 */

	for (
		let index =
			oldChildren.length - 1;

		index >= newChildren.length;

		index--
	) {

		oldChildren[index].remove();

	}


	/*
	 * Append newly-created children.
	 */

	for (
		let index =
			oldChildren.length;

		index < newChildren.length;

		index++
	) {

		oldElement.appendChild(
			newChildren[index]
		);

	}

}