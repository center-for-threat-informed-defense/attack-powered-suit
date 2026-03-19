import { render, screen } from "@testing-library/svelte";
import { writable } from "svelte/store";

// Mock bookmarks module with stores
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

// search and attack are only needed for exports; leave as real modules

import BookmarksPanel from "../src/BookmarksPanel.svelte";

describe("BookmarksPanel.svelte rendering and empty state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mocked = require("../src/bookmarks");
    mocked.bookmarksStore.set([]);
    mocked.bookmarksColorByStore.set("Color");
  });

  test("shows empty state when no bookmarks present", () => {
    render(BookmarksPanel);
    expect(
      screen.getByText(/Create a bookmark by clicking the/i)
    ).toBeInTheDocument();
  });

  test("renders a bookmark row with ATT&CK ID, Name, and Notes", () => {
    const mocked = require("../src/bookmarks");
    mocked.bookmarksStore.set([
      {
        stixId: "attack-pattern--x",
        attackId: "T1000",
        name: "Test Technique",
        score: 50,
        notes: "My note",
        color: "#112233",
      },
    ]);

    render(BookmarksPanel);

    expect(screen.getByText("T1000")).toBeInTheDocument();
    expect(screen.getByText("Test Technique")).toBeInTheDocument();
    expect(screen.getByDisplayValue("My note")).toBeInTheDocument();
  });

  test("Back button dispatches showSearch", () => {
    const { component } = render(BookmarksPanel);
    const handler = jest.fn();
    component.$on("showSearch", handler);

    // Back button is rendered by BackButton.svelte with text "Back"
    screen.getByText("Back").click();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
