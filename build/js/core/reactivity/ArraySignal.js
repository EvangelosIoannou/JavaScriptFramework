import {
	signal
}
from "./Signal.js";

import {
	batch
}
from "./Scheduler.js";

/* -------------------------------- */
/* ARRAY SIGNAL */
/* -------------------------------- */

export function arraySignal(
	initial = []
) {

	const state =
		signal(
			[
				...initial
			]
		);

	return {

		/* ---------------------------- */
		/* GET */
		/* ---------------------------- */

		get() {

			return state.get();
		},

		/* ---------------------------- */
		/* SET */
		/* ---------------------------- */

		set(
			value
		) {

			state.set([
				...value
			]);
		},

		/* ---------------------------- */
		/* PUSH */
		/* ---------------------------- */

		push(
			...items
		) {

			batch(
				() => {

					state.set([

						...state.peek(),

						...items

					]);
				}
			);
		},

		/* ---------------------------- */
		/* POP */
/* ---------------------------- */

		pop() {

			let result;

			batch(
				() => {

					const copy = [

						...state.peek()

					];

					result =
						copy.pop();

					state.set(
						copy
					);
				}
			);

			return result;
		},

		/* ---------------------------- */
		/* REMOVE */
/* ---------------------------- */

		remove(
			index
		) {

			batch(
				() => {

					const copy = [

						...state.peek()

					];

					copy.splice(
						index,
						1
					);

					state.set(
						copy
					);
				}
			);
		},

		/* ---------------------------- */
		/* INSERT */
/* ---------------------------- */

		insert(
			index,
			...items
		) {

			batch(
				() => {

					const copy = [

						...state.peek()

					];

					copy.splice(

						index,

						0,

						...items
					);

					state.set(
						copy
					);
				}
			);
		},

		/* ---------------------------- */
		/* CLEAR */
/* ---------------------------- */

		clear() {

			state.set(
				[]
			);
		},

		/* ---------------------------- */
		/* LENGTH */
/* ---------------------------- */

		length() {

			return state.get()
				.length;
		},

		/* ---------------------------- */
		/* PEEK */
/* ---------------------------- */

		peek() {

			return state.peek();
		}
	};
}