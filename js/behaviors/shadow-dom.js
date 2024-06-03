/**
 * This is not a behavior but an example of behaviors being used in shadow DOMs.
 */
document.addEventListener('DOMContentLoaded', () => {
    const shadowDom = document.getElementById('shadow-dom-example');
    const shadowRoot = shadowDom.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `<button has="click-counter" style="transform: scale(1.25);"></button>`;
});
