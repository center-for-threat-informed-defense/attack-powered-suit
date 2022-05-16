/**
 * The background script for the Chrome extension.
 */

import { initializeSearch, search } from "./search.js";

const attackRegex = /^(TA|T|S|M|G|DS)-?(\d{4})(\.\d{3})?$/;
const attackUrls = {
    "TA": "https://attack.mitre.org/tactics/{id}/",
    "T": "https://attack.mitre.org/techniques/{id}/",
    "S": "https://attack.mitre.org/software/{id}/",
    "M": "https://attack.mitre.org/mitigations/{id}/",
    "G": "https://attack.mitre.org/groups/{id}/",
    "DS": "https://attack.mitre.org/datasources/{id}/",
}

/* Set up Chrome context menus. */

chrome.contextMenus.removeAll();

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
    var selection = info.selectionText.trim();

    if (info.menuItemId == "search") {
        const query = encodeURIComponent(selection);
        const url = chrome.runtime.getURL(`index.html?q=${query}`);
        chrome.tabs.create({ url });
    } else if (info.menuItemId == "lookup") {
        const match = attackRegex.exec(selection);
        const attackType = match[1].toUpperCase();
        let attackId = `${match[1]}${match[2]}`;
        if (match[3]) {
            const subId = match[3].substring(1);
            attackId = `${attackId}/${subId}`;
        }
        const url = attackUrls[attackType].replace("{id}", attackId);
        chrome.tabs.create({ url });
    }
});

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.request == "setAttackLookupEnabled") {
            chrome.contextMenus.update("lookup", {
                enabled: message.attackSelected,
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
        const results = search(inputText, searchFilters);
        for (const result of results.items) {
            suggestions.push({
                content: result.item.url,
                description: `${result.item.id}: ${result.item.name}`,
            });
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
