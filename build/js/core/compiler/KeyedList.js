import {
	signal
}
from "../reactivity/Signal.js";

import {
	Owner
}
from "../reactivity/Owner.js";

import {
	resolveExpression
}
from "../reactivity/ReactiveExpression.js";

import {
	createKeyedListId,
	recordKeyedListDestroyed
}
from "../reactivity/Diagnostics.js";


export class KeyedList {


	constructor(
		anchor,
		component,
		template,
		itemName,
		listExpression,
		keyExpression = null,
		parentOwner = null
	) {
		
		this.id = createKeyedListId();

		this.anchor =
			anchor;

		this.component =
			component;

		this.template =
			template;

		this.itemName =
			itemName;

		this.listExpression =
			listExpression;

		this.keyExpression =
			keyExpression;

		/*
		 * The list itself gets an owner.
		 *
		 * Every individual record created by
		 * this list will then receive its own
		 * child owner.
		 */
		this.owner =
			parentOwner
				? parentOwner.child()
				: new Owner();


		this.records =
			new Map();


		this.order =
			[];


		this.destroyed = false;
	}


	/* -------------------------------- */
	/* UPDATE */
	/* -------------------------------- */

	update(
		items
	) {
		if (
			this.destroyed
		) {

			return;
		}


		if (
			!Array.isArray(items)
		) {

			items =
				[];
		}


		const newRecords =
			new Map();


		const newOrder =
			[];


		items.forEach(
			(
				item,
				index
			) => {

				const keyScope =
					this.createKeyScope(
						item,
						index
					);


				const key =
					this.getKey(
						item,
						keyScope,
						index
					);


				/*
				 * Keys must be unique.
				 *
				 * Detect this before modifying
				 * the existing record collection.
				 */
				if (
					newRecords.has(key)
				) {

					throw new Error(
						`Duplicate key '${String(key)}' found in keyed list`
					);
				}


				let record =
					this.records.get(
						key
					);


				if (
					record
				) {

					/*
					 * Existing record.
					 *
					 * Preserve its owner and DOM.
					 */
					record.item =
						item;


					record.index =
						index;


					record.itemSignal.set(
						item
					);


					record.indexSignal.set(
						index
					);

				} else {

					record =
						this.createRecord(
							item,
							index,
							key
						);
				}


				newRecords.set(
					key,
					record
				);


				newOrder.push(
					record
				);
			}
		);


		/*
		 * Anything that existed previously but
		 * doesn't exist anymore must be destroyed.
		 */
		this.records.forEach(
			(
				record,
				key
			) => {

				if (
					!newRecords.has(key)
				) {

					this.destroyRecord(
						record
					);
				}
			}
		);


		this.reconcileDOM(
			newOrder
		);


		this.records =
			newRecords;


		this.order =
			newOrder;
	}


	/* -------------------------------- */
	/* REACTIVE SCOPE */
	/* -------------------------------- */

	createReactiveScope(
		item,
		index
	) {

		const itemSignal =
			signal(
				item
			);


		const indexSignal =
			signal(
				index
			);


		const scope =
			new Map();


		scope.set(
			this.itemName,
			itemSignal
		);


		scope.set(
			"index",
			indexSignal
		);


		return {
			scope,
			itemSignal,
			indexSignal
		};
	}


	/* -------------------------------- */
	/* KEY SCOPE */
	/* -------------------------------- */

	createKeyScope(
		item,
		index
	) {

		const scope =
			new Map();


		scope.set(
			this.itemName,
			item
		);


		scope.set(
			"index",
			index
		);


		return scope;
	}


	/* -------------------------------- */
	/* KEY */
	/* -------------------------------- */

	getKey(
		item,
		scope,
		index
	) {

		if (
			!this.keyExpression
		) {

			return index;
		}


		return resolveExpression(
			this.keyExpression,
			this.component,
			scope
		);
	}


	/* -------------------------------- */
	/* CREATE RECORD */
	/* -------------------------------- */

	createRecord(
		item,
		index,
		key
	) {

		const reactiveScope =
			this.createReactiveScope(
				item,
				index
			);


		/*
		 * Every record gets its own owner.
		 *
		 * Anything created while rendering this
		 * record will automatically inherit this
		 * owner.
		 */
		const recordOwner =
			this.owner.child();


		const nodes =
			recordOwner.run(
				() => {

					return this.renderItem(
						item,
						index,
						reactiveScope.scope
					);
				}
			);


		return {

			key,

			item,

			index,

			itemSignal:
				reactiveScope.itemSignal,

			indexSignal:
				reactiveScope.indexSignal,

			scope:
				reactiveScope.scope,

			nodes,

			owner:
				recordOwner
		};
	}


	/* -------------------------------- */
	/* RENDER ITEM */
	/* -------------------------------- */

	renderItem(
		item,
		index,
		scope
	) {

		const rendered =
			this.template(
				item,
				index,
				scope
			);


		if (
			rendered instanceof
			DocumentFragment
		) {

			return Array.from(
				rendered.childNodes
			);
		}


		return [
			rendered
		];
	}


	/* -------------------------------- */
	/* DESTROY RECORD */
	/* -------------------------------- */

	destroyRecord(
		record
	) {

		if (
			!record
		) {

			return;
		}


		/*
		 * Destroy reactive resources first.
		 *
		 * This prevents effects from continuing
		 * to operate against DOM that is about to
		 * disappear.
		 */
		if (
			record.owner
		) {

			record.owner.destroy();

			record.owner =
				null;
		}


		this.removeRecord(
			record
		);
	}


	/* -------------------------------- */
	/* REMOVE RECORD */
	/* -------------------------------- */

	removeRecord(
		record
	) {

		if (
			!record ||
			!record.nodes
		) {

			return;
		}


		record.nodes.forEach(
			node => {

				if (
					node.parentNode
				) {

					node.parentNode.removeChild(
						node
					);
				}
			}
		);
	}


	/* -------------------------------- */
	/* DOM RECONCILIATION */
	/* -------------------------------- */

	reconcileDOM(
		records
	) {

		const container =
			this.anchor.parentNode;


		if (
			!container
		) {

			return;
		}


		let reference =
			this.anchor;


		/*
		 * Work backwards so that each record
		 * is inserted immediately before the
		 * current reference node.
		 *
		 * Existing nodes are moved rather than
		 * recreated.
		 */
		for (
			let recordIndex =
				records.length - 1;

			recordIndex >= 0;

			recordIndex--
		) {

			const record =
				records[
					recordIndex
				];


			for (
				let nodeIndex =
					record.nodes.length - 1;

				nodeIndex >= 0;

				nodeIndex--
			) {

				const node =
					record.nodes[
						nodeIndex
					];


				container.insertBefore(
					node,
					reference
				);


				reference =
					node;
			}
		}
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


		/*
		 * Destroy the list owner first.
		 *
		 * This also destroys every record owner.
		 */
		this.owner.destroy();


		/*
		 * Remove any remaining DOM nodes.
		 */
		this.records.forEach(
			record => {

				this.removeRecord(
					record
				);
			}
		);


		this.records.clear();


		this.order =
			[];

		recordKeyedListDestroyed();
	}
}