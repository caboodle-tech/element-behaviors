class Loader {
    static observedAttributes = ["loader", "visible"];

    #element;
    #originalText;
    #skipAttributeChanges = {
        "loader": false,
        "visible": false
    };
    #types = ["wave", "dots", "circle", "text"];

    constructor(element) {
        // Keep a reference to the element this instance belongs to.
        this.#element = element;

        // Record the original loader text.
        this.#originalText = element.innerText;

        // If the loader type is not set default to a wave.
        if (!element.hasAttribute("loader")) {
            element.setAttribute("loader", "wave");
        }

        // Force the element to be visible for this demo.
        element.setAttribute("visible", "true");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "loader") {
            // If the attribute change was triggered by the element itself, ignore it.
            if (this.#skipAttributeChanges.loader) {
                this.#skipAttributeChanges.loader = false;
                return;
            }

            // If the new value is not a valid loader type, revert to the old value.
            if (!this.#types.includes(newValue)) {
                this.#element.setAttribute("loader", oldValue);
                this.#skipAttributeChanges.loader = true;
                return;
            }
        } else if (name === "visible") {
            // If the attribute change was triggered by the element itself, ignore it.
            if (this.#skipAttributeChanges.visible) {
                this.#skipAttributeChanges.visible = false;
                return;
            }

            // If the new value is not a boolean, revert to the old value.
            if (newValue !== "true" && newValue !== "false") {
               this.#element.setAttribute("visible", oldValue);
               this.#skipAttributeChanges.visible = true;
               return;
            }
        }

        this.render();
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        this.#element.innerHTML = '';
    }

    render() {
        // If the element is not visible, hide it.
        if (this.#element.getAttribute("visible") === "false") {
            this.#element.style.display = "none";
            return;
        } else {
            this.#element.style.display = "inline-block";
        }

        // Create the loader element.
        switch(this.#element.getAttribute("loader")) {
            case 'wave':
                this.#element.innerHTML = '<div class="wave"><div></div><div></div><div></div><div></div><div></div></div>';
                break;
            case 'dots':
                this.#element.innerHTML = '<div class="dots"><div></div><div></div><div></div><div></div><div></div></div>';
                break;
            case 'circle':
                this.#element.innerHTML = '<div class="circle"><div></div></div>';
                break;
            default:
                this.#element.innerHTML = this.#originalText;
                break;
        }
    }
}

elementBehaviors.define("loader", Loader);