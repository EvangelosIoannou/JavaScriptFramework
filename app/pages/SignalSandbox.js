import {
	Component
}
from "../js/core/Framework.js";

import {
	html
}
from "../js/core/Template.js";

import {
	signal,
	computed,
	effect
}
from "../js/core/reactivity/index.js";

export default class SignalSandbox
extends Component {

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

					this.firstName
						.get()

					+

					" " +

					this.lastName
						.get()
			);

		effect(
			() => {

				console.log(

					"Full Name:",

					this.fullName
						.get()
				);
			}
		);
	}

	methods() {

		return {

			changeName: () => {

				this.firstName
					.set(
						"Jane"
					);

				this.update();
			}
		};
	}

	render() {

		return html(`
			<section>

				<h1>
					Signal Test
				</h1>

				<p>

					${this.fullName.get()}

				</p>

				<button
					@click="changeName"
				>

					Change Name

				</button>

			</section>
		`, this);
	}
}