import test from "node:test";
import assert from "node:assert/strict";

import { Store } from "../app/js/core/Store.js";

import { tokenise } from "../app/js/core/compiler/ExpressionTokeniser.js";
import { parseExpression } from "../app/js/core/compiler/ExpressionParser.js";
import { evaluateExpression } from "../app/js/core/compiler/ExpressionEvaluator.js";

import { signal } from "../app/js/core/reactivity/Signal.js";
import { effect } from "../app/js/core/reactivity/Effect.js";
import { computed } from "../app/js/core/reactivity/Computed.js";
import { arraySignal } from "../app/js/core/reactivity/ArraySignal.js";
import { Owner } from "../app/js/core/reactivity/Owner.js";
import {
	flush,
	clearScheduler,
	batch
}
from "../app/js/core/reactivity/Scheduler.js";


/* -------------------------------- */
/* EXPRESSION TOKENISER */
/* -------------------------------- */

test("expression tokeniser tokenises basic expression", () => {

	const tokens =
		tokenise(
			"foo + bar"
		);

	assert.deepEqual(
		tokens.map(
			token => token.value
		),
		[
			"foo",
			"+",
			"bar",
			null
		]
	);
});


/* -------------------------------- */
/* EXPRESSION PARSER */
/* -------------------------------- */

test("expression parser and evaluator resolve arithmetic", () => {

	const ast =
		parseExpression(
			"2 + 3 * 4"
		);

	const result =
		evaluateExpression(
			ast,
			{}
		);

	assert.equal(
		result,
		14
	);
});


/* -------------------------------- */
/* SIGNAL */
/* -------------------------------- */

test("signal stores and returns values", () => {

	const value =
		signal(10);

	assert.equal(
		value.get(),
		10
	);

	value.set(20);

	assert.equal(
		value.get(),
		20
	);
});


/* -------------------------------- */
/* EFFECT */
/* -------------------------------- */

test("effect reacts to signal changes", () => {

	const value =
		signal(0);

	const values = [];

	const stop =
		effect(
			() => {

				values.push(
					value.get()
				);
			}
		);

	assert.deepEqual(
		values,
		[
			0
		]
	);

	value.set(1);

	flush();

	assert.deepEqual(
		values,
		[
			0,
			1
		]
	);

	stop();
});


/* -------------------------------- */
/* BATCH */
/* -------------------------------- */

test("batch coalesces multiple signal updates", () => {

	const value =
		signal(0);

	const values = [];

	const stop =
		effect(
			() => {

				values.push(
					value.get()
				);
			}
		);

	batch(
		() => {

			value.set(1);
			value.set(2);
			value.set(3);
		}
	);

	flush();

	assert.deepEqual(
		values,
		[
			0,
			3
		]
	);

	stop();
});


/* -------------------------------- */
/* COMPUTED */
/* -------------------------------- */

test("computed derives values from signals", () => {

	const first =
		signal(2);

	const second =
		signal(3);

	const total =
		computed(
			() =>
				first.get()
				+
				second.get()
		);

	assert.equal(
		total.get(),
		5
	);

	first.set(10);

	flush();

	assert.equal(
		total.get(),
		13
	);

	total.stop();
});


/* -------------------------------- */
/* ARRAY SIGNAL */
/* -------------------------------- */

test("arraySignal manages reactive arrays", () => {

	const items =
		arraySignal(
			[
				1,
				2,
				3
			]
		);

	assert.deepEqual(
		items.get(),
		[
			1,
			2,
			3
		]
	);

	items.push(4);

	assert.deepEqual(
		items.get(),
		[
			1,
			2,
			3,
			4
		]
	);

	items.remove(2);

	assert.deepEqual(
		items.get(),
		[
			1,
			2,
			4
		]
	);

	items.clear();

	assert.deepEqual(
		items.get(),
		[]
	);
});


/* -------------------------------- */
/* OWNER */
/* -------------------------------- */

test("owner manages child resources", () => {

	const parent =
		new Owner();

	const child =
		parent.child();

	let cleaned =
		false;

	child.onCleanup(
		() => {

			cleaned = true;
		}
	);

	parent.destroy();

	assert.equal(
		cleaned,
		true
	);

	assert.equal(
		child.destroyed,
		true
	);

	assert.equal(
		parent.destroyed,
		true
	);
});


/* -------------------------------- */
/* STORE */
/* -------------------------------- */

test("store dispatch updates state", () => {

	const reducer = (
		state,
		action
	) => {

		switch (action.type) {

			case "LOGIN":

				return {
					...state,
					authenticated: true
				};

			case "LOGOUT":

				return {
					...state,
					authenticated: false
				};

			default:

				return state;
		}
	};

	const store =
		new Store(
			reducer,
			{
				authenticated: false
			}
		);

	assert.equal(
		store.getState().authenticated,
		false
	);

	store.dispatch({
		type: "LOGIN"
	});

	assert.equal(
		store.getState().authenticated,
		true
	);

	store.dispatch({
		type: "LOGOUT"
	});

	assert.equal(
		store.getState().authenticated,
		false
	);
});


