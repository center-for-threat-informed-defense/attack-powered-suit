import { render, screen, fireEvent } from "@testing-library/svelte";

jest.mock("../src/Clipboard.js", () => ({ supportsClipboardItem: () => false }));

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


describe("SettingsPanel.svelte basic rendering and actions", () => {
  test("renders initial format and triggers remove", async () => {
    render(SettingsPanel);

    // Ensure the format row inputs are present with expected values
    const nameInput = screen.getByDisplayValue("Name");
    expect(nameInput).toBeInTheDocument();

    const ruleInput = screen.getByDisplayValue("{fullName}");
    expect(ruleInput).toBeInTheDocument();

    const mimeInput = screen.getByDisplayValue("text/plain");
    expect(mimeInput).toBeInTheDocument();

    // Click the trash icon by its title
    const removeBtn = screen.getByTitle("Remove this format");
    await fireEvent.click(removeBtn);
    const mockedFormats = require("../src/formats.js");
    expect(mockedFormats.removeFormat).toHaveBeenCalledWith(1);
  });
});
