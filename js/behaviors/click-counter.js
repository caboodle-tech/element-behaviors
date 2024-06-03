/**
 * Represents a click counter behavior that keeps track of the number of times an element is clicked.
 * 
 * Because we allow the current count to be set/updated via the `count` attribute as well as clicking
 * on the element, we introduced the render method to simplify updating the element's text content.
 * This could be removed if the count was only ever updated by clicking the element.
 * 
 * We also added code to attach and detach the event listener based on the elements connection to the
 * DOM. This could also be simplified but it works well for this example.
 */
class ClickCounter {

    /**
     * The list of attributes that the ClickCounter observes for changes.
     * @type {Array<string>}
     */
    static observedAttributes = ['count'];

    /**
     * The current count value.
     * @type {number}
     * @private
     */
    #count = 0;

    /**
     * The element associated with the ClickCounter.
     * @type {HTMLElement}
     * @private
     */
    #element;

    /**
     * The event listener function for incrementing the count.
     * @type {Function}
     * @private
     */
    #listener;

    /**
     * Creates a new instance of ClickCounter.
     * @param {HTMLElement} element - The element to attach the ClickCounter behavior to.
     */
    constructor(element) {
        this.#element = element;
        this.#listener = this.incrementCount.bind(this);

        // Use the existing count if the attribute exists.
        if (element.hasAttribute('count')) {
            const count = Number(element.getAttribute('count')) || Number(0);
            this.#count = count;
            return;
        }

        // Count attribute was missing so add it now.
        element.setAttribute('count', 0);
        this.#count = 0;
    }

    /**
     * Called when the element is connected to the DOM.
     */
    connectedCallback() {
        this.render();
        this.#element.addEventListener('click', this.#listener);
    }

    /**
     * Increments the count value and updates the element's count attribute.
     */
    incrementCount() {
        const count = Number(this.#element.getAttribute('count')) || Number(this.#count);
        this.#element.setAttribute('count', count + 1);
    }

    /**
     * Called when the element is disconnected from the DOM.
     */
    disconnectedCallback() {
        this.#element.removeEventListener('click', this.#listener);
    }

    /**
     * Renders the current count value to the element's text content.
     */
    render() {
        this.#element.textContent = `Count: ${this.#count}`;
    }

    /**
     * Called when an observed attribute has changed.
     * @param {string} name - The name of the attribute that has changed.
     * @param {string} oldValue - The previous value of the attribute.
     * @param {string} newValue - The new value of the attribute.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name !== 'count') {
            return;
        }
        this.#count = Number(newValue) || Number(oldValue) || 0;
        this.render();
    }

}

// Define the click-counter behavior by registering it with Element Behaviors.
elementBehaviors.define('click-counter', ClickCounter);
