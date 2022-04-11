/**
 * This script is injected into each active tab.
 *
 * It monitors the current selection and enables the "Go to selected ATT&CK
 * object" context menu when the selected text looks like an ATT&CK object.
 */
const attackRegex = /^(TA|T|S|M|G|DS)-?(\d{3,5})$/;

document.addEventListener("selectionchange", function () {
    var selection = window.getSelection().toString().trim();
    chrome.runtime.sendMessage({
        request: "setAttackLookupEnabled",
        attackSelected: attackRegex.test(selection),
    })
});
