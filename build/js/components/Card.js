import {
	CompilerComponent
}
from "../core/CompilerComponent.js";

export default class Card
extends CompilerComponent {

	template() {

		return `

			<div class="card">

				<header>

					<slot name="header">

						<h2>
							Default Card Header
						</h2>

					</slot>

				</header>

				<main>

					<slot name="body">

						<p>
							Default Card Content
						</p>

					</slot>

				</main>

				<footer>

					<slot name="footer">

						<p>
							Default Footer
						</p>

					</slot>

				</footer>

			</div>

		`;
	}
}