# Developers

- [IDE](#ide)
- [Developer Setup](#developer-setup)
- [Browsers](#browsers)
  - [Chrome](#chrome)
  - [Safari](#safari)
  - [Firefox](#firefox)
- [Unit Tests](#unit-tests)
- [Linter](#linter)
- [Upgrading ATT\&CK](#upgrading-attck)
- [Releasing a New Version](#releasing-a-new-version)

## IDE

This project uses the [Svelte web framework](https://svelte.dev/). In your text
editor or IDE, you should install the Svelte plugin for language support and
auto-formatting. For Visual Studio Code, the recommended extension is [Svelte
for VS
Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Developer Setup

To set up a development environment, you first need to [install Node.JS and
npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). Then
clone this repository and run the following commands.

```shell
cd src
npm install
npm run fetch-attack
npm run build-index
npm run dev
```

> **Note:** if your organization runs an SSL intercept proxy, you may get an SSL
> error while running `fetch-attack`. If this happens, export your
> organization's root certificates into a PEM-formatted file. (PEM is the format
> that starts with `----- BEGIN CERTIFICATE -----`.) Then export the following
> environment variable in your shell: `export
> NODE_EXTRA_CA_CERTS=/path/to/organization/root_certificate.crt`. Now you
> should be able to run `fetch-attack` successfully.

At this point, the dev server is running and will automatically recompile after
you change any source code files. You can develop and debug the code by visiting
[localhost:8080](http://localhost:8080). This view will automatically reload
each time the source code is saved, which is useful for rapid development
cycles.

> **Note:** If port 8080 is unavailable on your machine, you can run the dev
> server on a different port by setting `PORT` in the environment, e.g.
> `PORT=1234 npm run dev` to run on port 1234.

## Browsers

### Chrome

To test in Chrome, you need to copy the build artifacts into `browsers/chrome` by
running `make chrome-ext`. Then load the extension into Chrome:

1. Go to the extensions settings.
2. Make sure "Developer mode" is enabled.
3. Click "Load unpacked" and select the `attack_powered_suit/browsers/chrome` directory.
4. The extension will appear in the extension list and is now usable.

If you have `fswatch` installed, you can set the make target to run each time the code
in `public/` is rebuilt:

```
fswatch -o public | xargs -n1 make chrome-ext
```

### Safari

The Safari extension can only be built on MacOS. First, copy the build artifacts
into the Safari directory:

```
make safari-ext
```

Or if you have `fswatch` installed:

```
fswatch -o public | xargs -n1 make safari-ext
```

> **Note:** The Safari extension must be rebuilt in XCode to pick up changes in the
> Node.js build artifacts, so keep that in mind when using `fswatch` &mdash; it's not
> fully automatic.

You need to have [XCode installed](https://developer.apple.com/xcode/resources/). Open
the project file `browsers/safari/attack-powered-suit.xcodeproj` and click the build
button. This will spawn a wrapper process (all Safari extensions must be wrapped in an
application) that shows a button to open the Safari Extension Preferences.

![The Safari wrapper shows the extension's installation status and contains a button to
open Safari's extension preferences.](safari-wrapper.png)

When you open the Safari Preferences, you will see the installed extension. You can also
choose to grant permission for the extension to access the websites you visit. (This
permission is used for the "Search ATT&CK for &lt;highlighted text&gt;" context menu.)

![Use the Safari Extensions preferences to grant permission to view all
sites.](safari-permissions.png)

### Firefox

To test in Firefox, you need to copy the build artifacts into `browsers/firefox` by
running `make firefox-ext`. Then load the extension into Firefox:

1. Make sure you're using Firefox Developer Edition.
2. Go to the page `about:debugging` and nagivate to "This Firefox" in the left menu.
3. Click "Load Temporary Add-on" and select the `attack_powered_suit/browsers/firefox` directory.
4. The extension will appear in the extension list and is now usable.

## Unit Tests

To run the test suite:

```shell
npm run test
```

Alternately, use "watch" mode to automatically re-run tests each time you modify
the source code:

```shell
npm run watch-test
```

The test suite writes code coverage data to `./coverage/`. For more information
on writing unit tests, see:

* [Unit Testing Svelte
  Components](https://sveltesociety.dev/recipes/testing-and-debugging/unit-testing-svelte-component/)
* [Testing Library Svelte
  API](https://testing-library.com/docs/svelte-testing-library/api).
* [Testing Library
  API](https://testing-library.com/docs/queries/about/#types-of-queries)

## Linter

If you open a pull request (PR) on GitHub, it will automatically run
[Super-Linter](https://github.com/github/super-linter) on your PR. Linter errors
block the PR from being merged, so you will need to fix the linter errors and
update the PR. You may find it useful to run the linter locally.

*You must have [Docker installed](https://docs.docker.com/engine/install/) for
this step to work.*

```shell
npm run lint
```

## Upgrading ATT&CK

To upgrade the extension to use a newer version of ATT&CK, there are a few
changes that need to be made:

* `fetch-attack.js`: update `attackUrls`
* `SearchForm.svelte`: update the text inside the `<p class="notice">`
  paragraph
* `attack.js`: update the metadata in `newLayerTemplate()`. (Only applies to major
  version changes.)

After making these changes, run these commands again to download the new release
and re-index it:

```shell
npm run fetch-attack
npm run build-index
```

## Releasing a New Version

Use npm to generate a new version number:

```shell
$ npm version minor
v0.2.0
```

NPM automatically does the following:

* Put new version number in `package.json` and `manifest.json`.
* Commit those changes.
* Create a new Git tag.

If you are satisfied with the changes, you just need to push them, e.g.

```shell
$ git push --follow-tags
Enumerating objects: 1, done.
Counting objects: 100% (1/1), done.
Writing objects: 100% (1/1), 165 bytes | 165.00 KiB/s, done.
Total 1 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/center-for-threat-informed-defense/attack-powered-suit.git
 * [new tag] v0.2.0 -> v0.2.0
```
