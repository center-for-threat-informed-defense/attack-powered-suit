import { buildAttackLayer, getAttackId, getAttackUrl } from "../src/attack.js";

describe("attack.js", () => {
    test("export ATT&CK navigator layer", () => {
        const layer = buildAttackLayer("enterprise-attack", "My Title", [
            { id: "T1548", score: 1.0, color: null, notes: "My notes part 1" },
            { id: "T1134", score: 2.0, color: "#445566", notes: "My notes part 2" },
        ], true);

        expect(layer).toEqual({
            name: "My Title", // From constructor
            versions: {
                "attack": "16",
                "navigator": "4.8.0",
                "layer": "4.4"
            },
            domain: "enterprise-attack", // From constructor
            description: "",
            filters: {
                platforms: [
                    "Linux",
                    "macOS",
                    "Windows",
                    "Azure AD",
                    "Office 365",
                    "SaaS",
                    "IaaS",
                    "Google Workspace",
                    "PRE",
                    "Network",
                    "Containers",
                ],
            },
            sorting: 0,
            layout: {
                layout: "side",
                aggregateFunction: "average",
                showID: false,
                showName: true,
                showAggregateScores: false,
                countUnscored: false,
            },
            hideDisabled: false,
            techniques: [ // From constructor
                {
                    techniqueID: "T1548",
                    score: 1.0,
                    color: "#000000",
                    comment: "My notes part 1",
                    enabled: true,
                    metadata: [],
                    links: [],
                    showSubtechniques: true
                },
                {
                    techniqueID: "T1134",
                    score: 2.0,
                    color: "#445566",
                    comment: "My notes part 2",
                    enabled: true,
                    metadata: [],
                    links: [],
                    showSubtechniques: true
                },
            ],
            gradient: {
                colors: ["#ff6666ff", "#ffe766ff", "#8ec843ff"],
                minValue: 0,
                maxValue: 100,
            },
            legendItems: [],
            metadata: [],
            links: [],
            showTacticRowBackground: false,
            tacticRowBackground: "#dddddd",
            selectTechniquesAcrossTactics: true,
            selectSubtechniquesWithParent: false,
        });
    });

    test("extract an ATT&CK ID from text", () => {
        expect(getAttackId("see the T1548 technique")).toBe("T1548");
        expect(getAttackId("lsass memory (T1003.001) dump")).toBe("T1003.001");
        expect(getAttackId("the attacker uses S0002 to dump")).toBe("S0002");
    });

    test("convert text to ATT&CK URL", () => {
        // Parse technique
        expect(getAttackUrl("T1548")).toBe("https://attack.mitre.org/techniques/T1548/");

        // Parse subtechnique
        expect(getAttackUrl("T1548.002")).toBe("https://attack.mitre.org/techniques/T1548/002/");

        // Parse technique surrounded by other text
        expect(getAttackUrl("foo T1548 bar")).toBe("https://attack.mitre.org/techniques/T1548/");

        // Parse subtechnique surrounded by other text
        expect(getAttackUrl("foo T1548.002 bar")).toBe("https://attack.mitre.org/techniques/T1548/002/");

        // If multiple techniques, return the first one
        expect(getAttackUrl("foo T1548 bar T1134 baz")).toBe("https://attack.mitre.org/techniques/T1548/");

        // If no techniques, return null;
        expect(getAttackUrl("foo bar baz")).toBe(null);
    });
});
