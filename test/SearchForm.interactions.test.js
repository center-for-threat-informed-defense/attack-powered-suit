import { render, screen, fireEvent } from "@testing-library/svelte";

// Mock search module used by SearchForm
jest.mock("../src/search.js", () => ({
  initializeSearch: jest.fn(() => Promise.resolve()),
  search: jest.fn(() => ({ query: "abc", items: [{ attackId: "T0001" }], totalCount: 1 })),
}));

// Mock filters store used by SearchForm
jest.mock("../src/filters.js", () => {
  const { writable } = require("svelte/store");
  const initial = {
    includeTechniques: true,
    includeSubtechniques: true,
    includeMitigations: true,
    includeSoftware: true,
    includeTactics: true,
    includeDataSources: true,
    includeGroups: true,
    includeCampaigns: true,
    includeDetectionStrategies: true,
    includeAnalytics: true,
    includeDataComponents: true,
    includeEnterprise: true,
    includeIcs: true,
    includeMobile: true,
    includeDeprecated: false,
  };
  const filters = writable(initial);
  return { filters };
});

import { get } from "svelte/store";
import { filters } from "../src/filters.js";
import SearchForm from "../src/SearchForm.svelte";

function click(el) {
  // Avoid JSDOM navigation side-effects for <a href="#">
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

describe("SearchForm.svelte interactions", () => {
  test("notice hides after typing 3+ chars and search runs", async () => {
    render(SearchForm, { props: { results: null } });

    // Initially, the notice should be present
    expect(screen.getByText(/ATT&CK Powered Suit uses MITRE ATT&CK/)).toBeInTheDocument();

    const input = screen.getByLabelText("Search ATT&CK…");
    // Type <3 chars -> still notice
    await fireEvent.input(input, { target: { value: "ab" } });
    expect(screen.getByText(/ATT&CK Powered Suit uses MITRE ATT&CK/)).toBeInTheDocument();

    // Type 3 chars -> results should no longer be null and notice should be gone
    await fireEvent.input(input, { target: { value: "abc" } });
    expect(screen.queryByText(/ATT&CK Powered Suit uses MITRE ATT&CK/)).toBeNull();
  });

  test("Select all and none bulk toggle filters (deprecated unchanged)", async () => {
    render(SearchForm, { props: { results: null } });

    // Click "none"
    const noneLink = screen.getByText("none");
    click(noneLink);

    let current = get(filters);
    // includeDeprecated should remain unchanged (default false), others go false
    const keys = Object.keys(current);
    for (const k of keys) {
      if (k === "includeDeprecated") {
        expect(current[k]).toBe(false);
      } else {
        expect(current[k]).toBe(false);
      }
    }

    // Click "Select all"
    const allLink = screen.getByText("Select all");
    click(allLink);

    current = get(filters);
    for (const k of Object.keys(current)) {
      if (k === "includeDeprecated") {
        expect(current[k]).toBe(false);
      } else {
        expect(current[k]).toBe(true);
      }
    }
  });
});
