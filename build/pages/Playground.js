import {
	CompilerComponent
}
from "../js/core/CompilerComponent.js";

import {
	signal,
	arraySignal,
	batch,
	effect,
	enableDiagnostics,
	disableDiagnostics,
	getDiagnostics,
	resetDiagnostics,
	resolveExpression
}
from "../js/core/reactivity/index.js";

import {
	registerComponent
}
from "../js/core/ComponentRegistry.js";


/*
 * ============================================================
 * OWNERSHIP TEST COMPONENT
 * ============================================================
 *
 * This is deliberately kept outside Playground.
 *
 * It gives us a real Component instance with:
 *
 *   - its own Owner
 *   - its own signal
 *   - its own reactive effect
 *
 * so that we can test exactly what happens when the component
 * is created with or without a parent owner.
 */

class OwnershipTestChild
	extends CompilerComponent {


	constructor(
		props = {},
		injector = null,
		parentOwner = null
	) {

		super(
			props,
			injector,
			parentOwner
		);


		this.testValue =
			signal(0);


		this.effectRuns =
			0;


		/*
		 * This effect is intentionally owned by the
		 * component.
		 *
		 * It should stop when the component's owner
		 * is destroyed.
		 */
		this.testEffect =
			effect(
				() => {

					this.testValue.get();

					this.effectRuns++;

				},
				{
					owner:
						this.owner
				}
			);
	}


	template() {

		return `
			<div class="ownership-test-child">
				Ownership Test Child
			</div>
		`;

	}
}


/*
 * ============================================================
 * KEYED LIST OWNERSHIP TEST COMPONENT
 * ============================================================
 *
 * This component is rendered by the compiler inside a real
 * keyed list.
 *
 * It deliberately owns an effect so we can verify:
 *
 *   - the KeyedList record owner becomes the component owner's
 *     parent
 *
 *   - the component retains its identity during keyed moves
 *
 *   - destroying a keyed record destroys the component owner
 *
 *   - destroying the owner stops the component's effects
 */

let nextKeyedListOwnershipItemId = 1;


class KeyedListOwnershipItem
	extends CompilerComponent {


	constructor(
		props = {},
		injector = null,
		parentOwner = null
	) {

		super(
			props,
			injector,
			parentOwner
		);


		this.testId =
			nextKeyedListOwnershipItemId++;


		this.testValue =
			signal(0);


		this.effectRuns =
			0;


		this.testEffect =
			effect(
				() => {

					this.testValue.get();

					this.effectRuns++;

				},
				{
					owner:
						this.owner
				}
			);
	}


	template() {

		return `
			<div class="keyed-list-ownership-item">
				Component #${this.testId}
				|
				Owner ${this.owner?.id ?? "?"}
			</div>
		`;

	}
}


/*
 * Register the test component through the real component
 * registry used by the compiler.
 */
registerComponent(
	"KEYEDLISTOWNERSHIPITEM",
	KeyedListOwnershipItem
);


/*
 * ============================================================
 * PLAYGROUND
 * ============================================================
 */

