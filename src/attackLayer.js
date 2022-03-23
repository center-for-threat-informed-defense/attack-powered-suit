/**
 * Build an attack layer using the template below and the specified parameters.
 *
 * @param {string} attackDomain - The ATT&CK domain
 * @param {string} layerTitle - The name to assign to the layer
 * @param {string} defaultColor - The default color for techniques that don't have one
 * @param {Array} techniques - Array of techniques to
 */
export function buildAttackLayer(attackDomain, layerTitle, defaultColor,
    techniques) {
    const layer = Object.assign({}, layerTemplate);
    layer.name = layerTitle;
    layer.domain = attackDomain;

    for (let technique of techniques) {
        layer.techniques.push({
            techniqueID: technique.id,
            score: technique.score,
            color: technique.color || defaultColor,
            comment: technique.notes,
            enabled: true,
            metadata: [],
            links: [],
            showSubtechniques: true
        });
    }

    return layer;
}

const layerTemplate = {
    name: null, // This is filled in by buildLayer().
    versions: {
        attack: "10",
        navigator: "4.5.5",
        layer: "4.3",
    },
    domain: null, // This is filled in by buildLayer().
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
    techniques: [
        // This is filled in by buildLayer().
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
};
