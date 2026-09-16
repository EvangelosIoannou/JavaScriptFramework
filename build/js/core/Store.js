import {
	signal,
	computed
}
from "./reactivity/index.js";


/* -------------------------------- */
/* STORE */
/* -------------------------------- */

export class Store {

	constructor(
		reducer,
		initialState = {}
	) {

		if (
			typeof reducer !== "function"
		) {

			throw new TypeError(
				"Store reducer must be a function"
			);
		}

		this.reducer =
			reducer;

		this._state =
			signal(
				initialState
			);

		this.listeners =
			new Set();

		/*
		 * Cache selectors by function identity.
		 *
		 * Store-level selectors remain available for
		 * the lifetime of the Store.
		 *
		 * Component-owned selectors are still tracked
		 * by their Owner and are stopped when that Owner
		 * is destroyed.
		 */
		this._selectors =
			new WeakMap();
	}


	/* -------------------------------- */
	/* DISPATCH */
	/* -------------------------------- */

	dispatch(
		action
	) {

		const currentState =
			this._state.peek();

		const nextState =
			this.reducer(
				currentState,
				action
			);

		/*
		 * Signal.set() handles reactive
		 * propagation and suppresses
		 * identical values.
		 */
		this._state.set(
			nextState
		);

		/*
		 * Preserve the Store's synchronous
		 * subscription API.
		 *
		 * Subscribers are only notified when
		 * the reducer returns a different
		 * state object.
		 */
		if (
			!Object.is(
				currentState,
				nextState
			)
		) {

			this.listeners.forEach(
				listener => {

					listener(
						nextState,
						currentState,
						action
					);
				}
			);
		}

		return nextState;
	}


	/* -------------------------------- */
	/* STATE */
	/* -------------------------------- */

	getState() {

		/*
		 * Deliberately use get(), rather than
		 * peek(), so calling getState() from
		 * an Effect or Computed automatically
		 * establishes a reactive dependency.
		 */
		return this._state.get();
	}


	/* -------------------------------- */
	/* SELECT */
	/* -------------------------------- */

	select(
		selector,
		owner = null
	) {

		if (
			typeof selector !== "function"
		) {

			throw new TypeError(
				"Store selector must be a function"
			);
		}

		/*
		 * A selector is identified by the
		 * selector function itself.
		 */
		let selected =
			this._selectors.get(
				selector
			);

		if (
			selected
		) {

			/*
			 * If an existing selector is found,
			 * return it rather than creating
			 * another Computed.
			 */
			return selected;
		}

		selected =
			computed(
				() =>
					selector(
						this._state.get()
					)
			);

		this._selectors.set(
			selector,
			selected
		);

		/*
		 * If an Owner was supplied, associate
		 * the selector with that Owner.
		 *
		 * Computed exposes stop(), so the Owner
		 * can dispose of it automatically.
		 */
		if (
			owner
			&&
			typeof owner.add === "function"
		) {

			owner.add(
				selected.stop
			);
		}

		return selected;
	}


	/* -------------------------------- */
	/* SUBSCRIBE */
	/* -------------------------------- */

	subscribe(
		listener
	) {

		if (
			typeof listener !== "function"
		) {

			throw new TypeError(
				"Store listener must be a function"
			);
		}

		this.listeners.add(
			listener
		);

		return () => {

			this.listeners.delete(
				listener
			);
		};
	}
}