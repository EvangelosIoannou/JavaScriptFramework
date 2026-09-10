import { Component }
from "../js/core/Framework.js";

import { html }
from "../js/core/Template.js";

export default class Contact
extends Component {

	constructor(
		props,
		injector
	) {

		super(
			props,
			injector
		);

		this.state = {

			name: "Evangelos",
			email: "",
			message: "",
			title: "Contact Us",
		};
	}

	methods() {

		return {

			send: () => {

				console.log(
					this.state
				);

				alert(
					"Message sent"
				);
			}
		};
	}

	render() {

		return html(`
			<div>

				<h1>{{ title }}</h1>

				<input
					bind="name"
					placeholder="Name"
				>

				<input
					bind="email"
					placeholder="Email"
				>

				<textarea
					bind="message"
					placeholder="Message"
				></textarea>

				<p>Name: {{ name }}</p>

				<button
					@click="send"
				>
					Send
				</button>

			</div>
		`,
		this);
	}
}