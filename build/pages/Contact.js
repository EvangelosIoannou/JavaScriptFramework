import {
	CompilerComponent
}
from "../js/core/CompilerComponent.js";

import {
	signal
}
from "../js/core/reactivity/index.js";

export default class Contact
extends CompilerComponent {

	constructor(
		props,
		injector,
		parentOwner
	) {

		super(
			props,
			injector,
			parentOwner
		);

		this.name =
			signal(
				"Evangelos"
			);

		this.email =
			signal(
				""
			);

		this.message =
			signal(
				""
			);

		this.title =
			signal(
				"Contact Us"
			);
	}

	send() {

		console.log({
			name:
				this.name.get(),

			email:
				this.email.get(),

			message:
				this.message.get()
		});

		alert(
			"Message sent"
		);
	}

	template() {

		return `
			<div>

				<h1>
					{{ title }}
				</h1>

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

				<p>
					Name:
					{{ name }}
				</p>

				<button
					@click="send"
				>
					Send
				</button>

			</div>
		`;
	}
}