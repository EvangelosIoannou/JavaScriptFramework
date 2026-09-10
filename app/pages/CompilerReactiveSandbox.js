import {
	Component
}
from "../js/core/Framework.js";

import {
	template
}
from "../js/core/compiler/CompilerTemplate.js";

import {
	signal
}
from "../js/core/reactivity/index.js";

import {
	computed
}
from "../js/core/reactivity/index.js";

export default class CompilerReactiveSandbox
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

	render() {

		return template(`

			<section>

				<h1>

					{{ fullName }}

				</h1>

				<button>

					Change Name

				</button>

			</section>

		`, this);
	}

	onMount() {

		const button =
			this.el.querySelector(
				"button"
			);

		button.addEventListener(
			"click",
			() => {

				this.changeName();
			}
		);
	}
}