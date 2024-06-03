/**
 * Represents an example lifecycle behavior for a custom element.
 */
class ExampleLifecycleBehavior {
    /**
     * The attributes to observe for changes.
     * @type {string[]}
     */
    static observedAttributes = ["color", "size"];

    /**
     * The element this instance belongs to.
     * @type {HTMLElement}
     * @private
     */
    #element;
    
    /**
     * Creates a new instance of ExampleLifecycleBehavior.
     * @param {HTMLElement} element - The element this instance belongs to.
     */
    constructor(element) {
        // Keep a reference to the element this instance belongs to
        this.#element = element;

        if (!element.hasAttribute("color")) {
            element.setAttribute("color", "red");
        }

        if (!element.hasAttribute("size")) {
            element.setAttribute("size", "30");
        }
    }

    /**
     * Called when the custom element is added to the page.
     */
    connectedCallback() {
        console.log("ExampleLifecycleBehavior: Custom element added to page.");
    }

    /**
     * Called when the custom element is removed from the page.
     */
    disconnectedCallback() {
        console.log("ExampleLifecycleBehavior: Custom element removed from page.");
    }

    /**
     * Called when the custom element is moved to a new page.
     */
    adoptedCallback() {
        console.log("ExampleLifecycleBehavior: Custom element moved to new page.");
    }

    /**
     * Called when an observed attribute of the custom element has changed.
     * @param {string} name - The name of the attribute that has changed.
     * @param {string|null} oldValue - The previous value of the attribute.
     * @param {string|null} newValue - The new value of the attribute.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`ExampleLifecycleBehavior: Attribute ${name} has changed from ${oldValue} to ${newValue}.`);

        if (name === "color") {
            this.#element.style.background = newValue;
        } else if (name === "size") {
            this.#element.style.height = `${newValue}px`;
        }
    }
}

elementBehaviors.define("lifecycle-example", ExampleLifecycleBehavior);