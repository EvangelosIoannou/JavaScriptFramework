import {
	Component
}
from "../js/core/Framework.js";

import {
	html
}
from "../js/core/Template.js";

export default class Sandbox
extends Component {

	render() {

		return html(`

			<section>

				<Card>

					<h1>
						Hello
					</h1>

					<p>
						This is inside
						the card.
					</p>

				</Card>

			</section>

		`, this);
	}
}