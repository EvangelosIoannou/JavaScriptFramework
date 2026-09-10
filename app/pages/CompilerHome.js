import {
	CompilerComponent
}
from "../js/core/CompilerComponent.js";

import {
	signal,
	computed
}
from "../js/core/reactivity/index.js";

export default class CompilerHome
extends CompilerComponent {

	constructor(
		props,
		injector
	) {

		super(
			props,
			injector
		);

		this.firstName =
			signal(
				"John"
			);

		this.lastName =
			signal(
				"Smith"
			);

		this.fullName =
			computed(
				() =>

					this.firstName.get()

					+

					" "

					+

					this.lastName.get()
			);
	}

	changeName() {

		this.firstName.set(
			"Jane"
		);
	}

	template() {

		return `

			<section>

				<h1>

					{{ fullName }}

				</h1>

				<input
					bind="firstName"
				>

				<button
					@click="changeName"
				>

					Set Jane

				</button>

			</section>

		`;
	}
}