import { render, screen, fireEvent } from "@testing-library/svelte";

// Mock bookmarks module with stores and actions we can assert
jest.mock("../src/bookmarks", () => {
  const { writable } = require("svelte/store");
  const bookmarksStore = writable([]);
  const bookmarksColorByStore = writable("Color");
  const removeBookmark = jest.fn();
  const saveBookmarks = jest.fn();
  const saveBookmarksColorBy = jest.fn((v) => bookmarksColorByStore.set(v));
  return {
    bookmarksStore,
    bookmarksColorByStore,
    removeBookmark,
    saveBookmarks,
    saveBookmarksColorBy,
  };
});

import BookmarksPanel from "../src/BookmarksPanel.svelte";

describe("BookmarksPanel.svelte interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mocked = require("../src/bookmarks");
    mocked.bookmarksStore.set([
      {
        stixId: "stix-1",
        attackId: "T1000",
        name: "Test Technique",
        score: 50,
        notes: "My note",
        color: "#112233",
      },
    ]);
    mocked.bookmarksColorByStore.set("Color");
  });

  test("change color input triggers save and updates input value", async () => {
    const mocked = require("../src/bookmarks");
    render(BookmarksPanel);

    const colorInput = screen.getByDisplayValue("#112233");
    await fireEvent.input(colorInput, { target: { value: "#445566" } });
    expect(mocked.saveBookmarks).toHaveBeenCalled();
    expect(colorInput).toHaveValue("#445566");
  });

  test("toggle Color -> Score and back; correct input types and calls", async () => {
    const mocked = require("../src/bookmarks");
    render(BookmarksPanel);

    // In Color mode header shows "Color"; clicking should switch to Score
    const colorToggle = screen.getByText("Color");
    await fireEvent.click(colorToggle);
    expect(mocked.saveBookmarksColorBy).toHaveBeenCalledWith("Score");

    // After toggle, score input should be present
    const scoreInput = await screen.findByDisplayValue("50");
    expect(scoreInput).toHaveAttribute("type", "number");

    // Change score triggers save
    await fireEvent.input(scoreInput, { target: { value: "70" } });
    expect(mocked.saveBookmarks).toHaveBeenCalled();

    // Toggle back to Color
    const scoreToggle = screen.getByText("Score");
    await fireEvent.click(scoreToggle);
    expect(mocked.saveBookmarksColorBy).toHaveBeenCalledWith("Color");

    // Color input visible again
    expect(await screen.findByDisplayValue("#112233")).toBeInTheDocument();
  });

  test("changing notes triggers save", async () => {
    const mocked = require("../src/bookmarks");
    render(BookmarksPanel);

    const notesInput = screen.getByDisplayValue("My note");
    await fireEvent.input(notesInput, { target: { value: "Updated note" } });
    expect(mocked.saveBookmarks).toHaveBeenCalled();
  });

  test("remove bookmark button calls remove with stix id", async () => {
    const mocked = require("../src/bookmarks");
    render(BookmarksPanel);

    const removeBtn = screen.getByTitle("Remove this bookmark");
    await fireEvent.click(removeBtn);
    expect(mocked.removeBookmark).toHaveBeenCalledWith("stix-1");
  });

  test("accordion toggles show/collapsed classes for both sections", async () => {
    render(BookmarksPanel);

    const bookmarksHeader = screen.getByText("Export Bookmarks");
    const navHeader = screen.getByText("Export ATT&CK Navigator Layer");

    // Initially, both collapsed (no 'show' collapse bodies visible)
    const collapses = document.querySelectorAll(".accordion-collapse");
    collapses.forEach((c) => expect(c).not.toHaveClass("show"));

    // Expand Bookmarks section
    await fireEvent.click(bookmarksHeader);
    const bookmarksCollapse = collapses[0];
    expect(bookmarksCollapse).toHaveClass("show");

    // Switch to Navigator section
    await fireEvent.click(navHeader);
    const navigatorCollapse = collapses[1];
    expect(navigatorCollapse).toHaveClass("show");
    // Bookmarks should now be collapsed
    expect(bookmarksCollapse).not.toHaveClass("show");
  });
});
