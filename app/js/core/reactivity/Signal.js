import {
	track
}
from "./DependencyTracker.js";

/* -------------------------------- */
/* SIGNAL */
/* -------------------------------- */

export function signal(
	initialValue
) {

	let value =
		initialValue;

	const subscribers =
		new Set();

	const state = {

		/* ---------------------------- */
		/* GET */
		/* ---------------------------- */

		get() {

			track(
				state
			);

			return value;
		},

		/* ---------------------------- */
		/* SET */
		/* ---------------------------- */

		set(
			newValue
		) {

			if (
				Object.is(
					value,
					newValue
				)
			) {

				return;
			}

			const oldValue =
				value;

			value =
				newValue;

			/*
				Notify every observer that
				depends on this signal.

				The observer itself decides
				how the update is scheduled.
			*/

			subscribers.forEach(
				observer => {

					observer.schedule(

						newValue,

						oldValue
					);
				}
			);
		},

		/* ---------------------------- */
		/* SUBSCRIBE */
		/* ---------------------------- */

		subscribe(
			observer
		) {

			subscribers.add(
				observer
			);

			return () => {

				subscribers.delete(
					observer
				);
			};
		},

		/* ---------------------------- */
		/* PEEK */
/* ---------------------------- */

		/*
			peek() reads the signal without
			registering a dependency.
		*/

		peek() {

			return value;
		},

		/* ---------------------------- */
		/* SUBSCRIBER COUNT */
/* ---------------------------- */

		getSubscriberCount() {

			return subscribers.size;
		}
	};

	return state;
}