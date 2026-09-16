/*
 * --------------------------------
 * RENDER INSTANCE
 * --------------------------------
 *
 * Represents the runtime render tree belonging
 * to a component.
 *
 * A RenderInstance has a lifetime that matches
 * the component's mounted render tree.
 *
 * It is intentionally NOT a Virtual DOM.
 *
 * The framework continues to operate directly
 * on real DOM nodes.
 */

export class RenderInstance {

	constructor(
		component,
		owner
	) {

		this.component =
			component;

		this.owner =
			owner;

		this.root =
			null;

		this.mounted =
			false;

	}


	/*
	 * --------------------------------
	 * INITIALISE
	 * --------------------------------
	 */

	initialise(
		root
	) {

		this.root =
			root;

		this.mounted =
			true;

		return root;

	}


	/*
	 * --------------------------------
	 * DESTROY
	 * --------------------------------
	 */

	destroy() {

		if (
			!this.mounted
		) {

			return;

		}


		this.mounted =
			false;


		this.root =
			null;

		this.component =
			null;

		this.owner =
			null;

	}

}