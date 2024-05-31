# Manually Test Element Behaviors

Before pushing changes to `main` you should complete the following testing procedures:

1. Update the `package.json` version number according to the [Semantic Versioning](https://semver.org/) standards.
2. Run `pnpm build` to build the new version.
3. Start a local http server and visit the [testing page](index.html) in several web browsers.
    - If you are using VS Code for your IDE, the easiest option for testing is the VS Code extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
    - Element Behaviors is designed for modern web browsers only.
    - Test in Brave, Edge, and Firefox.
4. If all tests have passed you can now submit a pull request. **Please include a funny work appropriate gif in the PR comment so we know you followed these instructions.**