import {
	startTracking,
	stopTracking
}
from "./DependencyTracker.js";

import {
	queueEffect
}
from "./Scheduler.js";

import {
	getCurrentOwner,
	withOwner
}
from "./Owner.js";

import {
	recordEffectCreated,
	recordEffectRun,
	recordEffectStopped
}
from "./Diagnostics.js";


let nextEffectId =
	1;


export function effect(
	fn,
	options = {}
) {

	const owner =
		options.owner ||
		getCurrentOwner();


	const observer = {

		id:
			nextEffectId++,

		dependencies:
			new Set(),

		cleanups:
			new Set(),

		running:
			false,

		scheduled:
			false,

		stopped:
			false,

		owner,


		/* ---------------------------- */
		/* TRACK */
		/* ---------------------------- */

		track(
			dependency
		) {

			if (
				this.stopped ||
				this.dependencies.has(
					dependency
				)
			) {

				return;
			}


			this.dependencies.add(
				dependency
			);


			const unsubscribe =
				dependency.subscribe(
					this
				);


			this.cleanups.add(
				unsubscribe
			);
		},


		/* ---------------------------- */
		/* SCHEDULE */
		/* ---------------------------- */

		schedule(
			newValue,
			oldValue
		) {

			if (
				this.stopped
			) {

				return;
			}


			this.latestNewValue =
				newValue;


			this.latestOldValue =
				oldValue;


			if (
				this.scheduled
			) {

				return;
			}


			this.scheduled =
				true;


			if (
				options.scheduler
			) {

				options.scheduler(
					() => {

						this.scheduled =
							false;


						this.run(
							this.latestNewValue,
							this.latestOldValue
						);
					}
				);


				return;
			}


			queueEffect(
				this
			);
		},


		/* ---------------------------- */
		/* CLEANUP */
		/* ---------------------------- */

		cleanup() {

			this.cleanups.forEach(
				unsubscribe => {

					unsubscribe();
				}
			);


			this.cleanups.clear();


			this.dependencies.clear();
		},


		/* ---------------------------- */
		/* RUN */
		/* ---------------------------- */

		run(
			newValue,
			oldValue
		) {

			if (
				this.stopped ||
				this.running
			) {

				return;
			}


			this.running =
				true;


			this.scheduled =
				false;


			recordEffectRun();


			this.cleanup();


			const execute =
				() => {

					startTracking(
						this
					);


					try {

						return fn(
							newValue,
							oldValue
						);

					}
					finally {

						stopTracking();

					}
				};


			try {

				if (
					this.owner
				) {

					return withOwner(
						this.owner,
						execute
					);
				}


				return execute();

			}
			finally {

				this.running =
					false;
			}
		},


		/* ---------------------------- */
		/* STOP */
		/* ---------------------------- */

		stop() {

			if (
				this.stopped
			) {

				return;
			}


			this.stopped =
				true;


			this.scheduled =
				false;


			this.cleanup();


			if (
				this.owner?.resources
			) {

				this.owner.resources.delete(
					stop
				);
			}


			recordEffectStopped();
		}
	};


	const stop =
		() => {

			observer.stop();

		};


	stop.observer =
		observer;


	stop.dependencies =
		observer.dependencies;


	stop.id =
		observer.id;


	stop.owner =
		owner;


	if (
		owner
	) {

		owner.add(
			stop
		);
	}


	recordEffectCreated();


	observer.run();


	return stop;
}