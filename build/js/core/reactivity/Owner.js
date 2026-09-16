/**
 * Owner
 *
 * Provides deterministic ownership and cleanup
 * for reactive resources.
 *
 * Ownership forms a tree:
 *
 * Component Owner
 *     |
 *     +-- Render Owner
 *           |
 *           +-- Effect
 *           +-- KeyedList
 *                 |
 *                 +-- Record Owner
 *                       |
 *                       +-- child effects
 */


import {
	createOwnerId,
	recordOwnerDestroyed
}
from "./Diagnostics.js";


let activeOwner =
	null;


const ownerStack =
	[];


/* -------------------------------- */
/* CURRENT OWNER */
/* -------------------------------- */

export function getCurrentOwner() {

	return activeOwner;
}


/* -------------------------------- */
/* WITH OWNER */
/* -------------------------------- */

export function withOwner(
	owner,
	fn
) {

	ownerStack.push(
		activeOwner
	);


	activeOwner =
		owner;


	try {

		return fn();

	}
	finally {

		activeOwner =
			ownerStack.pop() ||
			null;
	}
}


/* -------------------------------- */
/* OWNER */
/* -------------------------------- */

export class Owner {


	constructor(
		parent = null
	) {

		this.id =
			createOwnerId();


		this.parent =
			parent;

		this.resources =
			new Set();

		this.children =
			new Set();

		this.cleanups =
			new Set();

		this.destroyed =
			false;


		if (
			parent
		) {

			parent.addChild(
				this
			);
		}
	}


	/* -------------------------------- */
	/* RESOURCE */
	/* -------------------------------- */

	add(
		resource
	) {

		if (
			!resource
		) {

			return resource;
		}


		if (
			this.destroyed
		) {

			this.disposeResource(
				resource
			);

			return resource;
		}


		this.resources.add(
			resource
		);


		return resource;
	}


	/* -------------------------------- */
	/* CHILD */
	/* -------------------------------- */

	addChild(
		child
	) {

		if (
			!child
		) {

			return child;
		}


		if (
			this.destroyed
		) {

			child.destroy();

			return child;
		}


		this.children.add(
			child
		);


		return child;
	}


	/* -------------------------------- */
	/* CLEANUP */
	/* -------------------------------- */

	onCleanup(
		fn
	) {

		if (
			typeof fn !==
			"function"
		) {

			return () => {};
		}


		if (
			this.destroyed
		) {

			fn();

			return () => {};
		}


		this.cleanups.add(
			fn
		);


		return () => {

			this.cleanups.delete(
				fn
			);
		};
	}


	/* -------------------------------- */
	/* CHILD OWNER */
/* -------------------------------- */

	child() {

		return new Owner(
			this
		);
	}


	/* -------------------------------- */
	/* RUN */
/* -------------------------------- */

	run(
		fn
	) {

		return withOwner(
			this,
			fn
		);
	}


	/* -------------------------------- */
	/* DESTROY */
/* -------------------------------- */

	destroy() {

		if (
			this.destroyed
		) {

			return;
		}


		this.destroyed =
			true;


		const children =
			Array.from(
				this.children
			);


		this.children.clear();


		for (
			let index =
				children.length - 1;

			index >= 0;

			index--
		) {

			try {

				children[index].destroy();

			}
			catch (
				error
			) {

				console.error(
					"Error destroying child owner:",
					error
				);
			}
		}


		const cleanups =
			Array.from(
				this.cleanups
			);


		this.cleanups.clear();


		for (
			let index =
				cleanups.length - 1;

			index >= 0;

			index--
		) {

			try {

				cleanups[index]();

			}
			catch (
				error
			) {

				console.error(
					"Error running owner cleanup:",
					error
				);
			}
		}


		const resources =
			Array.from(
				this.resources
			);


		this.resources.clear();


		for (
			let index =
				resources.length - 1;

			index >= 0;

			index--
		) {

			try {

				this.disposeResource(
					resources[index]
				);

			}
			catch (
				error
			) {

				console.error(
					"Error destroying owned resource:",
					error
				);
			}
		}


		if (
			this.parent
		) {

			this.parent.children.delete(
				this
			);

			this.parent =
				null;
		}


		recordOwnerDestroyed();
	}


	/* -------------------------------- */
	/* DISPOSE RESOURCE */
	/* -------------------------------- */

	disposeResource(
		resource
	) {

		if (
			typeof resource ===
			"function"
		) {

			resource();

			return;
		}


		if (
			typeof resource.destroy ===
			"function"
		) {

			resource.destroy();

			return;
		}


		if (
			typeof resource.stop ===
			"function"
		) {

			resource.stop();
		}
	}
}