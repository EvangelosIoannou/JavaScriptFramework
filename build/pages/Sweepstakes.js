import { CompilerComponent } from "../js/core/CompilerComponent.js";

export default class Sweepstakes
extends CompilerComponent {

	template() {

		return `
			<section class="sweepstakes-container">
				<div class="title">
					<h1>
						Sweepstakes
					</h1>
					<p>
						World Cup 2026
					</p>
				</div>
				<div class="sweepstakescontent">
					<h1>
						Sweepstakes
					</h1>
					<p>
						World Cup 2026
					</p>
				</div>
			</section>
		`;
	}
}