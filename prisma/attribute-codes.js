// Codes stables des attributs (Attributes.code). Les règles du configurateur de la boutique et les filtres attr[code]
// de l'API s'y réfèrent, jamais aux libellés, que le back-office peut modifier. Partagé par le seed et par
// scripts/add-attribute-codes.mjs, qui attribue ces codes aux attributs existants.

// Attributs des règles de compatibilité : leur code est fixé par la conception du configurateur
const EXPLICIT_CODES = {
    'Socket': 'socket',
    'Type DDR': 'ddr_type',
    'Format|cartes-meres': 'form_factor',
    'Format|boitiers': 'form_factor',
    'Format|alimentations': 'psu_form_factor',
    'TDP (W)': 'tdp',
    'Puissance (W)': 'psu_power',
    'Slots mémoire': 'memory_slots',
    'Graphiques intégrés': 'integrated_graphics',
};

// Libellés portés par plusieurs attributs distincts : le code reprend la catégorie pour rester unique
const LABELS_SHARED_BY_SEVERAL_ATTRIBUTES = new Set(['Capacité (GB)', 'Interface', 'RGB']);

function toCode(text) {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/œ/g, 'oe')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

/**
 * @param {string} name libellé de l'attribut
 * @param {string} categorySlug slug de sa catégorie (la première, pour un attribut partagé)
 * @returns {string}
 */
function attributeCode(name, categorySlug) {
    const explicit = EXPLICIT_CODES[`${name}|${categorySlug}`] ?? EXPLICIT_CODES[name];
    if (explicit) return explicit;

    const code = toCode(name);
    return LABELS_SHARED_BY_SEVERAL_ATTRIBUTES.has(name) ? `${code}_${toCode(categorySlug)}` : code;
}

module.exports = {attributeCode};
