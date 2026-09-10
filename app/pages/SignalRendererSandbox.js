import {
	Component
}
from "../js/core/Framework.js";

import {
	signal
}
from "../js/core/reactivity/Signal.js";

import {
	renderSignal
}
from "../js/core/reactivity/ReactiveRenderer.js";

export default class SignalRendererSandbox
extends Component {

	constructor(
		props,
		injector
	) {

		super(
			props,
			injector
		);

		this.name =
			signal(
				"John"
			);
	}

	onMount() {

		const container =
			this.el.querySelector(
				"#signal-target"
			);

		container.appendChild(

			renderSignal(
				() =>
					this.name.get()
			)
		);
	}

	methods() {

		return {

			changeName: () => {

				this.name.set(
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
						"Reactive Renderer"
					]
				},

				{
					tag: "div",
					props: {
						id:
							"signal-target"
					},
					children: []
				},

				{
					tag: "button",
					props: {
						onClick:
							() =>
								this.methods()
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