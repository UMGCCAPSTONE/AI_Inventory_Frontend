import { createTheme } from '@mui/material/styles'

// Mirrors the brand palette in src/index.css (:root custom properties).
// Keep these hex values in sync if the brand colors change there.
export const theme = createTheme({
  palette: {
    primary: { main: '#c9412d' }, // --tomato
    background: { default: '#f7f1e8' }, // --surface
    text: {
      primary: '#19130f', // --ink
      secondary: '#8a7766', // --muted
    },
    success: { main: '#5c9a32' }, // --green
    warning: { main: '#d48918' }, // --gold
  },
  typography: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
})
