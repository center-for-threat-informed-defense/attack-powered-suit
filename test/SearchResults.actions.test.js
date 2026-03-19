import { render, screen, fireEvent } from "@testing-library/svelte";

// Mock sanitize-html default export for HighlightMatches.svelte
jest.mock("sanitize-html", () => ({ __esModule: true, default: (html) => html }));

// Mock bookmarks module with in-factory jest.fn() and writable stores we can control
jest.mock("../src/bookmarks.js", () => {
  const { writable } = require("svelte/store");
  const addBookmark = jest.fn();
  const removeBookmark = jest.fn();
  const bookmarksStore = writable([]);
  const bookmarksSetStore = writable({});
  return {
    __esModule: true,
    bookmarksStore,
    bookmarksSetStore,
    addBookmark,
    removeBookmark,
  };
});

// Mock formats module to control available copy formats and formatting behavior
jest.mock("../src/formats.js", () => {
  const { writable } = require("svelte/store");
  const formatsStore = writable([{ id: 1, name: "Name", rule: "{id}", mime: "text/plain" }]);
  return {
    __esModule: true,
    formatsStore,
    formatObject: (rule, obj) => `${obj.attackId.text}`,
    formatHtmlAsPlaintext: (html) => html,
  };
});

// By default, ClipboardItem unsupported; override per test by changing mock return value
jest.mock("../src/Clipboard.js", () => ({ __esModule: true, supportsClipboardItem: jest.fn(() => false) }));

import SearchResults from "../src/SearchResults.svelte";

function makeResult({ stixId, attackId = "T0001", name = "Name", type = "technique", deprecated = false }) {
  return {
    stixId,
    attackId,
    type,
    deprecated,
    name,
    parentName: null,
    description: "desc",
    url: "https://example.com",
    is_enterprise: true,
    is_mobile: false,
    is_ics: false,
    score: 1.0,
    matchData: { metadata: {} },
  };
}

describe("SearchResults.svelte actions", () => {
  const mockedBookmarks = require("../src/bookmarks.js");
  const mockedClipboard = require("../src/Clipboard.js");

  beforeEach(() => {
    // reset bookmark mocks and stores
    mockedBookmarks.addBookmark.mockReset();
    mockedBookmarks.removeBookmark.mockReset();
    mockedBookmarks.bookmarksStore.set([]);
    mockedBookmarks.bookmarksSetStore.set({});

    // reset clipboard support mock and navigator clipboard
    mockedClipboard.supportsClipboardItem.mockReset();
    mockedClipboard.supportsClipboardItem.mockReturnValue(false);
    delete navigator.clipboard;
  });

  test("adds bookmark when not bookmarked", async () => {
    const results = { query: "q", items: [makeResult({ stixId: "stix-A", attackId: "T1000", name: "Foo" })], totalCount: 1 };
    render(SearchResults, { props: { results } });

    const addBtn = screen.getByTitle("Bookmark this object");
    await fireEvent.click(addBtn);
    expect(mockedBookmarks.addBookmark).toHaveBeenCalledWith("stix-A", "T1000", "Foo");
  });

  test("removes bookmark when already bookmarked", async () => {
    // Bookmarked state: set contains stix id
    mockedBookmarks.bookmarksSetStore.set({ "stix-B": true });

    const results = { query: "q", items: [makeResult({ stixId: "stix-B", attackId: "T2000", name: "Bar" })], totalCount: 1 };
    render(SearchResults, { props: { results } });

    const removeBtn = screen.getByTitle("Remove this bookmark");
    await fireEvent.click(removeBtn);
    expect(mockedBookmarks.removeBookmark).toHaveBeenCalledWith("stix-B");
  });

  test("copies using navigator.clipboard.writeText when ClipboardItem unsupported", async () => {
    const results = { query: "q", items: [makeResult({ stixId: "stix-C", attackId: "T3000", name: "Baz" })], totalCount: 1 };
    render(SearchResults, { props: { results } });

    // Mock clipboard writeText
    Object.assign(navigator, { clipboard: { writeText: jest.fn() } });

    const formatBtn = screen.getByTitle("Copy Name to clipboard");
    await fireEvent.click(formatBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test("copies using navigator.clipboard.write with ClipboardItem supported", async () => {
    mockedClipboard.supportsClipboardItem.mockReturnValue(true);
    // Define ClipboardItem and mock write
    global.ClipboardItem = function ClipboardItem() {};
    Object.assign(navigator, { clipboard: { write: jest.fn() } });

    const results = { query: "q", items: [makeResult({ stixId: "stix-D", attackId: "T4000", name: "Qux" })], totalCount: 1 };
    render(SearchResults, { props: { results } });

    const formatBtn = screen.getByTitle("Copy Name to clipboard");
    await fireEvent.click(formatBtn);
    expect(navigator.clipboard.write).toHaveBeenCalled();
  });
});
