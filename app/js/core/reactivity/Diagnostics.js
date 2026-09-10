/*
 * Reactive Diagnostics
 *
 * Lightweight development diagnostics for the reactive engine.
 *
 * Diagnostics are disabled by default.
 *
 * Notifications are microtask-coalesced so that a large number
 * of internal diagnostic events produces at most one subscriber
 * notification per microtask.
 */


let enabled =
	false;


let notificationPending =
	false;


let notificationScheduled =
	false;


let nextOwnerId =
	1;


let nextKeyedListId =
	1;


const listeners =
	new Set();


const state = {

	effects: {

		created:
			0,

		active:
			0,

		stopped:
			0,

		runs:
			0
	},

	owners: {

		created:
			0,

		active:
			0,

		destroyed:
			0
	},

	scheduler: {

		queued:
			0,

		flushes:
			0,

		batches:
			0,

		maxQueueSize:
			0
	},

	keyedLists: {

		created:
			0,

		active:
			0,

		destroyed:
			0
	}
};


/* -------------------------------- */
/* ENABLE */
/* -------------------------------- */

export function enableDiagnostics() {

	enabled =
		true;

	notify();

}


/* -------------------------------- */
/* DISABLE */
/* -------------------------------- */

export function disableDiagnostics() {

	enabled =
		false;

	notificationPending =
		false;

}


/* -------------------------------- */
/* ENABLED */
/* -------------------------------- */

export function isDiagnosticsEnabled() {

	return enabled;
}


/* -------------------------------- */
/* SUBSCRIBE */
/* -------------------------------- */

export function subscribeDiagnostics(
	listener
) {

	if (
		typeof listener !==
		"function"
	) {

		return () => {};
	}


	listeners.add(
		listener
	);


	/*
	 * Immediately provide the current
	 * state to a new subscriber.
	 */
	if (
		enabled
	) {

		try {

			listener(
				getDiagnostics()
			);

		}
		catch (
			error
		) {

			console.error(
				"Diagnostics listener error:",
				error
			);
		}
	}


	return () => {

		listeners.delete(
			listener
		);
	};
}


/* -------------------------------- */
/* SNAPSHOT */
/* -------------------------------- */

export function getDiagnostics() {

	return {

		enabled,

		effects: {

			...state.effects

		},

		owners: {

			...state.owners

		},

		scheduler: {

			...state.scheduler

		},

		keyedLists: {

			...state.keyedLists

		}
	};
}


/* -------------------------------- */
/* RESET */
/* -------------------------------- */

export function resetDiagnostics() {

	state.effects.created =
		0;

	state.effects.active =
		0;

	state.effects.stopped =
		0;

	state.effects.runs =
		0;


	state.owners.created =
		0;

	state.owners.active =
		0;

	state.owners.destroyed =
		0;


	state.scheduler.queued =
		0;

	state.scheduler.flushes =
		0;

	state.scheduler.batches =
		0;

	state.scheduler.maxQueueSize =
		0;


	state.keyedLists.created =
		0;

	state.keyedLists.active =
		0;

	state.keyedLists.destroyed =
		0;


	notify();
}


/* -------------------------------- */
/* EFFECT CREATED */
/* -------------------------------- */

export function recordEffectCreated() {

	if (
		!enabled
	) {

		return;
	}


	state.effects.created++;
	state.effects.active++;


	notify();
}


/* -------------------------------- */
/* EFFECT RUN */
/* -------------------------------- */

export function recordEffectRun() {

	if (
		!enabled
	) {

		return;
	}


	state.effects.runs++;

	/*
	 * Runs are intentionally not individually
	 * notified.
	 *
	 * The eventual state is included in the
	 * next coalesced notification.
	 */
}


/* -------------------------------- */
/* EFFECT STOPPED */
/* -------------------------------- */

export function recordEffectStopped() {

	if (
		!enabled
	) {

		return;
	}


	state.effects.stopped++;


	if (
		state.effects.active > 0
	) {

		state.effects.active--;
	}


	notify();
}


/* -------------------------------- */
/* OWNER CREATED */
/* -------------------------------- */

export function createOwnerId() {

	const id =
		nextOwnerId++;


	if (
		enabled
	) {

		state.owners.created++;
		state.owners.active++;


		notify();
	}


	return id;
}


/* -------------------------------- */
/* OWNER DESTROYED */
/* -------------------------------- */

export function recordOwnerDestroyed() {

	if (
		!enabled
	) {

		return;
	}


	state.owners.destroyed++;


	if (
		state.owners.active > 0
	) {

		state.owners.active--;
	}


	notify();
}


/* -------------------------------- */
/* EFFECT QUEUED */
/* -------------------------------- */

export function recordEffectQueued(
	queueSize
) {

	if (
		!enabled
	) {

		return;
	}


	state.scheduler.queued++;


	if (
		queueSize >
		state.scheduler.maxQueueSize
	) {

		state.scheduler.maxQueueSize =
			queueSize;
	}


	notify();
}


/* -------------------------------- */
/* FLUSH */
/* -------------------------------- */

export function recordFlush() {

	if (
		!enabled
	) {

		return;
	}


	state.scheduler.flushes++;


	notify();
}


/* -------------------------------- */
/* BATCH */
/* -------------------------------- */

export function recordBatch() {

	if (
		!enabled
	) {

		return;
	}


	state.scheduler.batches++;


	notify();
}


/* -------------------------------- */
/* KEYED LIST CREATED */
/* -------------------------------- */

export function createKeyedListId() {

	const id =
		nextKeyedListId++;


	if (
		enabled
	) {

		state.keyedLists.created++;
		state.keyedLists.active++;


		notify();
	}


	return id;
}


/* -------------------------------- */
/* KEYED LIST DESTROYED */
/* -------------------------------- */

export function recordKeyedListDestroyed() {

	if (
		!enabled
	) {

		return;
	}


	state.keyedLists.destroyed++;


	if (
		state.keyedLists.active > 0
	) {

		state.keyedLists.active--;
	}


	notify();
}


/* -------------------------------- */
/* NOTIFY */
/* -------------------------------- */

function notify() {

	if (
		!enabled
	) {

		return;
	}


	notificationPending =
		true;


	if (
		notificationScheduled
	) {

		return;
	}


	notificationScheduled =
		true;


	queueMicrotask(
		flushNotifications
	);
}


/* -------------------------------- */
/* FLUSH NOTIFICATIONS */
/* -------------------------------- */

function flushNotifications() {

	notificationScheduled =
		false;


	if (
		!enabled ||
		!notificationPending
	) {

		notificationPending =
			false;

		return;
	}


	notificationPending =
		false;


	const snapshot =
		getDiagnostics();


	/*
	 * Snapshot the listeners so that a listener
	 * can safely unsubscribe itself while the
	 * notification is being delivered.
	 */
	const currentListeners =
		Array.from(
			listeners
		);


	currentListeners.forEach(
		listener => {

			try {

				listener(
					snapshot
				);

			}
			catch (
				error
			) {

				console.error(
					"Diagnostics listener error:",
					error
				);
			}
		}
	);
}