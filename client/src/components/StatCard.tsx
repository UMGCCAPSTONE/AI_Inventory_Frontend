import { Card, CardContent, Typography } from '@mui/material'

export type StatTone = 'default' | 'danger' | 'warning' | 'success'

const toneColor: Record<StatTone, string> = {
  default: 'text.primary',
  danger: 'error.main',
  warning: 'warning.main',
  success: 'success.main',
}

type StatCardProps = {
  label: string
  value: string
  tone?: StatTone
  helper?: string
}

// Reusable KPI card (T-7A). Designed to be shared with the dashboard metric
// cards (T-6A). Presentational only — the value is server-computed.
function StatCard({ label, value, tone = 'default', helper }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ flex: '1 1 160px', minWidth: 160 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" component="p" sx={{ color: toneColor[tone], lineHeight: 1.2 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="body2" color="text.secondary">
            {helper}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default StatCard
