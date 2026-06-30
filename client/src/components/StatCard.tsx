import { Card, CardContent, Typography } from '@mui/material'

export type StatTone = 'default' | 'danger' | 'warning' | 'success'

// Maps a tone to the big-number colour. `danger` is the warm terracotta (the
// brand's alert colour in the mockups), not MUI's default red.
const toneColor: Record<StatTone, string> = {
  default: 'text.primary',
  danger: 'primary.main',
  warning: 'warning.main',
  success: 'success.main',
}

type StatCardProps = {
  label: string
  value: string
  tone?: StatTone
  helper?: string
}

// Reusable KPI card (T-7A), shared with the dashboard metric cards (T-6A).
// Presentational only — the value is server-computed. Styled to the redesign
// (docs/mockups/): warm paper surface, soft shadow, Fraunces display number.
function StatCard({ label, value, tone = 'default', helper }: StatCardProps) {
  return (
    <Card
      sx={{
        flex: '1 1 200px',
        minWidth: 180,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'var(--shadow)',
      }}
    >
      <CardContent sx={{ px: 3, py: 2.75, '&:last-child': { pb: 2.75 } }}>
        <Typography
          component="p"
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {label}
        </Typography>
        <Typography
          component="p"
          sx={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 42,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            mt: 1,
            mb: 0.25,
            color: toneColor[tone],
          }}
        >
          {value}
        </Typography>
        {helper ? (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{helper}</Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default StatCard
