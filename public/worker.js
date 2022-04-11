/**
 * The background script for the Chrome extension.
 */

const attackRegex = /^(TA|T|S|M|G|DS)-?(\d{3,5})$/;
const attackUrls = {
    "TA": "https://attack.mitre.org/tactics/{id}/",
    "T": "https://attack.mitre.org/techniques/{id}/",
    "S": "https://attack.mitre.org/software/{id}/",
    "M": "https://attack.mitre.org/mitigations/{id}/",
    "G": "https://attack.mitre.org/groups/{id}/",
    "DS": "https://attack.mitre.org/datasources/{id}/",
}

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
        const url = chrome.runtime.getURL(`public/index.html?q=${query}`);
        chrome.tabs.create({ url });
    } else if (info.menuItemId == "lookup") {
        const match = attackRegex.exec(selection);
        const attackType = match[1].toUpperCase();
        const attackId = `${match[1]}${match[2]}`;
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
