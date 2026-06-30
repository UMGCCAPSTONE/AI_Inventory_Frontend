// Soft card tints — light terracotta, amber, and sage. Shared by the Menu
// Builder's AI recommendation cards and the dashboard saved-recs preview rows so
// the two surfaces use the same rotating palette. None matches the page/panel
// background. Index by position; wrap via modulo.
export const CARD_TINTS = ['#FBEEE6', '#FCF6E5', '#EDF1EA'] as const

// Extended palette — the three above plus light blue and light purple. For
// surfaces that want more variety per item, e.g. the dashboard specials-card
// headers. Same soft lightness so they read as a set.
export const CARD_TINTS_PLUS = [...CARD_TINTS, '#E3EAF0', '#EDE7F3']
