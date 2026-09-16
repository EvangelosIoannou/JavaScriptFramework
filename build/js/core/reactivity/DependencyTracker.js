/* -------------------------------- */
/* DEPENDENCY TRACKER */
/* -------------------------------- */

/*
	The dependency tracker records which
	reactive observer is currently running.

	When a signal is read:

		signal.get()

	the signal registers itself with
	the active observer.

	This gives us:

	Signal
	    ↓
	Effect
	    ↓
	DOM
*/

/* -------------------------------- */
/* ACTIVE OBSERVER */
/* -------------------------------- */

let activeObserver =
	null;

/* -------------------------------- */
/* OBSERVER STACK */
/* -------------------------------- */

const observerStack =
	[];

/* -------------------------------- */
/* START TRACKING */
/* -------------------------------- */

export function startTracking(
	observer
) {

	observerStack.push(
		activeObserver
	);

	activeObserver =
		observer;
}

/* -------------------------------- */
/* STOP TRACKING */
/* -------------------------------- */

export function stopTracking() {

	activeObserver =
		observerStack.pop() ||
		null;
}

/* -------------------------------- */
/* ACTIVE OBSERVER */
/* -------------------------------- */

export function getActiveObserver() {

	return activeObserver;
}

/* -------------------------------- */
/* TRACK */
/* -------------------------------- */

export function track(
	dependency
) {

	if (
		!activeObserver
	) {

		return;
	}

	activeObserver.track(
		dependency
	);
}