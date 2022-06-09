[![attack](https://img.shields.io/badge/ATT%26CK-v11-red)](https://attack.mitre.org/versions/v11/)
[![build](https://github.com/center-for-threat-informed-defense/attack-powered-suit/actions/workflows/build.yml/badge.svg)](https://github.com/center-for-threat-informed-defense/attack-powered-suit/actions/workflows/build.yml)
[![codecov](https://img.shields.io/codecov/c/github/center-for-threat-informed-defense/attack-powered-suit?token=ejCIZhBRGr)](https://codecov.io/gh/center-for-threat-informed-defense/attack-powered-suit)

# ATT&CK Powered Suit

- [ATT&CK Powered Suit](#attck-powered-suit)
  - [Features](#features)
    - [Search](#search)
    - [Deep Links](#deep-links)
    - [Omnibar](#omnibar)
    - […And More](#and-more)
  - [Installation](#installation)
  - [Community](#community)
    - [Questions and Feedback](#questions-and-feedback)
    - [How Do I Contribute?](#how-do-i-contribute)
    - [Proposing Changes](#proposing-changes)
  - [Developers](#developers)
    - [IDE](#ide)
    - [Developer Setup](#developer-setup)
    - [Unit Tests](#unit-tests)
    - [Linter](#linter)
    - [Upgrading ATT&CK](#upgrading-attck)
    - [Releasing a New Version](#releasing-a-new-version)
  - [Notice](#notice)

## Features

### Search

Powered Suit puts the MITRE ATT&CK® knowledge base at your fingertips. Instantly
search ATT&CK techniques, groups, and more without disrupting your workflow.
Copy snippets into a notebook to streamline your research. Export selected
techniques to ATT&CK navigator. The extension supports context menus, omnibar
support, and more.

![animated gif showing how to search in ATT&CK Powered
Suit](./media/overview.gif)

ATT&CK Powered Suit is created by the Center for Threat-Informed Defense and
released for free (and with open source code) in service of our mission: to
advance the state of the art and the state of the practice in threat-informed
defense globally.

The Center for Threat-Informed Defense does not collect or share any data about
users or their usage of ATT&CK Powered Suit. Search queries and other features
are performed locally in the browser. If you are signed into Chrome using a
Google account, then your bookmarks data is synced via your Google account.

### Deep Links

If you see an ATT&CK technique referenced without a link, you can right click
and jump straight to it.

![animated gif showing how to right-click and deep link to ATT&CK
site](./media/context-menu.gif)

Or right-click on a phrase on any web page and click "Search ATT&CK for …" to
find ATT&CK objects matching that phrase.

### Omnibar

Search for ATT&CK objects directly from the browser's omnibar.

![animated gif showing how to search ATT&CK from the browser's search
bar](./media/omnibar.gif)

If you see the technique you want, click on it to jump directly to that page.
Otherwise, choose "Search in ATT&CK" to view the search results.

### …And More

* One-click text snippets from ATT&CK search results for quick integration into
  your notes or reports.
* Bookmark techniques that you use frequently or are collecting for a research
  assignment.
* Export bookmarks to ATT&CK navigator for visualization and presentation.

## Installation

Click this image to download ATT&CK Powered Suit for free from the Chrome Web
Store.

[![Chrome Web Store badge](media/chrome_web_store.png)](https://chrome.google.com/webstore/detail/attck-powered-suit/gfhomppaadldngjnmbefmmiokgefjddd?hl=en&authuser=0)

## Community

### Questions and Feedback

Please submit issues for any technical questions/concerns or contact
ctid@mitre-engenuity.org directly for more general inquiries.

Also see the guidance for contributors if are you interested in contributing or
simply reporting issues.

### How Do I Contribute?

We welcome your feedback and contributions to help advance ATT&CK Powered Suit.
Please see the guidance for contributors if are you interested in [contributing
or simply reporting issues.](/CONTRIBUTING.md)

Please submit
[issues](https://github.com/center-for-threat-informed-defense/attack_powered_suite/issues)
for any technical questions/concerns or contact ctid@mitre-engenuity.org
directly for more general inquiries.

### Proposing Changes

* Please open a [Pull
  Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
  (PR) against the `main` branch for any desired changes. The PR will be
  reviewed by the project team.
* Note that all PR checks must pass to be eligible for merge approval.

## Developers

### IDE

This project uses the [Svelte web framework](https://svelte.dev/). In your text
editor or IDE, you should install the Svelte plugin for language support and
auto-formatting. For Visual Studio Code, the recommended extension is [Svelte
for VS
Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

### Developer Setup

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

Alternately, you can load it as an extension into chrome:

1. Go to the extensions settings.
2. Make sure "Developer mode" is enabled.
3. Click "Load unpacked" and select the `attack_powered_suite/src` directory.
4. The extension will appear in the extension list and is now usable.

### Unit Tests

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

### Linter

If you open a pull request (PR) on GitHub, it will automatically run
[Super-Linter](https://github.com/github/super-linter) on your PR. Linter errors
block the PR from being merged, so you will need to fix the linter errors and
update the PR. You may find it useful to run the linter locally.

*You must have [Docker installed](https://docs.docker.com/engine/install/) for
this step to work.*

```shell
npm run lint
```

### Upgrading ATT&CK

To upgrade the extension to use a newer version of ATT&CK, there are a few
changes that need to be made:

* `fetch-attack.js`: update `attackUrls`
* `SettingsPanel.svelte`: update the text inside the `<p class="credits">`
  paragraph

After making these changes, run these commands again to download the new release
and re-index it:

```shell
npm run fetch-attack
npm run build-index
```

### Releasing a New Version

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
```

## Notice

Copyright 2021 MITRE Engenuity. Approved for public release. Document number
XXXXX

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

This project makes use of ATT&CK®

[ATT&CK Terms of Use](https://attack.mitre.org/resources/terms-of-use/)
