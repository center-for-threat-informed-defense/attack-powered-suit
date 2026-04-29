import { render, screen, fireEvent } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("../src/Clipboard.js", () => ({ supportsClipboardItem: () => false }));

// Mock formats module with a writable store we can manipulate in tests
jest.mock("../src/formats.js", () => {
  const { writable } = require("svelte/store");
  // Start with a single format row by default; tests may override via set()
  const initial = [{ id: 1, name: "Name", rule: "{fullName}", mime: "text/plain" }];
  const formatsStore = writable(initial);
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

describe("SettingsPanel.svelte interactions (clipboard unsupported path)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to a single known row before each test
    const mocked = require("../src/formats.js");
    mocked.formatsStore.set([{ id: 1, name: "Name", rule: "{fullName}", mime: "text/plain" }]);
  });

  test("shows empty state when no formats present", () => {
    const mocked = require("../src/formats.js");
    mocked.formatsStore.set([]);

    render(SettingsPanel);

    expect(screen.getByText("No formats found.")).toBeInTheDocument();
  });

  test("typing into Name and Format invokes save and updates values", async () => {
    const mocked = require("../src/formats.js");
    render(SettingsPanel);

    const nameInput = screen.getByDisplayValue("Name");
    await fireEvent.input(nameInput, { target: { value: "New Name" } });
    expect(mocked.saveFormats).toHaveBeenCalled();

    const ruleInput = screen.getByDisplayValue("{fullName}");
    await fireEvent.input(ruleInput, { target: { value: "{name}" } });
    expect(mocked.saveFormats).toHaveBeenCalledTimes(2);
  });

  test("remove button triggers removeFormat with correct id", async () => {
    const mocked = require("../src/formats.js");
    render(SettingsPanel);

    const removeBtn = screen.getByTitle("Remove this format");
    await fireEvent.click(removeBtn);
    expect(mocked.removeFormat).toHaveBeenCalledWith(1);
  });

  test("Back button dispatches showSearch from component", async () => {
    const { component } = render(SettingsPanel);
    const handler = jest.fn();
    component.$on("showSearch", handler);

    const back = screen.getByText("Back");
    await fireEvent.click(back);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("MIME input is readonly when clipboard unsupported", () => {
    render(SettingsPanel);
    const mimeInput = screen.getByDisplayValue("text/plain");
    expect(mimeInput).toHaveAttribute("readonly");
    expect(mimeInput).toHaveAttribute("title", "MIME type is not supported in Firefox.");
  });
});