test("store subscribe receives state changes", () => {

	const reducer = (
		state,
		action
	) => {

		if (
			action.type === "INCREMENT"
		) {

			return {
				...state,
				count:
					state.count + 1
			};
		}

		return state;
	};

	const store =
		new Store(
			reducer,
			{
				count: 0
			}
		);

	let calls = 0;
	let latestState = null;
	let previousState = null;
	let latestAction = null;

	const unsubscribe =
		store.subscribe(
			(
				nextState,
				oldState,
				action
			) => {

				calls++;

				latestState =
					nextState;

				previousState =
					oldState;

				latestAction =
					action;
			}
		);

	store.dispatch({
		type: "INCREMENT"
	});

	assert.equal(
		calls,
		1
	);

	assert.equal(
		latestState.count,
		1
	);

	assert.equal(
		previousState.count,
		0
	);

	assert.equal(
		latestAction.type,
		"INCREMENT"
	);

	unsubscribe();

	store.dispatch({
		type: "INCREMENT"
	});

	assert.equal(
		calls,
		1
	);
});


test("store does not notify subscribers when state is unchanged", () => {

	const reducer = (
		state,
		action
	) => {

		if (
			action.type === "NO_CHANGE"
		) {

			return state;
		}

		return {
			...state,
			value:
				action.value
		};
	};

	const store =
		new Store(
			reducer,
			{
				value: 1
			}
		);

	let calls = 0;

	store.subscribe(
		() => {

			calls++;
		}
	);

	store.dispatch({
		type: "NO_CHANGE"
	});

	assert.equal(
		calls,
		0
	);
});


test("store select creates a reactive value", () => {

	const reducer = (
		state,
		action
	) => {

		if (
			action.type === "LOGIN"
		) {

			return {
				...state,
				authenticated: true
			};
		}

		if (
			action.type === "LOGOUT"
		) {

			return {
				...state,
				authenticated: false
			};
		}

		return state;
	};

	const store =
		new Store(
			reducer,
			{
				authenticated: false
			}
		);

	const authenticated =
		store.select(
			state =>
				state.authenticated
		);

	assert.equal(
		authenticated.get(),
		false
	);

	store.dispatch({
		type: "LOGIN"
	});

	flush();

	assert.equal(
		authenticated.get(),
		true
	);

	store.dispatch({
		type: "LOGOUT"
	});

	flush();

	assert.equal(
		authenticated.get(),
		false
	);

	authenticated.stop();
});


test("store select caches selectors by function identity", () => {

	const reducer =
		state => state;

	const store =
		new Store(
			reducer,
			{
				value: 10
			}
		);

	const selector =
		state =>
			state.value;

	const first =
		store.select(
			selector
		);

	const second =
		store.select(
			selector
		);

	assert.strictEqual(
		first,
		second
	);

	first.stop();
});


test("store selectors participate in effects", () => {

	const reducer = (
		state,
		action
	) => {

		if (
			action.type === "SET"
		) {

			return {
				...state,
				value:
					action.value
			};
		}

		return state;
	};

	const store =
		new Store(
			reducer,
			{
				value: 1
			}
		);

	const value =
		store.select(
			state =>
				state.value
		);

	const values = [];

	const stop =
		effect(
			() => {

				values.push(
					value.get()
				);
			}
		);

	assert.deepEqual(
		values,
		[
			1
		]
	);

	store.dispatch({
		type: "SET",
		value: 2
	});

	store.dispatch({
		type: "SET",
		value: 3
	});

	flush();

	assert.deepEqual(
		values,
		[
			1,
			3
		]
	);

	stop();
	value.stop();
});

test("store selector participates in Owner lifecycle", () => {

	const reducer = (
		state,
		action
	) => {

		if (
			action.type === "SET"
		) {

			return {
				...state,
				value:
					action.value
			};
		}

		return state;
	};

	const store =
		new Store(
			reducer,
			{
				value: 1
			}
		);

	const owner =
		new Owner();

	const value =
		store.select(
			state =>
				state.value,
			owner
		);

	const values = [];

	effect(
		() => {

			values.push(
				value.get()
			);
		},
		{
			owner
		}
	);

	assert.deepEqual(
		values,
		[
			1
		]
	);

	store.dispatch({
		type: "SET",
		value: 2
	});

	flush();

	assert.deepEqual(
		values,
		[
			1,
			2
		]
	);

	/*
	 * Destroying the Owner must dispose both
	 * the Store selector and the Effect.
	 */
	owner.destroy();

	store.dispatch({
		type: "SET",
		value: 3
	});

	flush();

	assert.deepEqual(
		values,
		[
			1,
			2
		]
	);
});


/* -------------------------------- */
/* SCHEDULER CLEANUP */
/* -------------------------------- */

clearScheduler();