export default class Playground
	extends CompilerComponent {


	constructor(
		props,
		injector
	) {

		super(
			props,
			injector
		);


		/* -------------------------------- */
		/* SIGNALS */
		/* -------------------------------- */

		this.firstName =
			signal(
				"John"
			);


		this.lastName =
			signal(
				"Smith"
			);


		this.age =
			signal(
				32
			);


		this.isActive =
			signal(
				true
			);


		this.users =
			arraySignal([
				{
					id: 1,
					name: "John",
					role: "Developer"
				},
				{
					id: 2,
					name: "Jane",
					role: "Designer"
				},
				{
					id: 3,
					name: "Mike",
					role: "Manager"
				}
			]);


		/* -------------------------------- */
		/* DIAGNOSTICS */
		/* -------------------------------- */

		this.diagnostics =
			getDiagnostics();


		/* -------------------------------- */
		/* OWNERSHIP TEST */
		/* -------------------------------- */

		this.ownershipTest = {

			status:
				"Not run",

			passed:
				false,

			parentOwner:
				null,

			correctChildOwner:
				null,

			incorrectChildOwner:
				null,

			correctChildEffectRuns:
				0,

			incorrectChildEffectRuns:
				0,

			correctChildStopped:
				false,

			incorrectChildStopped:
				false
		};


		/* -------------------------------- */
		/* KEYED LIST OWNERSHIP TEST */
		/* -------------------------------- */

		/*
		 * These are individual signals rather than one mutable
		 * object.
		 *
		 * This is important because changing the test result must
		 * not cause the entire Playground to rerender.
		 *
		 * A full Playground rerender would destroy and recreate
		 * the KeyedList we are specifically trying to test.
		 */

		this.keyedOwnershipStatus =
			signal(
				"Not run"
			);


		this.keyedOwnershipPassed =
			signal(
				false
			);


		this.keyedOwnershipDetails =
			signal(
				"No test has been run."
			);


		this.keyedOwnershipInitial =
			signal(
				"-"
			);


		this.keyedOwnershipAfterAdd =
			signal(
				"-"
			);


		this.keyedOwnershipAfterRemove =
			signal(
				"-"
			);


		this.keyedOwnershipAfterShuffle =
			signal(
				"-"
			);


		this.keyedOwnershipCycles =
			signal(
				"-"
			);
	}


	/*
	 * ========================================================
	 * DIAGNOSTICS EXPRESSION TEST
	 * ========================================================
	 */

	testDiagnosticsExpression() {

		console.log(
			"Component diagnostics:",
			this.diagnostics
		);


		console.log(
			"Component diagnostics.enabled:",
			this.diagnostics.enabled
		);
	}


	/*
	 * ========================================================
	 * DEPENDENCY TEST
	 * ========================================================
	 */

	testDependencies() {

		console.log(
			"Dependency test"
		);
	}


	/*
	 * ========================================================
	 * NAME
	 * ========================================================
	 */

	changeName() {

		this.firstName.set(

			this.firstName.get() ===
			"John"

				?

				"Jane"

				:

				"John"
		);
	}


	/*
	 * ========================================================
	 * BATCH
	 * ========================================================
	 */

	batchTest() {

		batch(
			() => {

				this.firstName.set(
					"Jane"
				);


				this.lastName.set(
					"Jones"
				);


				this.age.set(
					this.age.peek() + 1
				);
			}
		);
	}


	/*
	 * ========================================================
	 * AGE
	 * ========================================================
	 */

	increaseAge() {

		this.age.set(
			this.age.get() + 1
		);
	}


	/*
	 * ========================================================
	 * ACTIVE
	 * ========================================================
	 */

	toggleActive() {

		this.isActive.set(
			!this.isActive.get()
		);
	}


	/*
	 * ========================================================
	 * ADD USER
	 * ========================================================
	 */

	addUser() {

		const users =
			this.users.peek();


		const nextId =
			users.length

				?

				Math.max(
					...users.map(
						user =>
							user.id
					)
				) + 1

				:

				1;


		this.users.push({

			id:
				nextId,

			name:
				`User ${nextId}`,

			role:
				"Developer"
		});
	}


	/*
	 * ========================================================
	 * REMOVE USER
	 * ========================================================
	 */

	removeUser() {

		const users =
			this.users.peek();


		if (
			!users.length
		) {

			return;
		}


		this.users.remove(
			users.length - 1
		);
	}


	/*
	 * ========================================================
	 * SHUFFLE USERS
	 * ========================================================
	 */

	shuffleUsers() {

		const shuffled = [

			...this.users.peek()

		];


		for (
			let i =
				shuffled.length - 1;

			i > 0;

			i--
		) {

			const j =
				Math.floor(
					Math.random() *
					(i + 1)
				);


			[
				shuffled[i],
				shuffled[j]
			] = [

				shuffled[j],
				shuffled[i]
			];
		}


		this.users.set(
			shuffled
		);
	}


	/*
	 * ========================================================
	 * OWNERSHIP TEST
	 * ========================================================
	 *
	 * This deliberately creates two children:
	 *
	 *   1. Correct:
	 *      parentOwner = this.renderOwner
	 *
	 *   2. Current-style behaviour:
	 *      parentOwner = null
	 *
	 * We then destroy the children and verify that their effects
	 * stop correctly.
	 */

	testComponentOwnership() {

		console.log(
			"========================================"
		);


		console.log(
			"PLAYGROUND: Component ownership test"
		);


		/*
		 * We need the current render owner.
		 */
		const parentOwner =
			this.renderOwner;


		if (!parentOwner) {

			console.error(
				"Ownership test failed: renderOwner is missing."
			);


			this.ownershipTest = {

				...this.ownershipTest,

				status:
					"FAILED - no render owner",

				passed:
					false
			};


			this.update();


			return;
		}


		console.log(
			"Parent render owner:",
			parentOwner
		);


		/*
		 * ----------------------------------------------------
		 * CHILD 1
		 * ----------------------------------------------------
		 *
		 * This is the ownership relationship we ultimately
		 * want.
		 */

		const correctChild =
			new OwnershipTestChild(
				{},
				this.injector,
				parentOwner
			);


		console.log(
			"Correct child owner:",
			correctChild.owner
		);


		console.log(
			"Correct child parent:",
			correctChild.owner.parent
		);


		const correctParentRelationship =
			correctChild.owner.parent ===
			parentOwner;


		/*
		 * ----------------------------------------------------
		 * CHILD 2
		 * ----------------------------------------------------
		 *
		 * This mirrors the unowned construction behaviour.
		 */

		const incorrectChild =
			new OwnershipTestChild(
				{},
				this.injector
			);


		console.log(
			"Current-style child owner:",
			incorrectChild.owner
		);


		console.log(
			"Current-style child parent:",
			incorrectChild.owner.parent
		);


		const incorrectParentRelationship =
			incorrectChild.owner.parent ===
			parentOwner;


		/*
		 * ----------------------------------------------------
		 * EFFECT TEST
		 * ----------------------------------------------------
		 */

		const correctInitialRuns =
			correctChild.effectRuns;


		const incorrectInitialRuns =
			incorrectChild.effectRuns;


		/*
		 * Trigger the effects.
		 */

		correctChild.testValue.set(
			1
		);


		incorrectChild.testValue.set(
			1
		);


		/*
		 * Effects are scheduled, so force the scheduler to
		 * flush through the normal microtask path.
		 *
		 * The remainder of the test is performed after the
		 * current call stack.
		 */

		queueMicrotask(
			() => {

				const correctRunsBeforeDestroy =
					correctChild.effectRuns;


				const incorrectRunsBeforeDestroy =
					incorrectChild.effectRuns;


				/*
				 * ------------------------------------------------
				 * DESTROY CHILDREN
				 * ------------------------------------------------
				 */

				correctChild.destroy();


				incorrectChild.destroy();


				const correctStopped =
					correctChild._destroyed &&
					correctChild.owner.destroyed;


				const incorrectStopped =
					incorrectChild._destroyed &&
					incorrectChild.owner.destroyed;


				/*
				 * ------------------------------------------------
				 * RESULT
				 * ------------------------------------------------
				 */

				const passed =
					correctParentRelationship &&
					!incorrectParentRelationship &&
					correctStopped &&
					incorrectStopped;


				this.ownershipTest = {

					status:
						passed
							? "Passed"
							: "Failed",

					passed,

					parentOwner:
						parentOwner.id,

					correctChildOwner:
						correctChild.owner.id,

					incorrectChildOwner:
						incorrectChild.owner.id,

					correctChildEffectRuns:
						correctRunsBeforeDestroy,

					incorrectChildEffectRuns:
						incorrectRunsBeforeDestroy,

					correctChildStopped:
						correctStopped,

					incorrectChildStopped:
						incorrectStopped,

					correctInitialRuns,
					incorrectInitialRuns
				};


				console.log(
					"Ownership test result:",
					this.ownershipTest
				);


				console.log(
					"Correct parent relationship:",
					correctParentRelationship
				);


				console.log(
					"Current-style parent relationship:",
					incorrectParentRelationship
				);


				console.log(
					"Correct child stopped:",
					correctStopped
				);


				console.log(
					"Current-style child stopped:",
					incorrectStopped
				);


				/*
				 * Refresh the Playground UI.
				 */
				this.update();


				console.log(
					"========================================"
				);
			}
		);
	}


	/*
	 * ========================================================
	 * KEYED LIST OWNERSHIP TEST HELPERS
	 * ========================================================
	 */

	getKeyedOwnershipRows() {

		return Array.from(
			document.querySelectorAll(
				"[data-keyed-ownership-row]"
			)
		);
	}


	getKeyedOwnershipComponents() {

		const components =
			new Map();


		this.getKeyedOwnershipRows().forEach(
			row => {

				const userIdElement =
					row.querySelector(
						".keyed-ownership-user-id"
					);


				const userId =
					Number(
						userIdElement?.textContent?.trim()
					);


				const element =
					row.querySelector(
						".keyed-list-ownership-item"
					);


				const component =
					element?.__component;


				if (
					Number.isFinite(userId) &&
					component
				) {

					components.set(
						userId,
						component
					);
				}
			}
		);


		return components;
	}


	getKeyedOwnershipOrder() {

		return this.getKeyedOwnershipRows().map(
			row => {

				const userIdElement =
					row.querySelector(
						".keyed-ownership-user-id"
					);

				return Number(
					userIdElement?.textContent?.trim()
				);
			}
		);
	}


	waitForReactiveUpdate() {

		return new Promise(
			resolve => {

				queueMicrotask(
					() =>
						queueMicrotask(
							resolve
						)
				);
			}
		);
	}


	setKeyedOwnershipResult(
		status,
		passed,
		details
	) {

		this.keyedOwnershipStatus.set(
			status
		);


		this.keyedOwnershipPassed.set(
			passed
		);


		this.keyedOwnershipDetails.set(
			details
		);
	}


	/*
	 * ========================================================
	 * KEYED LIST COMPONENT OWNERSHIP TEST
	 * ========================================================
	 *
	 * This tests the actual compiler path rather than manually
	 * constructing a Component.
	 *
	 * We verify:
	 *
	 *   1. Each keyed component receives a parent owner.
	 *   2. The component survives keyed reordering.
	 *   3. The component instance and owner identity survive
	 *      shuffle.
	 *   4. Adding a keyed item creates a fresh component/owner.
	 *   5. Removing a keyed item destroys its owner and effect.
	 *   6. Repeated add/remove cycles do not leave the effect
	 *      running.
	 */

	async testKeyedListComponentOwnership() {

		console.log(
			"========================================"
		);


		console.log(
			"PLAYGROUND: Keyed list component ownership test"
		);


		this.setKeyedOwnershipResult(
			"Running...",
			false,
			"Testing compiler-generated components inside a keyed list."
		);


		/*
		 * Reset the list to the known initial data.
		 *
		 * This deliberately uses the signal rather than
		 * this.update().
		 *
		 * A full Playground rerender would recreate the keyed
		 * list and make identity testing meaningless.
		 */

		this.users.set([
			{
				id: 1,
				name: "John",
				role: "Developer"
			},
			{
				id: 2,
				name: "Jane",
				role: "Designer"
			},
			{
				id: 3,
				name: "Mike",
				role: "Manager"
			}
		]);


		await this.waitForReactiveUpdate();


		/*
		 * ----------------------------------------------------
		 * INITIAL CREATION
		 * ----------------------------------------------------
		 */

		const initial =
			this.getKeyedOwnershipComponents();


		const initialOrder =
			this.getKeyedOwnershipOrder();


		this.keyedOwnershipInitial.set(
			initialOrder.join(
				" -> "
			)
		);


		console.log(
			"Initial keyed component map:",
			initial
		);


		/*
		 * Every component must have:
		 *
		 *   component.owner
		 *   component.owner.parent
		 *   component.renderOwner
		 *   component.renderOwner.parent === component.owner
		 */

		const initialComponentsValid =
			[1, 2, 3].every(
				id => {

					const component =
						initial.get(
							id
						);


					return Boolean(

						component?.owner &&

						component.owner.parent &&

						component.renderOwner &&

						component.renderOwner.parent ===
							component.owner

					);
				}
			);


		if (!initialComponentsValid) {

			this.setKeyedOwnershipResult(
				"Failed",
				false,
				"One or more initial keyed components did not receive the expected owner hierarchy."
			);


			console.error(
				"Initial keyed component ownership failed:",
				initial
			);


			return;
		}


		/*
		 * ----------------------------------------------------
		 * ADD TEST
		 * ----------------------------------------------------
		 */

		this.addUser();


		await this.waitForReactiveUpdate();


		const afterAdd =
			this.getKeyedOwnershipComponents();


		const addedComponent =
			afterAdd.get(
				4
			);


		const addPassed =
			Boolean(

				addedComponent &&

				addedComponent.owner &&

				addedComponent.owner.parent

			);


		this.keyedOwnershipAfterAdd.set(

			addPassed

				?

				`User 4 -> Component #${addedComponent.testId} -> Owner ${addedComponent.owner.id}`

				:

				"FAILED"
		);


		/*
		 * ----------------------------------------------------
		 * REMOVE TEST
		 * ----------------------------------------------------
		 *
		 * Capture the component before removing it so we can
		 * inspect the owner/effect after its keyed record has
		 * been destroyed.
		 */

		const componentToRemove =
			afterAdd.get(
				4
			);


		const effectRunsBeforeRemove =
			componentToRemove?.effectRuns ??
			0;


		this.removeUser();


		await this.waitForReactiveUpdate();


		const afterRemove =
			this.getKeyedOwnershipComponents();


		const effectRunsAfterRemove =
			componentToRemove?.effectRuns ??
			0;


		/*
		 * If the owner was correctly destroyed, changing the
		 * signal now must NOT cause the effect to run again.
		 */

		if (
			componentToRemove?.testValue
		) {

			componentToRemove.testValue.set(
				effectRunsAfterRemove + 1
			);
		}


		await this.waitForReactiveUpdate();


		const effectRunsAfterDestroyedSignal =
			componentToRemove?.effectRuns ??
			0;


		const removePassed =
			!afterRemove.has(
				4
			) &&

			Boolean(
				componentToRemove?.owner?.destroyed
			) &&

			effectRunsAfterRemove ===
				effectRunsAfterDestroyedSignal &&

			effectRunsBeforeRemove >=
				1;


		this.keyedOwnershipAfterRemove.set(

			removePassed

				?

				`Destroyed -> Owner ${componentToRemove?.owner?.id ?? "?"} -> Effect stopped`

				:

				"FAILED"
		);


		/*
		 * ----------------------------------------------------
		 * SHUFFLE TEST
		 * ----------------------------------------------------
		 *
		 * Store the exact component objects and owner IDs.
		 *
		 * After shuffling, the same objects must be present.
		 */

		const beforeShuffle =
			this.getKeyedOwnershipComponents();


		const beforeShuffleOwners =
			new Map(

				Array.from(
					beforeShuffle.entries()
				).map(
					([id, component]) => [

						id,

						component.owner?.id

					]
				)

			);


		this.shuffleUsers();


		await this.waitForReactiveUpdate();


		const afterShuffle =
			this.getKeyedOwnershipComponents();


		const shuffledOrder =
			this.getKeyedOwnershipOrder();


		const shufflePassed =
			[1, 2, 3].every(
				id => {

					const before =
						beforeShuffle.get(
							id
						);


					const after =
						afterShuffle.get(
							id
						);


					return (

						after ===
							before

						&&

						after?.owner?.id ===
							beforeShuffleOwners.get(
								id
							)

					);
				}
			);


		this.keyedOwnershipAfterShuffle.set(

			shufflePassed

				?

				`Reused existing components; order is ${shuffledOrder.join(" -> ")}`

				:

				`FAILED; order is ${shuffledOrder.join(" -> ")}`
		);


		/*
		 * ----------------------------------------------------
		 * REPEATED ADD/REMOVE TEST
		 * ----------------------------------------------------
		 *
		 * Run several cycles to expose leaks that may not be
		 * visible after a single removal.
		 */

		let cyclesPassed =
			true;


		const cycleResults =
			[];


		for (
			let cycle = 1;
			cycle <= 5;
			cycle++
		) {

			this.addUser();


			await this.waitForReactiveUpdate();


			const cycleComponents =
				this.getKeyedOwnershipComponents();


			const ids =
				this.getKeyedOwnershipOrder();


			const addedId =
				Math.max(
					...ids
				);


			const cycleComponent =
				cycleComponents.get(
					addedId
				);


			const cycleOwner =
				cycleComponent?.owner;


			const cycleInitialRuns =
				cycleComponent?.effectRuns ??
				0;


			this.removeUser();


			await this.waitForReactiveUpdate();


			const cycleAfterRuns =
				cycleComponent?.effectRuns ??
				0;


			if (
				cycleComponent?.testValue
			) {

				cycleComponent.testValue.set(
					cycleInitialRuns + 1
				);
			}


			await this.waitForReactiveUpdate();


			const cycleFinalRuns =
				cycleComponent?.effectRuns ??
				0;


			const cyclePassed =
				Boolean(
					cycleOwner?.destroyed
				) &&

				cycleAfterRuns ===
					cycleFinalRuns &&

				cycleInitialRuns >=
					1;


			cyclesPassed =
				cyclesPassed &&
				cyclePassed;


			cycleResults.push({

				cycle,

				id:
					addedId,

				owner:
					cycleOwner?.id ??
					null,

				effectStopped:
					cycleAfterRuns ===
					cycleFinalRuns,

				passed:
					cyclePassed
			});
		}


		this.keyedOwnershipCycles.set(

			cyclesPassed

				?

				"5/5 cycles passed"

				:

				"FAILED"
		);


		console.table(
			cycleResults
		);


		/*
		 * ----------------------------------------------------
		 * FINAL RESULT
		 * ----------------------------------------------------
		 */

		const passed =
			initialComponentsValid &&

			addPassed &&

			removePassed &&

			shufflePassed &&

			cyclesPassed;


		this.setKeyedOwnershipResult(

			passed
				?
				"Passed"
				:
				"Failed",

			passed,

			passed

				?

				"Compiler-generated keyed components preserved identity and their owners/effects were destroyed correctly on removal."

				:

				"One or more keyed component ownership checks failed. Inspect the console output for the exact stage."
		);


		console.log(
			"Keyed list component ownership result:",
			{
				passed,
				initialComponentsValid,
				addPassed,
				removePassed,
				shufflePassed,
				cyclesPassed
			}
		);


		console.log(
			"========================================"
		);
	}


	/*
	 * ========================================================
	 * ENABLE DIAGNOSTICS
	 * ========================================================
	 */

	enableDiagnostics() {

		console.log(
			"--------------------------------"
		);


		console.log(
			"PLAYGROUND: Enable diagnostics"
		);


		console.log(
			"Before:",
			getDiagnostics()
		);


		enableDiagnostics();


		console.log(
			"After:",
			getDiagnostics()
		);


		this.diagnostics =
			getDiagnostics();


		console.log(
			"Stored diagnostics:",
			this.diagnostics
		);


		console.log(
			"Direct property:",
			this.diagnostics.enabled
		);


		console.log(
			"Expression evaluator:",
			resolveExpression(
				"diagnostics.enabled",
				this
			)
		);


		this.update();


		console.log(
			"After Playground update:",
			getDiagnostics()
		);


		console.log(
			"--------------------------------"
		);
	}


	/*
	 * ========================================================
	 * DISABLE DIAGNOSTICS
	 * ========================================================
	 */

	disableDiagnostics() {

		console.log(
			"--------------------------------"
		);


		console.log(
			"PLAYGROUND: Disable diagnostics"
		);


		disableDiagnostics();


		this.diagnostics =
			getDiagnostics();


		console.log(
			"After:",
			this.diagnostics
		);


		this.update();


		console.log(
			"--------------------------------"
		);
	}


	/*
	 * ========================================================
	 * RESET DIAGNOSTICS
	 * ========================================================
	 */

	resetDiagnostics() {

		console.log(
			"--------------------------------"
		);


		console.log(
			"PLAYGROUND: Reset diagnostics"
		);


		resetDiagnostics();


		this.diagnostics =
			getDiagnostics();


		console.log(
			"After reset:",
			this.diagnostics
		);


		this.update();


		console.log(
			"--------------------------------"
		);
	}


	/*
	 * ========================================================
	 * REFRESH DIAGNOSTICS
	 * ========================================================
	 */

	refreshDiagnostics() {

		console.log(
			"--------------------------------"
		);


		console.log(
			"PLAYGROUND: Refresh diagnostics"
		);


		this.diagnostics =
			getDiagnostics();


		console.log(
			"Current:",
			this.diagnostics
		);


		this.update();


		console.log(
			"--------------------------------"
		);
	}


	/*
	 * ========================================================
	 * TEMPLATE
	 * ========================================================
	 */

	template() {

		const diagnostics =
			this.diagnostics;


		const ownership =
			this.ownershipTest;


		return `

			<section>

				<h1>
					Expression Engine
				</h1>


				<h2>

					{{ firstName + " " + lastName }}

				</h2>


				<p>

					Age:
					{{ age + 1 }}

				</p>


				<p>

					Status:

					{{ isActive
						? "Active"
						: "Inactive" }}

				</p>


				<p>

					Uppercase:

					{{ firstName.toUpperCase() }}

				</p>


				<button
					@click="changeName"
				>

					Change Name

				</button>


				<button
					@click="increaseAge"
				>

					Increase Age

				</button>


				<button
					@click="toggleActive"
				>

					Toggle Active

				</button>


				<button
					@click="batchTest"
				>

					Batch Update

				</button>


				<hr>


				<h2>
					Users
				</h2>


				<button
					@click="addUser"
				>

					Add User

				</button>


				<button
					@click="removeUser"
				>

					Remove User

				</button>


				<button
					@click="shuffleUsers"
				>

					Shuffle Users

				</button>


				<ul>

					<li
						for="user in users"
						key="user.id"
					>

						<strong>
							{{ user.name }}
						</strong>

						-

						{{ user.role }}

					</li>

				</ul>


				<hr>


				<h2>
					Keyed Component Ownership
				</h2>


				<p>
					This section renders real registered components
					inside the keyed list.
				</p>


				<ul>

					<li
						for="user in users"
						key="user.id"
						data-keyed-ownership-row="true"
					>

						<strong>
							User
							<span class="keyed-ownership-user-id">
								{{ user.id }}
							</span>:
						</strong>

						<KeyedListOwnershipItem></KeyedListOwnershipItem>

					</li>

				</ul>


				<p>

					Status:

					<strong>
						{{ keyedOwnershipStatus }}
					</strong>

				</p>


				<p>

					Passed:

					{{ keyedOwnershipPassed }}

				</p>


				<p>

					{{ keyedOwnershipDetails }}

				</p>


				<ul>

					<li>

						Initial:

						{{ keyedOwnershipInitial }}

					</li>


					<li>

						After Add:

						{{ keyedOwnershipAfterAdd }}

					</li>


					<li>

						After Remove:

						{{ keyedOwnershipAfterRemove }}

					</li>


					<li>

						After Shuffle:

						{{ keyedOwnershipAfterShuffle }}

					</li>


					<li>

						Repeated Cycles:

						{{ keyedOwnershipCycles }}

					</li>

				</ul>


				<button
					@click="testKeyedListComponentOwnership"
				>

					Run Keyed Component Ownership Test

				</button>


				<hr>


				<h2>
					Reactive Diagnostics
				</h2>


				<p>

					Status:

					<strong>

						{{ diagnostics.enabled }}

					</strong>

				</p>


				<p>

					Direct:

					{{ diagnostics.enabled }}

				</p>


				<button
					@click="enableDiagnostics"
				>

					Enable

				</button>


				<button
					@click="disableDiagnostics"
				>

					Disable

				</button>


				<button
					@click="resetDiagnostics"
				>

					Reset

				</button>


				<button
					@click="refreshDiagnostics"
				>

					Refresh

				</button>


				<h3>
					Effects
				</h3>


				<ul>

					<li>

						Created:
						{{ diagnostics.effects.created }}

					</li>


					<li>

						Active:
						{{ diagnostics.effects.active }}

					</li>


					<li>

						Stopped:
						{{ diagnostics.effects.stopped }}

					</li>


					<li>

						Runs:
						{{ diagnostics.effects.runs }}

					</li>

				</ul>


				<h3>
					Owners
				</h3>


				<ul>

					<li>

						Created:
						{{ diagnostics.owners.created }}

					</li>


					<li>

						Active:
						{{ diagnostics.owners.active }}

					</li>


					<li>

						Destroyed:
						{{ diagnostics.owners.destroyed }}

					</li>

				</ul>


				<h3>
					Scheduler
				</h3>


				<ul>

					<li>

						Queued:
						{{ diagnostics.scheduler.queued }}

					</li>


					<li>

						Flushes:
						{{ diagnostics.scheduler.flushes }}

					</li>


					<li>

						Batches:
						{{ diagnostics.scheduler.batches }}

					</li>


					<li>

						Max Queue:
						{{ diagnostics.scheduler.maxQueueSize }}

					</li>

				</ul>


				<h3>
					Keyed Lists
				</h3>


				<ul>

					<li>

						Created:
						{{ diagnostics.keyedLists.created }}

					</li>


					<li>

						Active:
						{{ diagnostics.keyedLists.active }}

					</li>


					<li>

						Destroyed:
						{{ diagnostics.keyedLists.destroyed }}

					</li>

				</ul>


				<hr>


				<h2>
					Component Ownership
				</h2>


				<p>

					Status:

					<strong>
						{{ ownership.status }}
					</strong>

				</p>


				<p>

					Passed:

					<strong>
						{{ ownership.passed }}
					</strong>

				</p>


				<p>

					Parent Owner:

					{{ ownership.parentOwner }}

				</p>


				<p>

					Correct Child Owner:

					{{ ownership.correctChildOwner }}

				</p>


				<p>

					Current-Style Child Owner:

					{{ ownership.incorrectChildOwner }}

				</p>


				<p>

					Correct Child Effect Runs:

					{{ ownership.correctChildEffectRuns }}

				</p>


				<p>

					Current-Style Child Effect Runs:

					{{ ownership.incorrectChildEffectRuns }}

				</p>


				<p>

					Correct Child Stopped:

					{{ ownership.correctChildStopped }}

				</p>


				<p>

					Current-Style Child Stopped:

					{{ ownership.incorrectChildStopped }}

				</p>


				<button
					@click="testComponentOwnership"
				>

					Run Ownership Test

				</button>


			</section>

		`;
	}
}