import { Box, Paper, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type ReportCardProps = {
  title: string
  children: ReactNode
}

// Carded section wrapper for the Reports page. Gives each analytics block a
// contained, elevated surface so the page reads as a grid of panels rather than a
// stack of bare tables. Full height so cards in the same grid row line up.
function ReportCard({ title, children }: ReportCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Paper>
  )
}

export default ReportCard
