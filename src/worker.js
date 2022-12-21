/**
 * The background script for the Chrome extension.
 */

import { getAttackUrl } from "./attack.js";
import { initializeSearch, search } from "./search.js";

/* Set up Chrome context menus. */

chrome = chrome ?? null;

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
    "id": "new-tab",
    "title": 'Open ATT&&CK Powered Suit in new tab',
    "contexts": ["page", "selection"],
});

chrome.contextMenus.create({
    "id": "search",
    "title": 'Search ATT&&CK for "%s"',
    "contexts": ["selection"],
});

chrome.contextMenus.create({
    "id": "lookup",
    "title": 'Go to selected ATT&&CK object',
    "contexts": ["selection"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    var selection = (info.selectionText ?? "").trim();

    if (info.menuItemId == "new-tab") {
        const url = chrome.runtime.getURL(`index.html`);
        chrome.tabs.create({ url });
    } else if (info.menuItemId == "search") {
        const query = encodeURIComponent(selection);
        const url = chrome.runtime.getURL(`index.html?q=${query}`);
        chrome.tabs.create({ url });
    } else if (info.menuItemId == "lookup") {
        const url = getAttackUrl(selection)
        chrome.tabs.create({ url });
    }
});

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.request == "setLookupAttackId") {
            let title;
            if (message.selectedAttackId === null) {
                title = 'Go to selected ATT&&CK object';
            } else {
                title = `Go to "${message.selectedAttackId}" in ATT&&CK`;
            }
            // There's a known race condition where setting the menu title may
            // not take effect prior to the menu being rendered. This could
            // lead to undesirable behavior, i.e. the user seeing the wrong
            // technique ID in the context menu.
            // https://bugs.chromium.org/p/chromium/issues/detail?id=60758
            chrome.contextMenus.update("lookup", {
                enabled: message.selectedAttackId !== null,
                title,
            });
            return true;
        }
    }
);

/* Set up Chrome omnibox (i.e. the URL bar). */

initializeSearch();
const searchFilters = {
    technique: true,
    subtechnique: true,
    mitigation: true,
    software: true,
    tactic: true,
    dataSource: true,
    group: true,
    deprecated: false,
};

chrome.omnibox.setDefaultSuggestion({
    description: 'Search in ATT&amp;CK',
});

chrome.omnibox.onInputChanged.addListener(
    (inputText, suggestCallback) => {
        if (inputText.length == 0) {
            return;
        }
        var suggestions = [];
        try {
            const results = search(inputText, searchFilters);
            for (const result of results.items) {
                suggestions.push({
                    content: result.url,
                    description: `${result.id}: ${result.name}`,
                });
            }
        } catch (e) {
            console.error("Search failed", e);
        }
        suggestCallback(suggestions);
    }
);

chrome.omnibox.onInputEntered.addListener(
    async (inputText) => {
        const query = encodeURIComponent(inputText);
        var url;
        if (inputText.startsWith("http")) {
            // If the user selects one of the ATT&CK suggestions, it will be
            // received here as a URL, so we should navigate directly to it.
            url = inputText;
        } else {
            url = chrome.runtime.getURL(`index.html?q=${query}`);
        }
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tabs.length > 0) {
            await chrome.tabs.update(tabs[0].id, { url });
        } else {
            await chrome.tabs.create({ url });
        }
    }
);
