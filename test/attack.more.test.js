import { getAttackId, getAttackUrl, buildAttackLayer } from "../src/attack.js";

describe("attack.js (additional coverage)", () => {
  test("getAttackId handles lowercase prefixes and subtechniques", () => {
    expect(getAttackId("see t1548")).toBe("T1548");
    expect(getAttackId("lsass memory t1003.001 dump")).toBe("T1003.001");
    expect(getAttackId("group g0001 observed")).toBe("G0001");
  });

  test("getAttackId returns null when no id present", () => {
    expect(getAttackId("no ids here")).toBe(null);
  });

  test("getAttackUrl maps all known prefixes to correct base URLs", () => {
    expect(getAttackUrl("C1234")).toBe("https://attack.mitre.org/campaigns/C1234/");
    expect(getAttackUrl("DS1234")).toBe("https://attack.mitre.org/datasources/DS1234/");
    expect(getAttackUrl("G1234")).toBe("https://attack.mitre.org/groups/G1234/");
    expect(getAttackUrl("M1234")).toBe("https://attack.mitre.org/mitigations/M1234/");
    expect(getAttackUrl("S1234")).toBe("https://attack.mitre.org/software/S1234/");
    expect(getAttackUrl("T1548")).toBe("https://attack.mitre.org/techniques/T1548/");
    expect(getAttackUrl("T1003.001")).toBe("https://attack.mitre.org/techniques/T1003/001/");
    expect(getAttackUrl("TA0001")).toBe("https://attack.mitre.org/tactics/TA0001/");
    expect(getAttackUrl("DET0001")).toBe("https://attack.mitre.org/detectionstrategies/DET0001/");
    expect(getAttackUrl("DC0001")).toBe("https://attack.mitre.org/datacomponents/DC0001/");
  });

  test("getAttackUrl returns null when no ATT&CK id present", () => {
    expect(getAttackUrl("no ids here")).toBe(null);
  });

  test("buildAttackLayer uses empty color when colorFlag is false", () => {
    const techniques = [
      { attackId: "T1548", score: 5, color: "#abcdef", notes: "n1" },
      { attackId: "T1134", score: 3, color: null, notes: "n2" },
    ];
    const layer = buildAttackLayer("enterprise-attack", "x", techniques, false);
    expect(layer.techniques).toEqual([
      {
        techniqueID: "T1548",
        score: 5,
        color: "",
        comment: "n1",
        enabled: true,
        metadata: [],
        links: [],
        showSubtechniques: true,
      },
      {
        techniqueID: "T1134",
        score: 3,
        color: "",
        comment: "n2",
        enabled: true,
        metadata: [],
        links: [],
        showSubtechniques: true,
      },
    ]);
  });

  test("buildAttackLayer keeps provided color or defaults to #000000 when colorFlag is true", () => {
    const techniques = [
      { attackId: "T1548", score: 5, color: "#abcdef", notes: "n1" },
      { attackId: "T1134", score: 3, color: null, notes: "n2" },
    ];
    const layer = buildAttackLayer("enterprise-attack", "title", techniques, true);
    expect(layer.name).toBe("title");
    expect(layer.domain).toBe("enterprise-attack");
    expect(layer.techniques).toEqual([
      {
        techniqueID: "T1548",
        score: 5,
        color: "#abcdef",
        comment: "n1",
        enabled: true,
        metadata: [],
        links: [],
        showSubtechniques: true,
      },
      {
        techniqueID: "T1134",
        score: 3,
        color: "#000000",
        comment: "n2",
        enabled: true,
        metadata: [],
        links: [],
        showSubtechniques: true,
      },
    ]);
  });
});
