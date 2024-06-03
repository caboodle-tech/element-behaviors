/**
 * This is not a behavior but an example of behaviors being used between documents.
 */
document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.querySelector('#iframe-example iframe');
    const documentArea = document.getElementById('document-area');
    let buttonInDocument = false;

    // This function moves the button between the main document and the iframe.
    const moveButtonBetweenDocumentAndIframe = (behaviorButton) => {
        if (!buttonInDocument) {
            // If the button is not in the main document, adopt it to the 'documentArea' element.
            documentArea.appendChild(document.adoptNode(behaviorButton));
            buttonInDocument = true;
        } else {
            // If the button is in the main document, adopt it to the iframe's content document body.
            iframe.contentDocument.body.appendChild(iframe.contentWindow.document.adoptNode(behaviorButton));
            buttonInDocument = false;
        }
    };

    // Use setTimeout to give the demo iframe time to load its content.
    setTimeout(() => {
        // Find the behavior button inside the iframe's content document body.
        const behaviorButton = iframe.contentWindow.document.body.querySelector('button[has="click-counter"]');

        // Move the button between the main document and the iframe every 5 seconds.
        setInterval(moveButtonBetweenDocumentAndIframe.bind(null, behaviorButton), 5000);
    }, 1500);
});
