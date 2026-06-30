import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

export type FadedColor = 'success' | 'info' | 'warning' | 'error' | 'default'

type FadedChipProps = {
  label: string
  color?: FadedColor
  // Fixed minimum width (px) so a column of chips reads as a uniform set.
  minWidth?: number
}

// A status/severity chip with a faded (translucent tinted) fill rather than a
// solid or transparent one — softer than the default filled Chip, still legible
// (text uses the strong end of the palette, not color alone).
function FadedChip({ label, color = 'default', minWidth }: FadedChipProps) {
  return (
    <Chip
      label={label}
      size="small"
      sx={(theme) => {
        const base =
          color === 'default'
            ? { fill: theme.palette.grey[500], text: theme.palette.text.secondary }
            : { fill: theme.palette[color].main, text: theme.palette[color].dark }
        return {
          bgcolor: alpha(base.fill, 0.16),
          color: base.text,
          fontWeight: 600,
          border: 'none',
          ...(minWidth ? { minWidth } : {}),
        }
      }}
    />
  )
}

export default FadedChip
