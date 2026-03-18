import { filters, initializeFilters } from "../src/filters.js";

// Utilities for working with the Svelte store in tests
function getStoreOnce(store) {
  return new Promise((resolve) => {
    const unsub = store.subscribe((v) => {
      resolve(v);
      // Unsubscribe on next tick to avoid calling before subscribe returns
      setTimeout(() => unsub(), 0);
    });
  });
}

async function flushTimersAndTicks(ms = 0) {
  if (ms > 0) {
    jest.advanceTimersByTime(ms);
  } else {
    jest.runOnlyPendingTimers();
  }
  await Promise.resolve();
}

describe("filters.js", () => {
  afterEach(() => {
    jest.useRealTimers();
    delete global.chrome;
    if (global.localStorage && global.localStorage.__isMock) {
      delete global.localStorage;
    }
  });

  test("initializeFilters merges stored subset and ignores unknown keys", async () => {
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(() =>
            Promise.resolve({
              filters: {
                includeTechniques: false,
                includeMobile: false,
                unknownKey: true,
              },
            })
          ),
          set: jest.fn(),
        },
      },
    };

    await initializeFilters();
    const current = await getStoreOnce(filters);

    expect(global.chrome.storage.sync.get).toHaveBeenCalledWith({ filters: null });
    // Overridden from defaults
    expect(current.includeTechniques).toBe(false);
    expect(current.includeMobile).toBe(false);
    // Default should exist (sanity check one or two defaults)
    expect(current.includeTactics).toBe(true);
    expect(current.includeDeprecated).toBe(false);
    // Unknown key must not be present
    expect(Object.prototype.hasOwnProperty.call(current, "unknownKey")).toBe(false);
  });

  test("store updates persist via saveToStorage debounce to chrome.storage", async () => {
    jest.useFakeTimers();

    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(() => Promise.resolve({ filters: null })),
          set: jest.fn(() => Promise.resolve()),
        },
      },
    };

    await initializeFilters();

    // Flip a value to trigger persistence through saveToStorage (500ms debounce)
    const newValPromise = new Promise((resolve) => {
      const unsub = filters.subscribe((v) => {
        if (v.includeDeprecated === true) {
          // Unsubscribe on next tick to avoid calling before subscribe returns
          setTimeout(() => unsub(), 0);
          resolve(v);
        }
      });
    });
    filters.update((v) => ({ ...v, includeDeprecated: true }));
    await newValPromise;

    // Debounce period must elapse before chrome.storage.write occurs
    expect(global.chrome.storage.sync.set).toHaveBeenCalledTimes(0);
    await flushTimersAndTicks(501);

    expect(global.chrome.storage.sync.set).toHaveBeenCalledTimes(1);
    const arg = global.chrome.storage.sync.set.mock.calls[0][0];
    expect(arg.filters.includeDeprecated).toBe(true);
  });
});
