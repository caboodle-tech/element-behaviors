class Tester {

    #elem = {};

    #icon = {
        // eslint-disable-next-line max-len
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.334 11.96c-.713-.726-.872-1.829-.393-2.727.342-.64.366-1.401.064-2.062-.301-.66-.893-1.142-1.601-1.302-.991-.225-1.722-1.067-1.803-2.081-.059-.723-.451-1.378-1.062-1.77-.609-.393-1.367-.478-2.05-.229-.956.347-2.026.032-2.642-.776-.44-.576-1.124-.915-1.85-.915-.725 0-1.409.339-1.849.915-.613.809-1.683 1.124-2.639.777-.682-.248-1.44-.163-2.05.229-.61.392-1.003 1.047-1.061 1.77-.082 1.014-.812 1.857-1.803 2.081-.708.16-1.3.642-1.601 1.302s-.277 1.422.065 2.061c.479.897.32 2.001-.392 2.727-.509.517-.747 1.242-.644 1.96s.536 1.347 1.17 1.7c.888.495 1.352 1.51 1.144 2.505-.147.71.044 1.448.519 1.996.476.549 1.18.844 1.902.798 1.016-.063 1.953.54 2.317 1.489.259.678.82 1.195 1.517 1.399.695.204 1.447.072 2.031-.357.819-.603 1.936-.603 2.754 0 .584.43 1.336.562 2.031.357.697-.204 1.258-.722 1.518-1.399.363-.949 1.301-1.553 2.316-1.489.724.046 1.427-.249 1.902-.798.475-.548.667-1.286.519-1.996-.207-.995.256-2.01 1.145-2.505.633-.354 1.065-.982 1.169-1.7s-.135-1.443-.643-1.96zm-12.584 5.43l-4.5-4.364 1.857-1.857 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.642z"/></svg>`,
        // eslint-disable-next-line max-len
        questionMark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1.25 17c0 .69-.559 1.25-1.25 1.25-.689 0-1.25-.56-1.25-1.25s.561-1.25 1.25-1.25c.691 0 1.25.56 1.25 1.25zm1.393-9.998c-.608-.616-1.515-.955-2.551-.955-2.18 0-3.59 1.55-3.59 3.95h2.011c0-1.486.829-2.013 1.538-2.013.634 0 1.307.421 1.364 1.226.062.847-.39 1.277-.962 1.821-1.412 1.343-1.438 1.993-1.432 3.468h2.005c-.013-.664.03-1.203.935-2.178.677-.73 1.519-1.638 1.536-3.022.011-.924-.284-1.719-.854-2.297z"/></svg>`,
        // eslint-disable-next-line max-len
        xMark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 16.538l-4.592-4.548 4.546-4.587-1.416-1.403-4.545 4.589-4.588-4.543-1.405 1.405 4.593 4.552-4.547 4.592 1.405 1.405 4.555-4.596 4.591 4.55 1.403-1.416z"/></svg>`
    };

    #ready = false;

    #tests = [];

    /**
     * Add each test visually to the page so users can see the results of each test.
     */
    #displayTests() {
        let html = '';

        this.#tests.forEach((test, index) => {
            html += `
            <div class="test" data-test="${index}">
                <div class="result">
                    ${this.#icon.questionMark}
                </div>
                <div class="title">
                    ${test.title}
                </div>
                <div class="description">
                    ${test.description}
                </div>
            </div>`;
        });

        this.#elem.testsDiv.innerHTML = html;
    }

    /**
     * Setup the page for the tests.
     *
     * @returns Used only as a short circuit.
     */
    initialize() {
        // Do not allow multiple initializations.
        if (this.#ready) {
            return;
        }

        return new Promise((resolve, reject) => {
            // Make sure all elements needed to display the tests are present.
            this.#elem.arenaDiv = document.getElementById('arena');
            this.#elem.testsDiv = document.getElementById('tests');
            this.#elem.iframe = document.getElementById('iframe');

            if (!this.#elem.arenaDiv || !this.#elem.testsDiv || !this.#elem.iframe) {
                reject('Testing page is missing required elements.');
                return;
            }

            // Show the tests we will run on the page.
            this.#displayTests();

            // Wait until the iframe needed for the tests is loaded.
            const interval = setInterval(() => {
                if (this.#elem.iframe?.contentDocument) {
                    if (this.#elem.iframe.contentDocument?.body) {
                        clearInterval(interval);
                        this.#ready = true;
                        resolve();
                    }
                }
            }, 500);
        });
    }

    /**
     * Register a new test to automatically run.
     *
     * @param {function|object} callback The test function to run OR an about of all args in one.
     * @param {str} title The name to display for this test.
     * @param {str} description An explanation of what this test will be doing or testing.
     * @returns Used only as a short circuit.
     */
    registerTest(callback, title, description) {
        // Allow sending in a testing object instead.
        if (this.whatIs(callback) === 'object') {
            // eslint-disable-next-line prefer-destructuring, no-param-reassign
            title = callback.title;
            // eslint-disable-next-line prefer-destructuring, no-param-reassign
            description = callback.description;
            // eslint-disable-next-line no-param-reassign
            callback = callback.test;
        }

        // Make sure we actually have a callback function.
        if (!this.whatIs(callback).includes('function')) {
            return;
        }

        this.#tests.push({
            test: callback,
            title,
            description
        });
    }

    /**
     * Run all registered tests.
     *
     * @param {object<reporter>} reporter The reference to the reporter object that tracks what is
     *                                    happing with each test.
     * @returns Used only as a short circuit.
     */
    async run(reporter) {
        // Make sure the page is setup before we run tests.
        if (!this.#ready) {
            return;
        }

        /**
         * We are using element behaviors differently than expected, defining behaviors after the
         * pages loads. We need to manually find all elements that should have behaviors and toggle
         * the `has` attribute so they are actually connected to the page.
         */

        // Find behaviors in the page.
        for (const node of this.#elem.arenaDiv.children) {
            if (!node.hasAttribute('has')) {
                // eslint-disable-next-line no-continue
                continue;
            }

            const hasValue = node.getAttribute('has');
            node.removeAttribute('has');
            node.setAttribute('has', hasValue);
        }

        // Find behaviors in iframes.
        for (const node of this.#elem.iframe.contentDocument.body.children) {
            if (!node.hasAttribute('has')) {
                // eslint-disable-next-line no-continue
                continue;
            }

            const hasValue = node.getAttribute('has');
            node.removeAttribute('has');
            node.setAttribute('has', hasValue);
        }

        // Slow things down just incase a behavior needs setup time.
        await this.sleep(1000);

        // Keep reference to elements being used in the tests.
        this.#elem.pageCounter = document.getElementById('page-counter');
        this.#elem.frameCounter = this.#elem.iframe.contentDocument.getElementById('frame-counter');

        // Bail if we are missing elements we need for the tests.
        if (!this.#elem.pageCounter || !this.#elem.frameCounter) {
            console.error('One or more required behavior elements is missing from the test area.');
            return;
        }

        // Run each test one by one.
        for (let i = 0; i < this.#tests.length; i++) {
            reporter.reset();
            const testContainer = document.querySelector(`#tests [data-test="${i}"]`);
            const testResult = testContainer.querySelector('.result');
            const test = this.#tests[i];
            const state = await test.test(this.#elem);
            if (reporter.testPassed(state)) {
                testResult.innerHTML = `<div class="success">${this.#icon.success}</div>`;
            } else {
                testResult.innerHTML = `<div class="error">${this.#icon.xMark}</div>`;
            }
        }
    }

    /**
     * Delay asynchronous requests for a set amount of time. This allows other requests to setup,
     * change, or finish its task without interference.
     *
     * @param {int} ms How many milliseconds to sleep for.
     * @returns A promise delayed by the requested time.
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * The fastest way to get the actual type of anything in JavaScript.
     *
     * {@link https://jsbench.me/ruks9jljcu/2 | See benchmarks}.
     *
     * @param {*} unknown Anything you wish to check the type of.
     * @returns {string|undefined} The type in lowercase of the unknown value passed in or undefined.
     */
    whatIs(unknown) {
        try {
            return {}.toString.call(unknown).match(/\s([^\]]+)/)[1].toLowerCase();
        } catch (e) { return undefined; }
    }

}

export default Tester;
