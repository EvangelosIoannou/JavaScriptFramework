/* -------------------------------- */
/* FOR DIRECTIVE */
/* -------------------------------- */

export function processFor(
	anchor,
	listSignal,
	itemName,
	renderItem
) {

	const fragment =
		document.createDocumentFragment();

	/* ---------------------------- */
	/* INITIAL RENDER */
	/* ---------------------------- */

	const items =
		getList(
			listSignal
		);

	items.forEach(
		(
			item,
			index
		) => {

			const dom =
				renderItem(
					item,
					index
				);

			if (
				dom
			) {

				fragment.appendChild(
					dom
				);
			}
		}
	);

	/* ---------------------------- */
	/* RETURN */
	/* ---------------------------- */

	return fragment;
}

/* -------------------------------- */
/* GET LIST */
/* -------------------------------- */

function getList(
	value
) {

	if (
		value &&
		typeof value.get ===
			"function"
	) {

		return value.get() || [];
	}

	return Array.isArray(
		value
	)
		?

		value

		:

		[];
}