class ClickCounter {

    static observedAttributes = ['count'];

    #count = 0;
    #element;
    #listener;

    constructor(element) {
        this.#element = element;
        this.#listener = this.incrementCount.bind(this);

        // Use the existing count if the attribute exists
        if (element.hasAttribute('count')) {
            const count = Number(element.getAttribute('count')) || Number(0);
            this.#count = count;
            return;
        }

        // Count attribute was missing so add it now
        element.setAttribute('count', 0);
        this.#count = 0;
    }

    connectedCallback() {
        this.render();
        this.#element.addEventListener('click', this.#listener);
    }

    incrementCount() {
        const count = Number(this.#element.getAttribute('count')) || Number(this.#count);
        this.#element.setAttribute('count', count + 1);
    }

    disconnectedCallback() {
        this.#element.removeEventListener('click', this.#listener);
    }

    render() {
        this.#element.textContent = `Count: ${this.#count}`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name !== 'count') {
            return;
        }
        this.#count = Number(newValue) || Number(oldValue) || 0;
        this.render();
    }

}

elementBehaviors.define('click-counter', ClickCounter);
