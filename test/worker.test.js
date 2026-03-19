// Tests for background worker behaviors with mocked Chrome APIs

jest.mock("../src/search.js", () => ({
  __esModule: true,
  initializeSearch: jest.fn(),
  search: jest.fn(),
}));

jest.mock("../src/attack.js", () => ({
  __esModule: true,
  getAttackUrl: jest.fn((text) => `https://attack.example/${encodeURIComponent(text)}`),
}));

function makeChrome(withOmnibox = false) {
  const listeners = {};
  const contextMenus = {
    removeAll: jest.fn(),
    create: jest.fn(),
    onClicked: { addListener: jest.fn((cb) => { listeners.onClicked = cb; }) },
    update: jest.fn(),
  };
  const runtime = {
    getURL: jest.fn((path) => `chrome-extension://test/${path}`),
    onMessage: { addListener: jest.fn((cb) => { listeners.onMessage = cb; }) },
  };
  const tabs = {
    create: jest.fn(async () => ({})),
    update: jest.fn(async () => ({})),
    query: jest.fn(async () => ([])),
  };
  const omnibox = withOmnibox
    ? {
        setDefaultSuggestion: jest.fn(),
        onInputChanged: { addListener: jest.fn((cb) => { listeners.onOmniChanged = cb; }) },
        onInputEntered: { addListener: jest.fn((cb) => { listeners.onOmniEntered = cb; }) },
      }
    : undefined;
  global.chrome = { contextMenus, runtime, tabs };
  if (omnibox) global.chrome.omnibox = omnibox;
  return { listeners, contextMenus, runtime, tabs, omnibox };
}

describe("worker.js", () => {
  beforeEach(() => {
    jest.resetModules();
    delete global.chrome;
    jest.clearAllMocks();
  });

  test("creates context menus on load", () => {
    const { contextMenus } = makeChrome(false);
    // Import with mocks in place
    jest.isolateModules(() => {
      require("../src/worker.js");
    });
    expect(contextMenus.removeAll).toHaveBeenCalled();
    expect(contextMenus.create).toHaveBeenCalledTimes(3);
    const ids = contextMenus.create.mock.calls.map((c) => c[0].id).sort();
    expect(ids).toEqual(["lookup", "new-tab", "search"].sort());
  });

  test("onClicked new-tab opens index page", async () => {
    const { listeners, runtime, tabs } = makeChrome(false);
    jest.isolateModules(() => {
      require("../src/worker.js");
    });
    await listeners.onClicked({ menuItemId: "new-tab", selectionText: "" }, {});
    expect(runtime.getURL).toHaveBeenCalledWith("index.html");
    expect(tabs.create).toHaveBeenCalledWith({ url: expect.stringContaining("index.html") });
  });

  test("onClicked search opens query page with encoded selection", async () => {
    const { listeners, runtime, tabs } = makeChrome(false);
    jest.isolateModules(() => {
      require("../src/worker.js");
    });
    await listeners.onClicked({ menuItemId: "search", selectionText: "foo bar" }, {});
    expect(runtime.getURL).toHaveBeenCalledWith("index.html?q=foo%20bar");
    expect(tabs.create).toHaveBeenCalledWith({ url: expect.stringContaining("q=foo%20bar") });
  });

  test("onClicked lookup navigates to getAttackUrl(selection)", async () => {
    const { listeners, tabs } = makeChrome(false);
    const { getAttackUrl } = require("../src/attack.js");
    jest.isolateModules(() => {
      require("../src/worker.js");
    });
    await listeners.onClicked({ menuItemId: "lookup", selectionText: "T1234" }, {});
    expect(getAttackUrl).toHaveBeenCalledWith("T1234");
    expect(tabs.create).toHaveBeenCalledWith({ url: "https://attack.example/T1234" });
  });

  test("onMessage setLookupAttackId updates context menu title and enabled", async () => {
    const { listeners, contextMenus } = makeChrome(false);
    jest.isolateModules(() => {
      require("../src/worker.js");
    });
    // Set with non-null id
    listeners.onMessage({ request: "setLookupAttackId", selectedAttackId: "T1000" }, {}, () => {});
    expect(contextMenus.update).toHaveBeenCalledWith(
      "lookup",
      expect.objectContaining({ enabled: true, title: 'Go to "T1000" in ATT&&CK' })
    );
    // Set with null id
    contextMenus.update.mockClear();
    listeners.onMessage({ request: "setLookupAttackId", selectedAttackId: null }, {}, () => {});
    expect(contextMenus.update).toHaveBeenCalledWith(
      "lookup",
      expect.objectContaining({ enabled: false, title: "Go to selected ATT&&CK object" })
    );
  });

  test("omnibox integrates search results into suggestions and updates/creates tabs", async () => {
    const { listeners, runtime, tabs } = makeChrome(true);
    const mockedSearch = require("../src/search.js");
    mockedSearch.initializeSearch.mockClear();
    mockedSearch.search.mockReset();

    jest.isolateModules(() => {
      require("../src/worker.js");
    });

    // initializeSearch called on load
    expect(mockedSearch.initializeSearch).toHaveBeenCalled();

    // Suggestion path
    mockedSearch.search.mockReturnValue({
      items: [
        { attackId: "T1111", name: "Name", url: "https://attack.example/T1111" },
      ],
    });
    const suggestions = [];
    await listeners.onOmniChanged("tech", (s) => suggestions.push(...s));
    expect(suggestions).toEqual([
      { content: "https://attack.example/T1111", description: "T1111: Name" },
    ]);

    // InputEntered: updates active tab when present
    tabs.query.mockResolvedValueOnce([{ id: 42 }]);
    await listeners.onOmniEntered("non-http");
    expect(runtime.getURL).toHaveBeenCalledWith("index.html?q=non-http");
    expect(tabs.update).toHaveBeenCalledWith(42, { url: expect.any(String) });

    // InputEntered: creates new tab when none active; direct URL when startsWith http
    tabs.query.mockResolvedValueOnce([]);
    await listeners.onOmniEntered("http://example.com/x");
    expect(tabs.create).toHaveBeenCalledWith({ url: "http://example.com/x" });
  });
});
