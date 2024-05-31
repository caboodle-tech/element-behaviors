
```js
class Loader {

    static observedAttributes = ["loader", "visible"];

    #elem;

    // The constructor receives the `element` as it's first parameter.
    constructor(element) {

        // Keep a reference to the element this instance of the behavior applies to.
        this.#elem = element;

        // 
        if (element.firstChild && element.firstChild.nodeType === Node.TEXT_NODE) {
            element.innerHTML = `<p>${element.innerText}</p>`;
        }

        // If the user did not set the type of loader to display default to spinner.
        if (!element.hasAttribute('loader')) {
            element.setAttribute('loader', 'spinner');
        }

        // If the user did not set the visibility state default to visible.
        if (!element.hasAttribute('visible')) {
            element.setAttribute('visible', true);
        }
    }
}
```