import { render, screen, fireEvent } from "@testing-library/svelte";

// Mock bookmarks and color-by stores
jest.mock("../src/bookmarks", () => {
  const { writable } = require("svelte/store");
  const bookmarksStore = writable([]);
  const bookmarksColorByStore = writable("Color");
  return {
    bookmarksStore,
    bookmarksColorByStore,
    removeBookmark: jest.fn(),
    saveBookmarks: jest.fn(),
    saveBookmarksColorBy: jest.fn((v) => bookmarksColorByStore.set(v)),
  };
});

// Mock lookupAttack used by exportCsv
jest.mock("../src/search", () => {
  return {
    lookupAttack: jest.fn((stixId) => {
      const map = {
        A: {
          attackId: "T1111",
          type: "technique",
          description: 'Technique desc with "quotes"',
          url: "https://attack.mitre.org/techniques/T1111/",
          is_enterprise: true,
        },
        B: {
          attackId: "S0001",
          type: "software",
          description: "Software desc, with comma",
          url: "https://attack.mitre.org/software/S0001/",
          is_enterprise: true,
        },
      };
      return map[stixId];
    }),
  };
});

import BookmarksPanel from "../src/BookmarksPanel.svelte";

describe("BookmarksPanel.svelte export CSV", () => {
  let createObjectURLSpy, revokeSpy, createdUrls, createdAnchors, createElementSpy, originalCreateElement, originalCreate, originalRevoke;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    createdUrls = [];
    createdAnchors = [];

    const mockedBookmarks = require("../src/bookmarks");
    mockedBookmarks.bookmarksStore.set([
      { stixId: "A", attackId: "T1111", name: "Technique One", score: 50, notes: 'note "with" quotes', color: "#abcdef" },
      { stixId: "B", attackId: "S0001", name: "Software 1", score: 80, notes: "line,break", color: "#112233" },
    ]);
    mockedBookmarks.bookmarksColorByStore.set("Color");

    // Stub URL and anchor creation to capture blobs and clicks
    global.URL = global.URL || {};
    originalCreate = global.URL.createObjectURL;
    originalRevoke = global.URL.revokeObjectURL;
    createObjectURLSpy = jest.fn((blob) => {
      createdUrls.push({ blob });
      return "blob:csv";
    });
    revokeSpy = jest.fn(() => {});
    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeSpy;

    // Spy on createElement but return a real anchor to satisfy diplomat operations
    originalCreateElement = document.createElement;
    createElementSpy = jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        const anchor = originalCreateElement.call(document, "a");
        // Spy on click
        jest.spyOn(anchor, "click").mockImplementation(() => {});
        createdAnchors.push(anchor);
        return anchor;
      }
      return originalCreateElement.call(document, tagName);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    if (createElementSpy) createElementSpy.mockRestore();
    // Restore URL methods
    if (originalCreate === undefined) {
      delete global.URL.createObjectURL;
    } else {
      global.URL.createObjectURL = originalCreate;
    }
    if (originalRevoke === undefined) {
      delete global.URL.revokeObjectURL;
    } else {
      global.URL.revokeObjectURL = originalRevoke;
    }
  });

  async function readBlobText(blob) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsText(blob);
    });
  }

  test("exports CSV with Color column and proper quoting", async () => {
    render(BookmarksPanel);

    const btn = screen.getByText(/Export CSV/i);
    await fireEvent.click(btn);

    // One blob created
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createdUrls[0].blob;
    const csv = await readBlobText(blob);

    // Header reflects Color mode
    expect(csv.startsWith("object_id,type,name,description,url,color,notes\r\n")).toBe(true);

    // Rows are fully quoted and quotes are doubled
    expect(csv).toContain('"T1111"');
    expect(csv).toContain('"Technique desc with ""quotes"""');
    expect(csv).toContain('"note ""with"" quotes"');

    // URL revoked after timeout
    jest.advanceTimersByTime(110);
    expect(revokeSpy).toHaveBeenCalledWith("blob:csv");
  });

  test("exports CSV with Score column when toggled", async () => {
    const mockedBookmarks = require("../src/bookmarks");
    mockedBookmarks.bookmarksColorByStore.set("Score");

    render(BookmarksPanel);
    const btn = screen.getByText(/Export CSV/i);
    await fireEvent.click(btn);

    const blob = createdUrls[0].blob;
    const csv = await readBlobText(blob);
    expect(csv.startsWith("object_id,type,name,description,url,score,notes\r\n")).toBe(true);
  });
});
