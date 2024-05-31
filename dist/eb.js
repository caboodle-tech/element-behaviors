/**
 * Element Behaviors v1.0.0 Copyright (c) 2024 Caboodle Tech Inc.
 * License and source code available at: https://github.com/caboodle-tech/element-behaviors
 */
(function () {
    'use strict';

    var version = "1.0.0";

    /**
     * ElementBehaviors is a library for defining and applying reusable behaviors to HTML elements. It
     * follows the official Custom Elements specifications as closely as possible and provides a way to
     * encapsulate and compose functionality onto elements without the restrictions of Custom Elements.
     */
    class ElementBehaviors {

        /**
         * Map to store the registered behavior classes.
         *
         * @type {Map<string, Function>}
         */
        #behaviorClasses;

        /**
         * WeakMap to store the behavior instances for each element. This allows reusing instances when
         * elements are moved in the DOM.
         *
         * @type {WeakMap<Element, Map<string, any>>}
         */
        #behaviorInstances;

        /**
         * Map that stores references to the documents currently be watched by the mutation observer.
         *
         * @type {Map<Document>}
         */
        #documents;

        /**
         * Map that tracks every element with at least one attached behaviors.
         *
         * @type {Map<WeakRef>}
         */
        #elements;

        /**
         * WeakMap to track which DOM an element was last visible in. The observeDetachedElement method
         * needs this to work.
         *
         * @type {WeakMap<Element, Document>}
         */
        #elementDocuments;

        /**
         * Keep a reference to initial the instance of this class so we can force ElementBehaviors to be
         * a singleton class.
         *
         * @type {ElementBehaviors}
         */
        #instance = null;

        /**
         * MutationObserver to watch for changes in the DOM.
         *
         * @type {MutationObserver}
         */
        #observer;

        /**
         * Track the state of the MutationObserver.
         *
         * @type {boolean}
         */
        #observing = false;

        /**
         * A throttled function that handles restarting (stopping and starting) the mutation observer
         * so we can add or remove elements from the list to observe. This is needed so we can
         * efficiently observe the main document, iframes, and shadow doms with a single observer.
         *
         * @type {function}
         */
        #observationRestart;

        /**
         * Map that tracks all elements with an open shadow dom. We normally can't see inside a shadow
         * dom but we monkey patch open shadow doms to make them visible to the observer that checks and
         * watches for behaviors.
         *
         * @type {Map<HTMLElement}
         */
        #shadowDocuments;

        /**
         * The current version of ElementBehaviors you are using.
         *
         * @type {string}
         */
        #version = version;

        constructor() {
            // Make ElementBehaviors a singleton class.
            if (this.#instance) {
                return this.#instance;
            }
            this.#instance = this;

            // Setup the initial state and start ElementBehaviors' mutation observer.
            this.#behaviorClasses = new Map();
            this.#behaviorInstances = new WeakMap();
            this.#documents = new Map();
            this.#elementDocuments = new WeakMap();
            this.#elements = new Map();
            this.#observer = new MutationObserver(this.#handleMutations.bind(this));
            this.#shadowDocuments = new Map();

            // Setup the throttled restart observation function.
            this.#observationRestart = this.#throttle(this.#restartObservation, 50);

            /**
             * ASAP monkey patch Element.prototype.attachShadow so we can handle behaviors in shadow
             * doms. This is one reason ElementBehaviors should be load before all other scripts.
             */
            this.#monkeyPatchShadowRoot();

            // Turn on the lights.
            this.#observeDocument(document.documentElement);
            this.#startObserving();
        }

        /**
         * Apply behaviors registered on the provided element.
         *
         * @param {Element} element The element to process.
         */
        #applyBehaviors(element) {
            const hasAttribute = element.getAttribute('has');
            if (hasAttribute) {
                // If this is a new element make sure we track it going forward.
                if (!this.#elements.has(element)) {
                    this.#trackElement(element);
                }

                // Split the 'has' attribute value to get the list of behavior names.
                const behaviorNames = hasAttribute.trim().split(/\s+/);

                // Get the existing behavior instances or create a new Map to store the instances.
                const behaviors = this.#behaviorInstances.get(element) || new Map();

                // Update the record for which document this element is in.
                const oldDocument = this.#elementDocuments.get(element) || element.ownerDocument;
                const newDocument = element.ownerDocument;
                this.#elementDocuments.set(element, newDocument);

                /**
                 * Disconnect behaviors that are no longer present on the element. This keeps the
                 * original instance alive and tracked, if the behavior is added back later then the
                 * original instance is added back. If you do not want the instance to be saved use
                 * removeBehavior() instead of editing the elements has attribute.
                 */
                for (const [name, obj] of behaviors) {
                    // Stop if this behavior has already been disconnected.
                    if (!obj.connected) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }

                    if (!behaviorNames.includes(name)) {
                        obj.connected = false;

                        // Call the disconnectedCallback lifecycle method.
                        if (obj.instance.disconnectedCallback) {
                            obj.instance.disconnectedCallback(element);
                        }
                    }
                }

                // Start an array to track the state of behavior instances attached to this element.
                const adoptions = [];
                const connections = [];

                // Iterate through the list of behaviors by their names.
                for (const behaviorName of behaviorNames) {

                    // eslint-disable-next-line prefer-const
                    let { connected, instance } = behaviors.get(behaviorName) || {};

                    const behaviorClass = this.#behaviorClasses.get(behaviorName);
                    if (behaviorClass) {
                        // Check if an instance of this behavior already exists for the element.
                        if (!instance) {

                            // Create a new instance of the behavior class.
                            instance = new behaviorClass(element);

                            // Observe any attributes specified in the observedAttributes property.
                            if (behaviorClass.observedAttributes) {
                                for (const attribute of behaviorClass.observedAttributes) {
                                    this.#observer.observe(element, { attributes: true, attributeFilter: [attribute] });
                                }
                            }

                            // Store the instance in the behaviors Map.
                            behaviors.set(behaviorName, { connected: true, instance });
                        }

                        // Adopt this behavior if coming from a different document.
                        if (!connected && oldDocument !== newDocument) {
                            adoptions.push(instance);
                        }

                        // Connect or reconnect this behavior.
                        if (!connected) {
                            connections.push({ behaviorName, instance });
                        }
                    }
                }

                // Run all the adoption calls first.
                adoptions.forEach((instance) => {
                    // Call the adoptedCallback lifecycle method.
                    if (instance.adoptedCallback) {
                        instance.adoptedCallback(element);
                    }
                });

                // Now run all the connected calls.
                connections.forEach((obj) => {
                    // Call the connectedCallback lifecycle method.
                    if (obj.instance.connectedCallback) {
                        obj.instance.connectedCallback(element);
                    }
                    behaviors.set(obj.behaviorName, { connected: true, instance: obj.instance });
                });

                /**
                 * Store the behaviors Map in the WeakMap. This allows efficient garbage collection to
                 * take place as needed.
                 */
                this.#behaviorInstances.set(element, behaviors);
            } else {
                // If the 'has' attribute is not present or no longer present, disconnect the behaviors.
                this.#disconnectBehaviors(element);
            }
        }

        /**
         * Register a behavior class.
         *
         * @param {string} name The name of the behavior.
         * @param {Function} behaviorClass The behavior class.
         * @returns {boolean} True if the behavior class was registered, false if the behavior name is
         *                    already registered.
         */
        define(name, behaviorClass) {
            if (this.#behaviorClasses.has(name.toLowerCase())) {
                return false;
            }
            this.#behaviorClasses.set(name.toLowerCase(), behaviorClass);
            return true;
        }

        /**
         * Disconnect behaviors from an element. Note that this does not actually remove the behaviors
         * from ElementBehaviors, it only calls the behaviors disconnectedCallback method so we can keep
         * an eye on the element if it has not been truly deleted from the DOM. To remove behaviors
         * completely and garbage collect their instances you should call the removeBehavior method instead.
         *
         * @param {Element} element The element to disconnect behaviors from.
         */
        #disconnectBehaviors(element) {
            const behaviors = this.#behaviorInstances.get(element);
            if (behaviors) {
                for (const [name, obj] of behaviors) {
                    if (obj.connected) {
                        // Call the disconnectedCallback lifecycle method.
                        if (obj.instance.disconnectedCallback) {
                            obj.instance.disconnectedCallback(element);
                        }                }
                    obj.connected = false;
                }
            }
        }

        /**
         * Get all behavior elements.
         *
         * @param {string} [limitToBehavior] A behavior name or behavior names to limit the results to.
         * @returns {Array<HTMLElement>} An array of elements with at least one behavior.
         */
        getBehaviorElements(limitToBehavior = undefined) {
            // Build regular expressions used to limit what is matched and returned.
            let regex = undefined;
            if (limitToBehavior) {
                regex = [];
                const tests = limitToBehavior.trim().split(' ');
                tests.forEach((test) => {
                    regex.push(new RegExp(`\\b${test}\\b`, 'i'));
                });
            }

            // Gather all elements that have behaviors.
            const elements = [];
            this.#elements.forEach((weakRef) => {
                const element = weakRef.deref();
                if (element !== undefined) {
                    // If the user specified which behavior or behaviors to get limit the search to only those.
                    if (limitToBehavior) {
                        let matches = 0;
                        regex.forEach((test) => {
                            if (test.test(element.getAttribute('has'))) {
                                matches += 1;
                            }
                        });
                        if (regex.length !== matches) {
                            return;
                        }
                    }
                    elements.push(element);
                }
            });
            return elements;
        }

        /**
         * Handle mutations in the DOM.
         *
         * @param {MutationRecord[]} mutations The list of mutations.
         */
        #handleMutations(mutations) {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes') {
                    /**
                     * TODO: We currently allow `has` to be added as an observedAttribute but should we?
                     * We could squeeze out more efficiency here by adding an else statement to protect
                     * the processAttributeChange call from all the `has` events. For now I feel we should
                     * give the user full control over what they want to observe and the "efficiency"
                     * increase would be negligible in the wild.
                     */
                    if (mutation.attributeName === 'has') {
                        this.#applyBehaviors(mutation.target);
                    }
                    // Check if any of these attributes are registered as an observed attribute.
                    this.#processAttributeChange(mutation.target, mutation.attributeName);
                } else if (mutation.type === 'childList') {
                    // Nodes (elements) are being added to some location we are observing.
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Handle iframes differently.
                            if (node.nodeName === 'IFRAME') {
                                this.#trackIframe(node);
                            }
                            /**
                             * Shadow DOMs have been monkey patched elsewhere so if we see it here we
                             * know two things:
                             *
                             * 1. The shadow DOM is open and not closed.
                             * 2. The element that contains the shadow DOM has been reattached (appended)
                             *    to a document.
                             */
                            if (this.#shadowDocuments.has(node)) {
                                const { processed, shadowRoot } = this.#shadowDocuments.get(node);
                                // Manually scan the shadow DOM for new behaviors and register them.
                                shadowRoot.querySelectorAll('*').forEach((node) => {
                                    if (node.nodeType !== Node.ELEMENT_NODE) {
                                        return;
                                    }
                                    this.#applyBehaviors(node);
                                });
                            }
                            /**
                             * Apply behaviors to the element itself; iframes and elements with shadow
                             * DOMs can have behaviors applied to themselves as well.
                             */
                            this.#applyBehaviors(node);
                        }
                    }

                    // Nodes (elements) are being removed from some location we are observing.
                    for (const node of mutation.removedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Handle iframes differently.
                            if (node.nodeName === 'IFRAME') {
                                /**
                                 * Remove the WeakRef to this iframe since it has been removed from the
                                 * visible document. Who knows if or when it will appear again, and we
                                 * are going to have to manually process it again anyways if it is
                                 * added back to a location we are observing.
                                 */
                                this.#elements.delete(element);
                                this.#observationRestart();
                            }
                            /**
                             * Shadow DOMs have been monkey patched elsewhere so if we see it here we
                             * know two things:
                             *
                             * 1. The shadow DOM is open and not closed.
                             * 2. The element that contains the shadow DOM is being moved somewhere or
                             *    has been detached (removed) from the document.
                             */
                            if (this.#shadowDocuments.has(node)) {
                                const { processed, shadowRoot } = this.#shadowDocuments.get(node);
                                // Manually scan the shadow DOM and disconnect all behaviors.
                                shadowRoot.querySelectorAll('*').forEach((node) => {
                                    if (node.nodeType !== Node.ELEMENT_NODE) {
                                        return;
                                    }
                                    this.#disconnectBehaviors(node);
                                });
                            }
                            /**
                             * Apply behaviors to the element itself; iframes and elements with shadow
                             * DOMs can have behaviors applied to themselves as well.
                             */
                            this.#disconnectBehaviors(node);
                        }
                    }
                }
            }
        }

        /**
         * Monkey patch the built-in Element.prototype.attachShadow method. This allows us to hook into
         * the shadow DOM creation process and observe its content for behavior elements.
         *
         * NOTE: This will only work on open shadow DOMs.
         */
        #monkeyPatchShadowRoot() {
            // Store the original attachShadow method.
            const originalAttachShadow = Element.prototype.attachShadow;
            const callbackTrackShadow = (element) => {
                this.trackShadowDocument(element);
            };

            // Monkey patch the attachShadow method.
            // eslint-disable-next-line func-names
            Element.prototype.attachShadow = (function(originalMethod) {
                // eslint-disable-next-line func-names
                return function() {
                    // Call the original method, ensuring `this` refers to the element.
                    const result = originalMethod.apply(this, arguments);

                    // Observe changes in the shadow DOM so we can apply behaviors as needed.
                    callbackTrackShadow(this);

                    // Return the original method's result.
                    return result;
                };
            })(originalAttachShadow);
        }

        /**
         * Add a document or element to the list of things ElementBehavior's MutationObserver observes
         * for changes.
         *
         * @param {Document|HTMLElement} docOrElem A new document or node to observe for changes.
         * @param {object} options MutationObserver observe options.
         */
        #observeDocument(docOrElem, options = { attributes: true, childList: true, subtree: true }) {
            this.#documents.set(docOrElem, options);
        }

        /**
         * Process an attribute change on an element. This is ElementBehaviors implementation of the
         * observedAttributes from Custom Elements.
         *
         * @param {Element} element The element whose attribute changed.
         * @param {string} attributeName The name of the attribute that changed.
         */
        #processAttributeChange(element, attributeName) {
            const behaviors = this.#behaviorInstances.get(element);
            if (behaviors) {
                for (const [, obj] of behaviors) {
                    const { instance } = obj;
                    if (instance.constructor.observedAttributes?.includes(attributeName)) {
                        const oldValue = instance[attributeName];
                        const newValue = element.getAttribute(attributeName);
                        instance.attributeChangedCallback?.(attributeName, oldValue, newValue, element);
                    }
                }
            }
        }

        /**
         * Remove the specified behavior(s) from the specified element(s). This will garbage collect the
         * behaviors instance and completely remove all references to the behaviors on this element. If
         * you are wanting to detach (temporarily remove) a behavior simply remove the behavior name from
         * the elements `has` attribute instead.
         *
         * @param {HTMLElement|Array<HTMLElement>} elementOrElements An element or array of elements to
         *                                                           remove the specified behaviors from.
         * @param {string} behaviorOrBehaviors A behavior or behaviors separated by spaces to remove from
    *                                          the specified element or elements
         */
        removeBehavior(elementOrElements, behaviorOrBehaviors) {
            // Build an array of elements to process; converts a single element into an array.
            const processElements = [];
            if (this.whatIs(elementOrElements) === 'array') {
                processElements.push(...elementOrElements);
            } else {
                processElements.push(elementOrElements);
            }

            // Build an array of the behaviors to remove; converts a single element into an array.
            const processBehaviors = behaviorOrBehaviors.trim().split(' ');
            processBehaviors.forEach((behavior, i) => {
                processBehaviors[i] = behavior.toLowerCase();
            });

            // Begin the removal process.
            processElements.forEach((element) => {
                const behaviors = this.#behaviorInstances.get(element);
                let attrs = element.getAttribute('has') || '';

                processBehaviors.forEach((behavior) => {
                    const obj = behaviors.get(behavior);
                    attrs = attrs.replace(behavior, '');

                    if (obj.instance.disconnectedCallback) {
                        obj.instance.disconnectedCallback(element);
                    }

                    behaviors.delete(behavior);
                });

                // Update the elements `has` attribute to exclude the removed behaviors.
                element.setAttribute('has', attrs.trim());

                // If this element had all its behaviors removed do additional garbage collection.
                if (behaviors.size === 0) {
                    // Free up resources by no longer tracking this element.
                    this.#behaviorInstances.delete(element);
                    this.#elementDocuments.delete(element);
                    this.#elements.delete(element);
                }
            });
        }

        /**
         * Helper method to stop ElementBehaviors old MutationObserver and start it up again with a new
         * list of elements to observe.
         */
        #restartObservation() {
            this.#stopObserving();
            this.#startObserving();
        }

        /**
         * Throttle how often we can restart the observer when new elements are added to the list to be
         * observed. On initial page load and on pages with lots of behaviors a higher number will
         * improve efficiency, essentially batching observations together, but waiting to long can cause
         * flicker or stutter depending on what your behaviors do when connected.
         *
         * @param {int} ms How long the observer in milliseconds should wait between restarts when new
         *                 elements are added to the list to be observed.
         */
        setObserverTimeout(ms = 50) {
            if (this.whatIs(ms) !== 'number') {
                return;
            }

            // Do not allow 0, force at least a 1 millisecond pause.
            if (ms < 0) {
                // eslint-disable-next-line no-param-reassign
                ms = 1;
            }

            this.#observationRestart = this.#throttle(this.#restartObservation, ms);
        }

        /**
         * Start observing the children of the provided element for changes.
         *
         * @param {Node} root The root node to observe.
         * @param {MutationObserverInit} options The MutationObserver options.
         */
        #startObserving() {
            if (this.#observing) {
                return;
            }
            this.#documents.forEach((options, doc) => {
                this.#observer.observe(doc, options);
            });
            this.#observing = true;
        }

        /**
         * Stop observing the children of the provided element for changes.
         */
        #stopObserving() {
            if (!this.#observing) {
                return;
            }
            this.#observer.disconnect();
            this.#observing = false;
        }

        /**
         * Helper method that is used to create the function used to restart the observer when new
         * elements are added to the list to be observed. The throttled function will be stored in
         * #observationRestart.
         *
         * @param {function} func The callback function to run after the throttled time limit.
         * @param {int} limit How long to throttle the request for in milliseconds.
         * @returns {function} A throttled version of the provided function.
         */
        #throttle(func, limit) {
            let lastFunc;
            let lastRan;

            return (...args) => {
                const context = this;
                if (!lastRan) {
                    func.apply(context, args);
                    lastRan = Date.now();
                } else {
                    clearTimeout(lastFunc);
                    lastFunc = setTimeout(() => {
                        if ((Date.now() - lastRan) >= limit) {
                            func.apply(context, args);
                            lastRan = Date.now();
                        }
                    }, Math.max(limit - (Date.now() - lastRan), 0));
                }
            };
        }

        /**
         * Keep a WeakRef to a behavior element.
         *
         * @param {HTMLElement} element The element to keep track of.
         */
        #trackElement(element) {
            this.#elements.set(element, new WeakRef(element));
        }

        /**
         * Handle observing an iframe if we have access to its document.
         *
         * @param {HTMLIFrameElement} element An iframe found in the page.
         */
        #trackIframe(element) {
            // Check if we can even access the iframe.
            if (!element.contentWindow?.document) {
                return;
            }

            // Check if this iframe has been processed already.
            if (this.#documents.has(element)) {
                return;
            }

            /**
             * We need to inject the same logic of #monkeyPatchShadowRoot() into the iframe. This
             * allows shadow DOM behaviors in the iframe to work with Element Behaviors.
             */
            iframe.contentWindow.document.head.appendChild(document.createElement('script')).textContent = `
            /**
             * This is the same monkey patch from Element Behaviors but modified to send iframe
             * shadow dom behaviors to the main document for Element Behaviors to process.
             */
            const originalAttachShadow = Element.prototype.attachShadow;
            const callbackTrackShadow = (element) => {
                parent.elementBehaviors.trackShadowDocument(element);
            };
            Element.prototype.attachShadow = (function(originalMethod) {
                return function() {
                    const result = originalMethod.apply(this, arguments);
                    callbackTrackShadow(this);
                    return result;
                };
            })(originalAttachShadow);
        `;

            // Iframes need time to load, as soon as they do process any behavior elements in them.
            element.contentWindow.addEventListener('DOMContentLoaded', () => {
                // Start observing the iframe for changes.
                this.#observeDocument(element.contentDocument.documentElement);
                this.#observationRestart();
                // Apply behaviors to the frames DOM.
                element.contentDocument.documentElement.querySelectorAll('*').forEach((node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        return;
                    }
                    this.#applyBehaviors(node);
                });
            });
        }

        /**
         * Handle observing a shadow DOM if we have access to its document.
         *
         * NOTE: This should only be called by scripts injected into open iframes; see #trackIframe().
         *
         * @param {ShadowRoot} element A shadow DOM found in the page or an observed element.
         */
        trackShadowDocument(element) {
            const { shadowRoot } = element;

            if (!shadowRoot) {
                return;
            }

            if (!shadowRoot.mode === 'open') {
                return;
            }

            // Check if this shadow DOM has been processed already.
            if (this.#documents.get(shadowRoot)) {
                return;
            }

            this.#shadowDocuments.set(element, { processed: false, shadowRoot });

            this.#observeDocument(shadowRoot);
            this.#observationRestart();
        }

        undefine(name, behaviorClass) {
            // Is this class even registered?
            const existingClass = this.#behaviorClasses.get(name.toLowerCase());
            if (!existingClass) {
                return false;
            }

            // For some level of safety only alow deletion if you can provide the original class.
            if (existingClass !== behaviorClass) {
                return false;
            }

            // Garbage collect this class and all behavior instances that relied on it.
            const elements = this.getBehaviorElements(name.toLowerCase());
            this.removeBehavior(elements, name);
            this.#behaviorClasses.delete(name.toLowerCase());
            return true;
        }

        /**
         * Getter that returns the version of ElementBehaviors in use.
         *
         * @returns The version of ElementBehaviors in use.
         */
        version() {
            return this.#version;
        }

        /**
         * The fastest way to get the actual type of anything in JavaScript.
         *
         * {@link https://jsbench.me/ruks9jljcu/2 | See benchmarks}.
         *
         * @param {*} unknown Anything you wish to check the type of.
         * @return {string|undefined} The type in lowercase of the unknown value passed in or undefined.
         */
        whatIs(unknown) {
            try {
                return {}.toString.call(unknown).match(/\s([^\]]+)/)[1].toLowerCase();
            } catch (e) { return undefined; }
        }

    }

    // Attach a singleton instance of ElementBehaviors to the window (global scope).
    const elementBehaviors = new ElementBehaviors();
    window.elementBehaviors = elementBehaviors;

})();
