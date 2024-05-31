# Element Behaviors

Element Behaviors let you easily add reusable features (behaviors) to any HTML element with a simple `has=""` attribute. This provides a flexible and efficient alternative to [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components#custom_elements).

# Usage

Element Behaviors allow you to enhance standard HTML elements with multiple functionalities without the need to define traditional custom elements. This makes it easier to add complex interactions and features to any element.

### Example: Game Character

In this example, a `div` represents a human-controllable player in a game. The player is controlled by player two and is currently holding a sword:

```html
<div has="player two" position="30 30 30" left-hand="" right-hand="sword"></div>
```

### Example: Loader

Element Behaviors can also respond to the lifecycle events of HTML elements, allowing for dynamic and flexible enhancements. In this example, a `div` functions as a loader. The `loader` attribute customizes its appearance, and the `visible` attribute toggles its visibility:

```html
<div has="loader" loader="wave" visible="true">
    Text shown when loader is set to `text`.
</div>
```

With Element Behaviors, you can seamlessly integrate advanced functionalities into your web components, providing a powerful alternative to custom elements.

# Installation

The Element Behaviors library should be added to your web pages in the `<head>` tag, preferably before all other scripts:

- Production websites or applications should use the [compressed (minified) library](./dist/eb.min.js).
- If bundling Element Behaviors into something else you may want the [uncompressed library](./dist/eb.js).

If you would like to use a CDN we are on [jsDelivr](https://www.jsdelivr.com/):

```html
<!-- For the latest release. -->
<script src="https://cdn.jsdelivr.net/gh/caboodle-tech/element-behaviors@main/dist/eb.min.js"></script>

<!-- For older releases that have been tagged. Replace [TAG] with the proper semver number. -->
<script src="https://cdn.jsdelivr.net/gh/caboodle-tech/element-behaviors@[TAG]/dist/eb.min.js"></script>
```

# Contributing
Contributions are welcome! If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/caboodle-tech/element-behaviors/issues) on GitHub.

If you would like to contribute code changes, you can do so by submitting a pull request. Pull request will not be accepted if they do not reference [open an issue](https://github.com/caboodle-tech/element-behaviors/issues). Before submitting a pull request, make sure to follow **all** these steps:

1. Fork the repository and create a new branch for your changes.
2. Make your code changes and ensure that they adhere to the project's coding conventions enforced by the project's [eslint config](./eslint.config.js) and [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) messages.
3. Test your changes thoroughly to ensure they do not introduce any regressions. Refer to the [testing instructions](./test/README.md) for more information on how to run the manual tests.
4. Commit your changes and push them to your forked repository.
5. Open a pull request on the main repository, including the issue number in the title, and provide a clear description of your changes.

> [!IMPORTANT]
> Please note that we use `pnpm` instead of `npm` as our package manager. Additionally, we follow the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format for commit all messages.

# Differences in *Element Behaviors*

Attaching behaviors to elements is not a new concept and libraries attempting to do this have been around for some time. This library is my opinionated take on what *element behaviors* should look like, for a longer explanation please see the [Brief History](#brief-history) section below.

This library was heavily inspired by [Lume's Element Behaviors](https://github.com/lume/element-behaviors) entity-component system, but includes functionality I felt was missing. Caboodle Tech's element behaviors is more closely aligned with the expectations (developers hopes) for [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) which includes:

- [Responding to attribute changes](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes) with `observedAttributes`.
- Saving state between disconnection and reconnection to any^ document.
- The option to save state between removal and restoring of a behavior to the same element.
- Working^ inside shadow dom and iframes.

**^** Since this library is not native code there are some restrictions and trade offs to these points. Please see the TODO TODO for more information.

# Brief History

The idea of attaching behaviors to elements has been around for at least a decade and a half, but I personally give credit to [Joe Pea](https://github.com/trusktr) for pioneering a working concept with [Lume's Element Behaviors](https://github.com/lume/element-behaviors) entity-component system.

This desire for *elements with behaviors* is entwined with the history of [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components#custom_elements). To be brief, Caboodle Tech's element behavior library ultimately steamed from Safari/WebKit refusing to adopt [customized built-ins and the `is` attribute](https://bugs.webkit.org/show_bug.cgi?id=182671). This meant there would be no true 100% cross browser implementation of custom elements. The slightly longer history, one including the desire for custom attributes as well, is covered in Lume's element-behaviors note section: 

> See this [long issue](https://github.com/w3c/webcomponents/issues/509) on w3c's webcomponents repo,
  which led to [the issue](https://github.com/w3c/webcomponents/issues/662) where the idea for element-behaviors was born,
  with some ideas from this [other issue](https://github.com/w3c/webcomponents/issues/663)... [Element Behaviors also uses] [custom-attributes](https://github.com/lume/custom-attributes) (originally by @matthewp, forked
  in [LUME](https://lume.io)) to implement the `has=""` attribute.

**Brief aside here:** Well I was initially annoyed by the Safari/WebKit decision, I came to realize that they made the right call. Custom elements were a step in the right direction, but the implementation was less than desireable. This decision is what paved the way for developers to get innovative and think outside the box, hence the creation of element behaviors, the best successor to and evolution of custom elements in my opinion.

As of September 2023 the Web Incubator Community Group (WICG) has started discussing a [proposal](https://github.com/WICG/webcomponents/issues/1029) for "custom attributes for all elements, [and] enhancements for more complex use cases". I am excited to see what comes from this proposal, but as the web standards history has taught me, I won't hold my breath for the 100% adoption of any of these features.

For the time being this implementation (Caboodle Tech's implementation) of element behaviors is exactly what *custom elements* should be in my mind: elements that support the  dynamic adding or removing of behaviors and attributes across documents. This is why Caboodle Tech's element behaviors [operates differently](#differences-in-element-behaviors) than Lume's.

~ Chris (May 2024)