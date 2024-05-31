/**
 * These behaviors ARE NOT ideal examples of creating a Behavior. They have been
 * purpose built to work with Element Behavior's automated testing.
 */

class ClickCounter {

    static observedAttributes = ['count'];

    constructor(element) {
        this.element = element;
        this.count = 0;

        // Keep a reference to the Reporter so we can accurately report what is happening.
        this.reporter = window.elementBehaviorsReporter;

        // We have to keep a reference to the listener so we add add and remove it properly.
        this.listener = this.incrementCount.bind(this);

        // If this is a brand new Behavior element.
        if (!element.hasAttribute('count')) {
            element.setAttribute('count', 0);
            return;
        }

        // If we ever change a test to use an element already preset to some value:
        this.count = element.getAttribute('count');
    }

    connectedCallback() {
        this.reporter.registerConnected();
        this.render();
        this.element.addEventListener('click', this.listener);
    }

    incrementCount() {
        const count = parseInt(this.element.getAttribute('count'));
        this.element.setAttribute('count', count + 1);
    }

    adoptedCallback() {
        this.reporter.registerAdopted();
    }

    disconnectedCallback() {
        this.reporter.registerDisconnected();
        this.element.removeEventListener('click', this.listener);
    }

    render() {
        this.element.textContent = `Count: ${this.count}`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.reporter.registerAttributeChange();
        this.count = newValue;
        this.render();
    }

}

export default {
    'click-counter': ClickCounter
};
