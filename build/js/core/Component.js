import {
	normaliseRoot
}
from "./DomRoot.js";

import {
	Owner
}
from "./reactivity/Owner.js";

import {
	patchDOM
}
from "./compiler/DomPatcher.js";


/* -------------------------------- */
/* COMPONENT */
/* -------------------------------- */

export class Component {

	constructor(
		props = {},
		injector = null,
		parentOwner = null
	) {

		this.props =
			props;

		this.injector =
			injector;

		this.state =
			{};

		this.el =
			null;

		this._mounted =
			false;

		this._destroyed =
			false;

		this._unsubscribe =
			null;


		/*
		 * --------------------------------
		 * COMPONENT OWNERSHIP
		 * --------------------------------
		 *
		 * The component owner represents the complete
		 * lifetime of the component.
		 *
		 * It is deliberately independent of any
		 * particular render owner.
		 *
		 * Therefore a component can survive multiple
		 * parent renders without losing its identity.
		 */
		this.owner =
			new Owner(
				parentOwner
			);


		/*
		 * --------------------------------
		 * RENDER OWNERSHIP
		 * --------------------------------
		 *
		 * Render ownership represents resources created
		 * by one particular render.
		 *
		 * A render owner may therefore be replaced while
		 * the component itself remains alive.
		 */
		this.renderOwner =
			null;


		/*
		 * --------------------------------
		 * CHILD COMPONENTS
		 * --------------------------------
		 *
		 * Child component identity belongs to the parent
		 * component rather than to a particular render.
		 *
		 * The key identifies the structural position of
		 * the child within the parent's render tree.
		 *
		 * Example:
		 *
		 *     0:card
		 *     1:sidebar
		 *     2:card
		 *
		 * This allows multiple components of the same
		 * class to coexist independently.
		 */
		this._children =
			new Map();


		/*
		 * Components encountered during the current
		 * render are recorded here.
		 *
		 * At the end of the render, children that were
		 * not encountered are destroyed.
		 */
		this._activeChildren =
			new Set();


		/*
		 * Sequential structural position used while
		 * generating the current render.
		 */
		this._childCursor =
			0;


		/*
		 * Lifecycle protection.
		 */
		this._destroyLifecycleComplete =
			false;


		/*
		 * Ensure final component destruction is tied
		 * to the component owner.
		 */
		this.owner.onCleanup(
			() => {

				this._finalizeDestroy();

			}
		);
	}


	/*
	 * --------------------------------
	 * STATE
	 * --------------------------------
	 */

	setState(
		newState
	) {

		if (
			this._destroyed
		) {

			return;

		}


		this.state = {

			...this.state,

			...newState

		};


		this.update();

	}


	update() {

		this._rerender();

	}


	/*
	 * --------------------------------
	 * CHILD COMPONENT RECONCILIATION
	 * --------------------------------
	 */

	_beginChildRender() {

		this._childCursor =
			0;

		this._activeChildren.clear();

	}


	/*
	 * Acquire an existing child component or create
	 * a new one.
	 *
	 * The component owner is attached to the parent
	 * component owner, NOT the current render owner.
	 */
	_acquireChild(
		identity,
		ComponentClass,
		props
	) {

		if (
			this._destroyed
		) {

			return null;

		}


		const key =
			String(
				identity
			);


		let child =
			this._children.get(
				key
			);


		/*
		 * Existing component.
		 *
		 * Preserve its complete identity.
		 */
		if (
			child &&
			!child._destroyed &&
			child.constructor === ComponentClass
		) {

			child.props =
				props;

		}
		else {

			/*
			 * If a component already occupies this
			 * structural position but has changed type,
			 * destroy the previous instance first.
			 */
			if (
				child &&
				!child._destroyed
			) {

				child.destroy();

			}


			child =
				new ComponentClass(
					props,
					this.injector,
					this.owner
				);


			this._children.set(
				key,
				child
			);

		}


		this._activeChildren.add(
			key
		);


		return child;

	}


	/*
	 * Mark the end of a parent render and destroy
	 * components that no longer exist in the render.
	 */
	_endChildRender() {

		for (
			const [
				key,
				child
			]
			of this._children
		) {

			if (
				this._activeChildren.has(
					key
				)
			) {

				continue;

			}


			if (
				child &&
				!child._destroyed
			) {

				child.destroy();

			}


			this._children.delete(
				key
			);

		}

	}


	/*
	 * Generate a stable structural identity for the
	 * next direct child component.
	 *
	 * This is deliberately based on the parent's
	 * component render position rather than DOM
	 * identity.
	 */
	_nextChildIdentity(
		ComponentClass
	) {

		const index =
			this._childCursor++;


		const name =
			ComponentClass?.name ||
			"component";


		return `${index}:${name}`;

	}


	/*
	 * Return the currently registered child components.
	 *
	 * This is primarily useful for diagnostics,
	 * framework internals and future reconciliation.
	 */
	_getChildren() {

		return this._children;

	}

