import { render, screen, fireEvent } from "@testing-library/svelte";

jest.mock("../src/Clipboard.js", () => ({ supportsClipboardItem: () => true }));

// Mock formats with writable store and an addFormat impl we can observe and update state
jest.mock("../src/formats.js", () => {
  const { writable } = require("svelte/store");
  const formatsStore = writable([
    { id: 1, name: "Name", rule: "{fullName}", mime: "text/plain" },
  ]);
  const removeFormat = jest.fn();
  const saveFormats = jest.fn();
  const addFormat = jest.fn();
  return {
    formatsStore,
    removeFormat,
    saveFormats,
    addFormat,
  };
});

import SettingsPanel from "../src/SettingsPanel.svelte";

describe("SettingsPanel.svelte clipboard supported path", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mocked = require("../src/formats.js");
    mocked.formatsStore.set([
      { id: 1, name: "Name", rule: "{fullName}", mime: "text/plain" },
    ]);
  });

  test("MIME input is editable when clipboard is supported", () => {
    render(SettingsPanel);
    const mimeInput = screen.getByDisplayValue("text/plain");
    expect(mimeInput).not.toHaveAttribute("readonly");
  });

  test("Add New Format triggers addFormat and a new row appears with defaults", async () => {
    const mocked = require("../src/formats.js");
    render(SettingsPanel);

    // Make addFormat update the store with the expected default row
    mocked.addFormat.mockImplementation(() => {
      mocked.formatsStore.update((arr) => arr.concat({ id: 2, name: "new format", rule: "", mime: "text/plain" }));
    });

    const addBtn = screen.getByText(/Add New Format/i);
    await fireEvent.click(addBtn);

    expect(mocked.addFormat).toHaveBeenCalledWith("new format", "", "text/plain");
    // New row should be visible with default values
    expect(screen.getByDisplayValue("new format")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("text/plain").length).toBeGreaterThan(0);
  });

  test("Back button dispatches showSearch", async () => {
    const { component } = render(SettingsPanel);
    const handler = jest.fn();
    component.$on("showSearch", handler);

    const back = screen.getByText("Back");
    await fireEvent.click(back);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
