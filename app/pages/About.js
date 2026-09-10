import { Component } from "../js/core/Framework.js";
import { html } from "../js/core/Template.js";

export default class About extends Component {

    render() {

        return html(`
            <div>

                <h1>About Us</h1>

                <p>
                    This framework is built entirely with Vanilla JavaScript.
                </p>

            </div>
        `);
    }
}