	/*
	 * --------------------------------
	 * RENDER SCOPE
	 * --------------------------------
	 *
	 * Creates a scoped view of this component while
	 * preserving the component's prototype and identity.
	 *
	 * This is used by keyed-list rendering so expressions
	 * can access the current item scope without converting
	 * the Component instance into a plain object.
	 */
	_createRenderScope(
		scope
	) {

		const component =
			this;

		return new Proxy(
			component,
			{
				get(
					target,
					property,
					receiver
				) {

					if (
						property === "__scope"
					) {

						return scope;

					}

					return Reflect.get(
						target,
						property,
						receiver
					);

				}
			}
		);

	}


	/*
	 * --------------------------------
	 * RENDER OWNERSHIP
	 * --------------------------------
	 */

	_renderWithOwner() {

		if (
			this._destroyed
		) {

			return document.createComment(
				"destroyed component"
			);

		}


		/*
		 * Every render receives a fresh render owner.
		 *
		 * Child component owners are NOT children of
		 * this render owner. They belong to this component
		 * owner and therefore survive this operation.
		 */
		if (
			this.renderOwner
		) {

			this.renderOwner.destroy();

			this.renderOwner =
				null;

		}


		this.renderOwner =
			this.owner.child();


		/*
		 * Begin component reconciliation before the
		 * compiler starts generating child components.
		 */
		this._beginChildRender();


		try {

			return this.renderOwner.run(
				() =>
					this._render()
			);

		}
		finally {

			/*
			 * Any child that wasn't encountered by the
			 * new render no longer belongs to this render.
			 */
			this._endChildRender();

		}

	}


	/*
	 * --------------------------------
	 * MOUNT
	 * --------------------------------
	 */

	mount(
		container
	) {

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
		 * RENDER → DOM
		 *
		 * Convert the rendered result into a stable
		 * DOM root before entering the commit phase.
		 */
		const root =
			normaliseRoot(
				rendered
			);


		this._commitMount(
			container,
			root
		);

	}


	/*
	 * --------------------------------
	 * MOUNT COMMIT
	 * --------------------------------
	 */

	_commitMount(
		container,
		root
	) {

		/*
		 * Mounting owns the contents of the supplied
		 * container.
		 */
		container.innerHTML =
			"";


		if (
			root
		) {

			container.appendChild(
				root
			);

		}


		this.el =
			root;

		this._mounted =
			true;


		this.onMount();

	}


	/*
	 * --------------------------------
	 * RERENDER
	 * --------------------------------
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


		/*
		 * RENDER PHASE
		 *
		 * The component tree is regenerated.
		 *
		 * Child component instances are reconciled
		 * independently and may survive this render.
		 */
		const rendered =
			this._renderWithOwner();


		const newRoot =
			normaliseRoot(
				rendered
			);


		/*
		 * COMMIT PHASE
		 *
		 * Keep DOM mutation isolated from rendering.
		 */
		this._commitUpdate(
			parent,
			newRoot
		);

	}


	/*
	 * --------------------------------
	 * UPDATE COMMIT
	 * --------------------------------
	 */

	_commitUpdate(
		parent,
		newRoot
	) {

		const previousRoot =
			this.el;


		const patchedRoot =
			patchDOM(
				previousRoot,
				newRoot
			);


		/*
		 * patchDOM normally returns the existing root.
		 *
		 * If the root itself had to be replaced,
		 * it returns the new root.
		 */
		this.el =
			patchedRoot;


		this.onUpdate();

		this.afterUpdate();

	}


	/*
	 * --------------------------------
	 * DESTROY
	 * --------------------------------
	 */

	destroy() {

		if (
			this._destroyed
		) {

			return;

		}


		this._destroyed =
			true;


		/*
		 * Destroy the component owner.
		 *
		 * This recursively destroys:
		 *
		 *     child components
		 *     render resources
		 *     effects
		 *     keyed structures
		 *     other owned resources
		 */
		this.owner.destroy();


		/*
		 * owner.destroy() normally reaches this through
		 * the registered owner cleanup.
		 *
		 * Keep this call defensive in case the lifecycle
		 * is reached independently.
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
		if (
			this._unsubscribe
		) {

			this._unsubscribe();

			this._unsubscribe =
				null;

		}


		this.beforeDestroy();


		/*
		 * Render owner should normally already have
		 * been destroyed by owner.destroy().
		 *
		 * Keep this defensive.
		 */
		if (
			this.renderOwner &&
			!this.renderOwner.destroyed
		) {

			this.renderOwner.destroy();

		}


		this.renderOwner =
			null;


		/*
		 * The component owner has already destroyed
		 * all child components.
		 *
		 * Clear our references afterwards.
		 */
		this._children.clear();

		this._activeChildren.clear();


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


		this.el =
			null;

		this._mounted =
			false;


		this.onDestroy();

	}


	/*
	 * --------------------------------
	 * COMPONENT API
	 * --------------------------------
	 */

	methods() {

		return {};

	}


	/*
	 * --------------------------------
	 * LIFECYCLE
	 * --------------------------------
	 */

	beforeMount() {}

	onMount() {}

	beforeUpdate() {}

	onUpdate() {}

	afterUpdate() {}

	beforeDestroy() {}

	onDestroy() {}


	/*
	 * --------------------------------
	 * INTERNAL RENDER CONTRACT
	 * --------------------------------
	 */

	_render() {

		throw new Error(
			"Component _render() method required"
		);

	}

}