/* -------------------------------- */
/* RENDER SCOPE */
/* -------------------------------- */

/*
	A RenderScope contains temporary
	values created while compiling a
	template.

	Examples:

		for="user in users"

		user is stored in the scope.

	Or:

		for="item in items"

		item is stored in the scope.

	The component itself remains
	separate.
*/

export class RenderScope {

	constructor(
		parent = null,
		values = {}
	) {

		this.parent =
			parent;

		this.values = {

			...values
		};
	}

	/* -------------------------------- */
	/* GET */
	/* -------------------------------- */

	get(
		name
	) {

		if (
			Object.prototype.hasOwnProperty.call(
				this.values,
				name
			)
		) {

			return this.values[
				name
			];
		}

		if (
			this.parent
		) {

			return this.parent.get(
				name
			);
		}

		return undefined;
	}

	/* -------------------------------- */
	/* HAS */
	/* -------------------------------- */

	has(
		name
	) {

		if (
			Object.prototype.hasOwnProperty.call(
				this.values,
				name
			)
		) {

			return true;
		}

		if (
			this.parent
		) {

			return this.parent.has(
				name
			);
		}

		return false;
	}

	/* -------------------------------- */
	/* CHILD */
	/* -------------------------------- */

	child(
		values = {}
	) {

		return new RenderScope(
			this,
			values
		);
	}
}