import Behaviors from './imports/behaviors.js';
import Reporter from './imports/reporter.js';
import Tester from './imports/tester.js';
import Tests from './imports/tests.js';

// Attach the Reporter to the window so the behavior classes have access to it during the test.
window.elementBehaviorsReporter = Reporter;

// Attach the Tester to the window so users can manually interact with it if they wish.
const testElementBehaviors = new Tester();
window.testElementBehaviors = testElementBehaviors;

// Register all tests.
Tests.forEach((test) => {
    testElementBehaviors.registerTest(test);
});

document.addEventListener('DOMContentLoaded', () => {
    testElementBehaviors.initialize()
        .then(() => {
            // Register all behaviors.
            Object.keys(Behaviors).forEach((behavior) => {
                elementBehaviors.define(behavior, Behaviors[behavior]);
            });

            // Start running the tests.
            testElementBehaviors.run(Reporter);
        })
        .catch((err) => {
            console.error(err);
        });
});
