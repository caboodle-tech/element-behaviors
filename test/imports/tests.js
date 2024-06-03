const removeElementFromPage = async(element) => {
    const state = ['DISCONNECTED', 'CONNECTED'];
    element.pageCounter.remove();
    await sleep(250);
    element.arenaDiv.appendChild(element.pageCounter);
    return state;
};

const removeElementFromFrame = async(element) => {
    const state = ['DISCONNECTED', 'CONNECTED'];
    element.frameCounter.remove();
    await sleep(250);
    element.iframe.contentDocument.body.appendChild(element.frameCounter);
    return state;
};

const interactWithPageElement = async(element) => {
    const state = ['CHANGED', 'CHANGED', 'CHANGED'];
    element.pageCounter.click();
    element.pageCounter.click();
    element.pageCounter.click();
    await sleep(250);
    if (element.pageCounter.getAttribute('count') !== '3') {
        state.push('FAILED CHECK');
    }
    if (!element.pageCounter.innerText.includes('3')) {
        state.push('FAILED CHECK');
    }
    return state;
};

const interactWithFrameElement = async(element) => {
    const state = ['CHANGED', 'CHANGED', 'CHANGED'];
    element.frameCounter.click();
    element.frameCounter.click();
    element.frameCounter.click();
    await sleep(250);
    if (element.frameCounter.getAttribute('count') !== '3') {
        state.push('FAILED CHECK');
    }
    if (!element.frameCounter.innerText.includes('3')) {
        state.push('FAILED CHECK');
    }
    return state;
};

const verifyObservedAttributes = async(element) => {
    const state = ['CHANGED', 'CHANGED'];
    element.pageCounter.removeAttribute('count');
    element.pageCounter.setAttribute('count', 3);
    if (element.oldValue !== undefined && element.newValue !== 3) {
        state.push('FAILED CHECK');
    }
    return state;
};

const modifyPageElementAttribute = async(element) => {
    const state = ['CHANGED', 'CHANGED'];
    element.pageCounter.setAttribute('count', 9000);
    await sleep(150);
    if (element.pageCounter.getAttribute('count') !== '9000') {
        state.push('FAILED CHECK');
    } else {
        element.pageCounter.setAttribute('count', 9);
    }
    await sleep(100);
    return state;
};

const modifyWithFrameElementAttribute = async(element) => {
    const state = ['CHANGED', 'CHANGED'];
    element.frameCounter.setAttribute('count', 9000);
    await sleep(150);
    if (element.frameCounter.getAttribute('count') !== '9000') {
        state.push('FAILED CHECK');
    } else {
        element.frameCounter.setAttribute('count', 9);
    }
    await sleep(100);
    return state;
};

const moveToFrameAndBack = async(element) => {
    const state = ['DISCONNECTED', 'ADOPTED', 'CONNECTED', 'DISCONNECTED', 'ADOPTED', 'CONNECTED'];
    const { arenaDiv } = element;
    const { iframe } = element;
    const { pageCounter } = element;
    iframe.contentDocument.body.appendChild(iframe.contentWindow.document.adoptNode(pageCounter));
    await sleep(250);
    arenaDiv.appendChild(document.adoptNode(pageCounter));
    return state;
};

const moveToPageAndBack = async(element) => {
    const state = ['DISCONNECTED', 'ADOPTED', 'CONNECTED', 'DISCONNECTED', 'ADOPTED', 'CONNECTED'];
    const { arenaDiv } = element;
    const { iframe } = element;
    const { frameCounter } = element;
    arenaDiv.appendChild(document.adoptNode(frameCounter));
    await sleep(250);
    iframe.contentDocument.body.appendChild(iframe.contentWindow.document.adoptNode(frameCounter));
    return state;
};

const createPageShadowDom = async(element) => {
    const state = ['CONNECTED', 'CHANGED'];
    const { arenaDiv } = element;
    const shadowHost = document.createElement('div');
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const innerDiv = document.createElement('div');
    shadowRoot.appendChild(innerDiv);
    innerDiv.setAttribute('has', 'click-counter');
    arenaDiv.appendChild(shadowHost);
    await sleep(250);
    innerDiv.click();
    element.pageShadow = shadowHost;
    return state;
};

