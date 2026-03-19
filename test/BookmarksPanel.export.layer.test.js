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

// Mock lookupAttack for domain flags and related techniques
jest.mock("../src/search", () => {
  return {
    lookupAttack: jest.fn((stixId) => {
      const map = {
        tech1: {
          attackId: "T1001",
          type: "technique",
          description: "Technique one",
          url: "https://attack.mitre.org/techniques/T1001/",
          is_enterprise: true,
          is_mobile: false,
          is_ics: false,
        },
        sw1: {
          attackId: "S0001",
          type: "software",
          description: "Software one",
          url: "https://attack.mitre.org/software/S0001/",
          is_enterprise: true,
          is_mobile: false,
          is_ics: false,
          relatedTechniques: ["T2002", "T2003"],
        },
        mobileTech: {
          attackId: "T3001",
          type: "technique",
          description: "Mobile technique",
          url: "https://attack.mitre.org/techniques/T3001/",
          is_enterprise: false,
          is_mobile: true,
          is_ics: false,
        },
      };
      return map[stixId];
    }),
  };
});

// Spy on buildAttackLayer to capture inputs and return a sentinel object
const sentinelLayer = { test: "layer" };
jest.mock("../src/attack.js", () => ({
  buildAttackLayer: jest.fn(() => sentinelLayer),
}));

import BookmarksPanel from "../src/BookmarksPanel.svelte";
import { bookmarksStore, bookmarksColorByStore } from "../src/bookmarks";
import { buildAttackLayer } from "../src/attack.js";

describe("BookmarksPanel.svelte export ATT&CK Navigator Layer", () => {
  let createObjectURLSpy, revokeSpy, createdUrls, createdAnchors, createElementSpy, originalCreate, originalRevoke, originalCreateElement;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    createdUrls = [];
    createdAnchors = [];

    // Seed bookmarks: a technique, a non-tech with related techniques, and a mobile-only technique (should be filtered for enterprise)
    bookmarksStore.set([
      { stixId: "tech1", attackId: "T1001", name: "Technique One", score: 10, notes: "n1", color: "#123456" },
      { stixId: "sw1", attackId: "S0001", name: "Software One", score: 20, notes: "n2", color: "#654321" },
      { stixId: "mobileTech", attackId: "T3001", name: "Mobile Only", score: 30, notes: "n3", color: "#ff0000" },
    ]);
    bookmarksColorByStore.set("Color");

    // Stub URL and anchor creation
    global.URL = global.URL || {};
    originalCreate = global.URL.createObjectURL;
    originalRevoke = global.URL.revokeObjectURL;
    createObjectURLSpy = jest.fn((blob) => {
      createdUrls.push({ blob });
      return "blob:layer";
    });
    revokeSpy = jest.fn(() => {});
    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeSpy;

    originalCreateElement = document.createElement;
    createElementSpy = jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        const anchor = originalCreateElement.call(document, "a");
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

  test("builds layer with enterprise domain, title, techniques and downloads JSON (Color mode)", async () => {
    render(BookmarksPanel);

    // Set domain and title
    const domainSelect = screen.getByLabelText(/ATT&CK Domain/i);
    await fireEvent.change(domainSelect, { target: { value: "enterprise-attack" } });

    const titleInput = screen.getByLabelText(/Layer Title/i);
    await fireEvent.input(titleInput, { target: { value: "My Layer" } });

    const btn = screen.getByText(/Export Navigator Layer/i);
    await fireEvent.click(btn);

    expect(buildAttackLayer).toHaveBeenCalledTimes(1);
    const [domain, title, techniques, colorFlag] = buildAttackLayer.mock.calls[0];

    expect(domain).toBe("enterprise-attack");
    expect(title).toBe("My Layer");
    expect(colorFlag).toBe(true);

    // Technique mapping should include the technique bookmark and expanded related techniques from software
    expect(techniques.length).toBe(3);
    expect(techniques).toEqual([
      expect.objectContaining({ attackId: "T1001", color: "#123456", score: 10, notes: "n1" }),
      expect.objectContaining({ attackId: "T2002", color: "#654321", score: 20, notes: expect.stringContaining("Related to bookmark: S0001") }),
      expect.objectContaining({ attackId: "T2003", color: "#654321", score: 20, notes: expect.stringContaining("Related to bookmark: S0001") }),
    ]);

    // One blob created with JSON string of the sentinel layer
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createdUrls[0].blob;
    const json = await readBlobText(blob);
    expect(json).toBe(JSON.stringify(sentinelLayer));

    // Revoke
    jest.advanceTimersByTime(110);
    expect(revokeSpy).toHaveBeenCalledWith("blob:layer");
  });

  test("colorFlag false in Score mode and mobile technique filtered out for enterprise domain", async () => {
    bookmarksColorByStore.set("Score");
    render(BookmarksPanel);

    // Ensure domain enterprise
    const domainSelect = screen.getByLabelText(/ATT&CK Domain/i);
    await fireEvent.change(domainSelect, { target: { value: "enterprise-attack" } });

    const btn = screen.getByText(/Export Navigator Layer/i);
    await fireEvent.click(btn);

    const [domain, title, techniques, colorFlag] = buildAttackLayer.mock.calls[0];
    expect(colorFlag).toBe(false);

    // No mobile-only technique should be included (we already have 3 from first test setup, but in this call rebuild counts anew)
    // For this test, techniques should still be 3: T1001 and two related from software
    expect(techniques.map(t => t.attackId).sort()).toEqual(["T1001", "T2002", "T2003"].sort());
  });
});
