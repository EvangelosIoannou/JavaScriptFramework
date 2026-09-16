import {
	CompilerComponent
}
from "../js/core/CompilerComponent.js";


/* -------------------------------- */
/* HOME */
/* -------------------------------- */

export default class Home
extends CompilerComponent {

	constructor(
		props,
		injector,
		parentOwner
	) {

		super(
			props,
			injector,
			parentOwner
		);

		/*
		 * Retrieve the application Store
		 * through the dependency injector.
		 */
		this.store =
			injector.get(
				"store"
			);

		/*
		 * Create an Owner-aware selector.
		 *
		 * The selector is tied to this
		 * component's lifetime and will
		 * automatically be disposed when
		 * the component is destroyed.
		 */
		this.authenticated =
			this.store.select(
				state =>
					state.authenticated,
				this.owner
			);
	}


	/* -------------------------------- */
	/* TEMPLATE */
	/* -------------------------------- */

	template() {

		return `
			<div>

				<h1>
					Home
				</h1>

				<p>
					Authenticated:
					{{ authenticated }}
				</p>

			</div>
		`;
	}
}