const createFrameShadowDom = async(element) => {
    const state = ['CONNECTED', 'CHANGED'];
    const { iframe } = element;
    const shadowHost = iframe.contentDocument.createElement('div');
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const innerDiv = iframe.contentDocument.createElement('div');
    shadowRoot.appendChild(innerDiv);
    innerDiv.setAttribute('has', 'click-counter');
    iframe.contentDocument.body.appendChild(shadowHost);
    await sleep(250);
    innerDiv.click();
    element.frameShadow = shadowHost;
    return state;
};

const moveShadowToFrameAndBack = async(element) => {
    const state = ['DISCONNECTED', 'ADOPTED', 'CONNECTED', 'DISCONNECTED', 'ADOPTED', 'CONNECTED'];
    const { arenaDiv } = element;
    const { iframe } = element;
    const { pageShadow } = element;
    iframe.contentDocument.body.appendChild(iframe.contentWindow.document.adoptNode(pageShadow));
    await sleep(250);
    arenaDiv.appendChild(document.adoptNode(pageShadow));
    return state;
};

const moveShadowToPageAndBack = async(element) => {
    const state = ['DISCONNECTED', 'ADOPTED', 'CONNECTED', 'DISCONNECTED', 'ADOPTED', 'CONNECTED'];
    const { arenaDiv } = element;
    const { iframe } = element;
    const { frameShadow } = element;
    arenaDiv.appendChild(document.adoptNode(frameShadow));
    await sleep(250);
    iframe.contentDocument.body.appendChild(iframe.contentWindow.document.adoptNode(frameShadow));
    return state;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default [
    {
        test: removeElementFromPage,
        title: 'Disconnect and Connect Element (Page)',
        description: 'Disconnect an element with behaviors from the page and then reattach it to the page.'
    },
    {
        test: removeElementFromFrame,
        title: 'Disconnect and Connect Element (Iframe)',
        description: 'Disconnect an element with behaviors from the iframe and then reattach it to the iframe.'
    },
    {
        test: interactWithPageElement,
        title: 'Interact with Counter (Page)',
        description: 'Press the page counter 3 times and verify that the data attribute and elements text updates.'
    },
    {
        test: interactWithFrameElement,
        title: 'Interact with Counter (Frame)',
        description: 'Press the iframe counter 3 times and verify that the data attribute and elements text updates.'
    },
    {
        test: verifyObservedAttributes,
        title: 'Verify Observed Attributes',
        description: 'Modify the page counter attribute and verify the <code>observedAttributes</code> is working correctly.'
    },
    {
        test: modifyPageElementAttribute,
        title: 'Modify Element Attribute (Page)',
        description: 'Modify the count attribute of the page element and ensure it triggers an update to the element.'
    },
    {
        test: modifyWithFrameElementAttribute,
        title: 'Modify Element Attribute (Frame)',
        description: 'Modify the count attribute of the frame element and ensure it triggers an update to the element.'
    },
    {
        test: moveToFrameAndBack,
        title: 'Adopt to Iframe from Page and back Again',
        description: 'Adopt element from the page to the iframe and then back to the original page.'
    },
    {
        test: moveToPageAndBack,
        title: 'Adopt to Page from Iframe and back Again',
        description: 'Adopt element from the iframe to the page and then back to the iframe.'
    },
    {
        test: createPageShadowDom,
        title: 'Test Page Shadow DOM with Behavior',
        description: 'Check that behaviors work in open shadow DOMs created in the primary document.'
    },
    {
        test: createFrameShadowDom,
        title: 'Test Iframe Shadow DOM with Behavior',
        description: 'Check that behaviors work in open shadow DOMs created in an iframe document.'
    },
    {
        test: moveShadowToFrameAndBack,
        title: 'Adopt Shadow DOM Element to Iframe from Page and back Again',
        description: 'Adopt Shadow DOM element from the page to the iframe and then back to the original page.'
    },
    {
        test: moveShadowToPageAndBack,
        title: 'Adopt Shadow DOM Element to Page from Iframe and back Again',
        description: 'Adopt Shadow DOM element from the iframe to the page and then back to the iframe.'
    }
];
