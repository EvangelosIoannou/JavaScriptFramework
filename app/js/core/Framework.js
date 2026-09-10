import {
	render,
	renderRoot
}
from "./VDom.js";

import {
	Owner
}
from "./reactivity/Owner.js";


export class Component {

	constructor(
		props = {},
		injector = null,
		parentOwner = null
	) {

		this.props = props;

		this.injector = injector;

		this.state = {};

		this.el = null;

		this._mounted = false;

		this._destroyed = false;

		this._unsubscribe = null;

		/*
		 * Component-level ownership.
		 *
		 * Everything owned by this component is disposed when
		 * the component is destroyed.
		 */
		this.owner = new Owner(
			parentOwner
		);

		/*
		 * Render-specific ownership.
		 *
		 * This is recreated whenever the component rerenders.
		 */
		this.renderOwner = null;


		/*
		 * Ensure the component's final destruction is tied to
		 * its owner.
		 */
		this.owner.onCleanup(
			() => {
				this._finalizeDestroy();
			}
		);
	}


	/*
	 * --------------------------------------------------------
	 * STATE
	 * --------------------------------------------------------
	 */

	setState(newState) {

		if (this._destroyed) {
			return;
		}

		this.state = {
			...this.state,
			...newState
		};

		this._rerender();
	}


	update() {

		this._rerender();
	}


	/*
	 * --------------------------------------------------------
	 * RENDER OWNERSHIP
	 * --------------------------------------------------------
	 */

	_renderWithOwner() {

		if (this._destroyed) {

			return document.createComment(
				"destroyed component"
			);
		}


		/*
		 * Destroy the previous render tree.
		 *
		 * This disposes reactive effects, keyed-list owners,
		 * etc. associated with the previous render.
		 */
		if (this.renderOwner) {

			this.renderOwner.destroy();

			this.renderOwner = null;
		}


		/*
		 * Every render receives a fresh child owner.
		 */
		this.renderOwner =
			this.owner.child();


		return this.renderOwner.run(
			() => this.render()
		);
	}


	/*
	 * --------------------------------------------------------
	 * MOUNT
	 * --------------------------------------------------------
	 */

	mount(container) {

		if (
			this._destroyed ||
			this._mounted
		) {
			return;
		}


		this.beforeMount();


		const rendered =
			this._renderWithOwner();


		/*
		 * IMPORTANT:
		 *
		 * Compiler templates can return a DocumentFragment.
		 * renderRoot() converts that into a stable root node.
		 */
		this.el =
			renderRoot(
				rendered,
				this.injector
			);


		container.innerHTML = "";


		if (this.el) {
			container.appendChild(
				this.el
			);
		}


		this._mounted = true;

		this.onMount();
	}


	/*
	 * --------------------------------------------------------
	 * RERENDER
	 * --------------------------------------------------------
	 */

	_rerender() {

		if (
			this._destroyed ||
			!this._mounted ||
			!this.el ||
			!this.el.parentNode
		) {
			return;
		}


		this.beforeUpdate();


		const parent =
			this.el.parentNode;


		const rendered =
			this._renderWithOwner();


		/*
		 * Use renderRoot() here as well.
		 *
		 * Without this, a compiler-generated DocumentFragment
		 * would become component.el after the first update.
		 */
		const newEl =
			renderRoot(
				rendered,
				this.injector
			);


		parent.replaceChild(
			newEl,
			this.el
		);


		this.el = newEl;


		this.onUpdate();

		this.afterUpdate();
	}


	/*
	 * --------------------------------------------------------
	 * DESTROY
	 * --------------------------------------------------------
	 */

	destroy() {

		if (this._destroyed) {
			return;
		}

		this._destroyed = true;

		this.owner.destroy();

		/*
		 * owner.destroy() normally invokes this through the
		 * owner cleanup, but keep this safe in case the
		 * lifecycle is reached independently.
		 */
		this._finalizeDestroy();
	}


	_finalizeDestroy() {

		if (
			this._destroyLifecycleComplete
		) {
			return;
		}


		this._destroyLifecycleComplete =
			true;


		/*
		 * External subscription cleanup.
		 */
		if (this._unsubscribe) {

			this._unsubscribe();

			this._unsubscribe = null;
		}


		this.beforeDestroy();


		/*
		 * Render owner should already have been destroyed by
		 * owner.destroy(), but this is intentionally defensive.
		 */
		if (
			this.renderOwner &&
			!this.renderOwner.destroyed
		) {

			this.renderOwner.destroy();
		}

		this.renderOwner = null;


		/*
		 * Remove the component's DOM root.
		 */
		if (
			this.el &&
			this.el.parentNode
		) {

			this.el.parentNode.removeChild(
				this.el
			);
		}


		this.el = null;

		this._mounted = false;


		this.onDestroy();
	}


	/*
	 * --------------------------------------------------------
	 * COMPONENT API
	 * --------------------------------------------------------
	 */

	methods() {
		return {};
	}


	beforeMount() {}

	onMount() {}

	beforeUpdate() {}

	onUpdate() {}

	afterUpdate() {}

	beforeDestroy() {}

	onDestroy() {}


	render() {

		throw new Error(
			"Render method required"
		);
	}
}