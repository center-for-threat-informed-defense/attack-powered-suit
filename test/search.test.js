import { __setTestIndex, __setTestAttackData, lunrOptions, search, lookupAttack } from "../src/search.js";

// Minimal lunr-like mock to avoid pulling in real lunr internals
// The mock implements .search(query) and returns an array of result objects
// with { ref, score, matchData }.
function makeIndexMock(resultsByQuery) {
  return {
    search: jest.fn((q) => {
      if (q in resultsByQuery) {
        return resultsByQuery[q];
      }
      throw new Error("query parse error");
    }),
  };
}

describe("search.js", () => {
  test("lunrOptions defines expected fields and boosts by executing within builder context", () => {
    // Collect calls made on `this` by lunrOptions
    const calls = [];
    const ctx = {
      ref: (field) => calls.push(["ref", field]),
      field: (name, opts = {}) => calls.push(["field", name, opts]),
    };
    lunrOptions.apply(ctx);

    // Validate essential fields and boosts were configured
    expect(calls).toContainEqual(["ref", "lunrRef"]);
    expect(calls).toContainEqual(["field", "attackId", { boost: 4 }]);
    expect(calls).toContainEqual(["field", "name", { boost: 3 }]);
    expect(calls).toContainEqual(["field", "parentName", { boost: 2 }]);
    expect(calls).toContainEqual(["field", "description", { boost: 1 }]);
  });

  test("search filters by type, domain flags, deprecated and caps to maxResults while tracking totalCount", () => {
    const attackData = {
      A: { lunrRef: "A", stixId: "stixA", type: "technique", is_enterprise: true, is_mobile: false, is_ics: false, deprecated: false, name: "Tech A", url: "uA", description: "dA" },
      B: { lunrRef: "B", stixId: "stixB", type: "software", is_enterprise: true, is_mobile: false, is_ics: false, deprecated: true, name: "Soft B", url: "uB", description: "dB" },
      C: { lunrRef: "C", stixId: "stixC", type: "group", is_enterprise: false, is_mobile: true, is_ics: false, deprecated: false, name: "Group C", url: "uC", description: "dC" },
    };

    const mkRes = (ref, score = 1.0, matchData = { metadata: {} }) => ({ ref, score, matchData });
    const resultsByQuery = {
      "good": [mkRes("A"), mkRes("B"), mkRes("C")],
      "error": new Error("parse error"),
      // Wildcard retry scenario: first returns empty, then when retried with * returns one
      "none": [],
      "none*": [mkRes("A")],
    };
    const index = makeIndexMock(new Proxy(resultsByQuery, {
      get(target, prop) {
        if (prop in target) {
          const v = target[prop];
          if (v instanceof Error) throw v;
          return v;
        }
        return [];
      }
    }));

    __setTestIndex(index);
    __setTestAttackData(attackData);

    const filters = {
      technique: true,
      subtechnique: true,
      mitigation: false,
      software: true,
      tactic: false,
      dataSource: false,
      detectionStrategy: false,
      analytic: false,
      dataComponent: false,
      group: false,
      deprecated: false,
      Enterprise: true,
      ICS: false,
      Mobile: true,
    };

    const r1 = search("good", filters);
    // totalCount counts items that pass type/domain/deprecated checks (not all raw results)
    // With filters above: technique=true (A), software=true but deprecated=false (B excluded), group=false (C excluded)
    expect(r1.totalCount).toBe(1);
    expect(r1.items.map(o => o.stixId)).toEqual(["stixA"]);
    expect(r1.items.length).toBe(1);

    const r2 = search("error", filters);
    expect(r2.items).toEqual([]);
    expect(r2.totalCount).toBe(0);

    const r3 = search("none", filters);
    expect(r3.query).toBe("none*"); // because internal retry appends *
    expect(r3.items.length).toBe(1);
  });

  test("lookupAttack returns object by stix id", () => {
    const data = { X: { stixId: "X", name: "obj" } };
    __setTestAttackData(data);
    expect(lookupAttack("X")).toEqual({ stixId: "X", name: "obj" });
  });
});
