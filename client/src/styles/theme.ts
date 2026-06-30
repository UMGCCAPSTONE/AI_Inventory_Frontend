import { createTheme } from '@mui/material/styles'

// Mirrors the design tokens in src/index.css (:root custom properties), which are
// the single source of truth for the warm-paper palette (mockups in
// docs/mockups/). Keep these in sync if the tokens there change.
const DISPLAY = "'Fraunces', Georgia, 'Times New Roman', serif"
const BODY =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const theme = createTheme({
  palette: {
    primary: { main: '#a8392a' }, // --terra
    secondary: { main: '#5e6e45' }, // --sage
    background: {
      default: '#f1ede3', // --bg
      paper: '#fbf9f2', // --surface
    },
    text: {
      primary: '#1f1b16', // --ink
      secondary: '#5c544a', // --ink-soft
    },
    success: { main: '#5e6e45' }, // --sage
    warning: { main: '#b5832a' }, // --amber
    info: { main: '#3f6184' }, // --blue
    divider: 'rgba(31, 27, 22, 0.1)', // --hairline
  },
  shape: { borderRadius: 14 }, // --radius
  typography: {
    fontFamily: BODY,
    // Fraunces serif on the display scale (page titles, stat numbers, panel
    // heads). Smaller headings (h5/h6 — section labels, card titles) stay Inter.
    h1: { fontFamily: DISPLAY, fontWeight: 500, letterSpacing: '-0.02em' },
    h2: { fontFamily: DISPLAY, fontWeight: 500, letterSpacing: '-0.02em' },
    h3: { fontFamily: DISPLAY, fontWeight: 500, letterSpacing: '-0.01em' },
    h4: { fontFamily: DISPLAY, fontWeight: 600, letterSpacing: '-0.01em' },
  },
})
