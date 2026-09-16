export function normaliseRoot(
	node
) {

	if (
		node instanceof DocumentFragment
	) {

		const children =
			Array.from(
				node.childNodes
			);

		if (
			children.length === 0
		) {

			return document.createComment(
				"component-root"
			);
		}


		if (
			children.length === 1
		) {

			return children[0];
		}


		const wrapper =
			document.createElement(
				"div"
			);

		wrapper.dataset.componentRoot =
			"true";

		children.forEach(
			child => {

				wrapper.appendChild(
					child
				);
			}
		);

		return wrapper;
	}


	if (
		node instanceof Node
	) {

		return node;
	}


	if (
		node === null ||
		node === undefined
	) {

		return document.createComment(
			"component-root"
		);
	}


	return document.createTextNode(
		String(node)
	);
}