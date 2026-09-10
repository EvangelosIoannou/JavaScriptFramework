import {
	Component
}
from "../js/core/Framework.js";

import {
	signal
}
from "../js/core/reactivity/index.js";

import {
	computed
}
from "../js/core/reactivity/index.js";

import {
	createReactiveExpression
}
from "../js/core/reactivity/index.js";

export default class ReactiveTemplateSandbox
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

	onMount() {

		const target =
			this.el.querySelector(
				"#target"
			);

		target.appendChild(

			createReactiveExpression(

				"fullName",

				this
			)
		);
	}

	methods() {

		return {

			changeName: () => {

				this.firstName.set(
					"Jane"
				);
			}
		};
	}

	render() {

		return {

			tag: "section",

			props: {},

			children: [

				{
					tag: "h1",

					props: {},

					children: [
						"Reactive Templates"
					]
				},

				{
					tag: "div",

					props: {
						id:
							"target"
					},

					children: []
				},

				{
					tag: "button",

					props: {

						onClick:
							() =>

								this
									.methods()
									.changeName()
					},

					children: [
						"Change Name"
					]
				}
			]
		};
	}
}