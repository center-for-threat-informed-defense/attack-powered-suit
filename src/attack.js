const attackRegex = /(C|DS|G|M|S|T|TA)-?(\d{4})(\.\d{3})?/;

const attackUrls = {
    "C": "https://attack.mitre.org/campaigns/{id}/",
    "DS": "https://attack.mitre.org/datasources/{id}/",
    "G": "https://attack.mitre.org/groups/{id}/",
    "M": "https://attack.mitre.org/mitigations/{id}/",
    "S": "https://attack.mitre.org/software/{id}/",
    "T": "https://attack.mitre.org/techniques/{id}/",
    "TA": "https://attack.mitre.org/tactics/{id}/",
}

/**
 * Extract an ATT&CK object ID and it's type (i.e. prefix) from text.
 */
function getAttackTypeAndId(text) {
    const match = attackRegex.exec(text);
    let attackType, attackId = null;
    if (match !== null) {
        attackType = match[1].toUpperCase();
        attackId = `${attackType}${match[2]}`;
        if (match[3]) {
            const subId = match[3].substring(1);
            attackId = `${attackId}.${subId}`;
        }
    }
    return { attackType, attackId };
}

/**
 * Extract an ATT&CK object ID from text.
 */
export function getAttackId(text) {
    const { attackId } = getAttackTypeAndId(text);
    return attackId;
}

/**
 * Extract an ATT&CK object ID from text and convert to an ATT&CK URL.
 */
export function getAttackUrl(text) {
    var result = null;
    const { attackType, attackId } = getAttackTypeAndId(text);
    if (attackId !== null) {
        const attackPath = attackId.replace(".", "/");
        result = attackUrls[attackType].replace("{id}", attackPath);
    }
    return result;
}

/**
 * Build an attack layer using the template below and the specified parameters.
 *
 * @param {string} attackDomain - The ATT&CK domain
 * @param {string} layerTitle - The name to assign to the layer
 * @param {Array} techniques - Array of techniques to export
 * @param {bool} colorFlag - Toggle to color techniques by score or color selection
 */
export function buildAttackLayer(attackDomain, layerTitle, techniques,
    colorFlag) {
    const layer = Object.assign({}, newLayerTemplate());
    layer.name = layerTitle;
    layer.domain = attackDomain;
    let color = "";

    for (let technique of techniques) {
        if (colorFlag === false) {
            color = ""
        }
        else {
            color = technique.color || "#000000"
        }
        layer.techniques.push({
            techniqueID: technique.id,
            score: technique.score,
            color: color,
            comment: technique.notes,
            enabled: true,
            metadata: [],
            links: [],
            showSubtechniques: true
        });
    }

    return layer;
}

function newLayerTemplate() {
    return {
        name: null, // This is filled in by buildLayer().
        versions: {
            "attack": "12",
            "navigator": "4.8.0",
            "layer": "4.4"
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
}
