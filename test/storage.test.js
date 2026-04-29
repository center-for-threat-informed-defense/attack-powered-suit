import { saveToStorage, loadFromStorage } from "../src/storage.js";

// Helpers to control timers and microtasks in async debounce flows
async function flushTimersAndMicrotasks(ms = 0) {
  if (ms > 0) {
    jest.advanceTimersByTime(ms);
  }
  // Execute all scheduled timers to ensure debounced callbacks run
  jest.runAllTimers();
  // Allow any awaited promises inside debounced callbacks to resolve
  await Promise.resolve();
}

describe("storage.js", () => {
  afterEach(() => {
    jest.useRealTimers();
    // Cleanup globals
    delete global.chrome;
    if (typeof window !== "undefined" && window.localStorage && window.localStorage.__isMock) {
      delete window.localStorage;
    }
    jest.restoreAllMocks();
  });

  test("saveToStorage debounces and uses chrome.storage backend", async () => {
    jest.useFakeTimers();

    global.chrome = {
      storage: {
        sync: {
          set: jest.fn(() => Promise.resolve()),
          get: jest.fn(),
        },
      },
    };

    // Rapid calls should collapse into one write with the latest value
    saveToStorage("keyA", { v: 1 }, 100);
    saveToStorage("keyA", { v: 2 }, 100);

    // Before debounce time, nothing written
    expect(global.chrome.storage.sync.set).toHaveBeenCalledTimes(0);

    await flushTimersAndMicrotasks(100);

    expect(global.chrome.storage.sync.set).toHaveBeenCalledTimes(1);
    expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ keyA: { v: 2 } });

    // Subsequent call after previous debounce elapsed should schedule a new write
    saveToStorage("keyA", { v: 3 }, 100);
    await flushTimersAndMicrotasks(100);
    expect(global.chrome.storage.sync.set).toHaveBeenCalledTimes(2);
    expect(global.chrome.storage.sync.set).toHaveBeenLastCalledWith({ keyA: { v: 3 } });
  });

  test("saveToStorage falls back to localStorage and JSON-serializes", async () => {
    jest.useFakeTimers();

    // Ensure chrome path is not taken
    delete global.chrome;
    // Also clear any lingering window.chrome set by other tests
    if (typeof window !== "undefined") {
      try { delete window.chrome; } catch (e) { /* ignore */ }
      // Force undefined to avoid truthy checks
      window.chrome = undefined;
    }

    const setItem = jest.fn();
    const getItem = jest.fn();
    // Override window.localStorage to ensure the code path uses it
    Object.defineProperty(window, 'localStorage', {
      value: { setItem, getItem, __isMock: true },
      configurable: true,
      writable: true,
    });

    const value = { a: 1, b: "c" };
    saveToStorage("prefs", value, 50);

    await flushTimersAndMicrotasks(50);

    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith("prefs", JSON.stringify(value));
  });

  test("loadFromStorage reads from chrome.storage backend", async () => {
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(() => Promise.resolve({ filters: { includeTechniques: false } })),
        },
      },
    };

    const result = await loadFromStorage("filters");
    expect(global.chrome.storage.sync.get).toHaveBeenCalledWith({ filters: null });
    expect(result).toEqual({ includeTechniques: false });
  });

  test("loadFromStorage reads and parses JSON from localStorage", async () => {
    delete global.chrome;
    if (typeof window !== "undefined") {
      try { delete window.chrome; } catch (e) { /* ignore */ }
      window.chrome = undefined;
    }

    const stored = { hello: "world", n: 3 };
    const getItem = jest.fn(() => JSON.stringify(stored));
    Object.defineProperty(window, 'localStorage', {
      value: { getItem, __isMock: true },
      configurable: true,
      writable: true,
    });

    const result = await loadFromStorage("sample");
    expect(getItem).toHaveBeenCalledWith("sample");
    expect(result).toEqual(stored);
  });

  test("loadFromStorage handles malformed JSON with warning and returns null", async () => {
    delete global.chrome;
    if (typeof window !== "undefined") {
      try { delete window.chrome; } catch (e) { /* ignore */ }
      window.chrome = undefined;
    }

    const getItem = jest.fn(() => "{ not valid json");
    Object.defineProperty(window, 'localStorage', {
      value: { getItem, __isMock: true },
      configurable: true,
      writable: true,
    });

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await loadFromStorage("bad");
    expect(result).toBeNull();
    expect(logSpy).toHaveBeenCalled();
  });
});
