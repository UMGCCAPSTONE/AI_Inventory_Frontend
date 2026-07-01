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
    <Paper variant="outlined" sx={{ p: 3, boxShadow: 'var(--shadow)' }}>
      <Typography
        component="h2"
        sx={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, mb: 2.25 }}
      >
        {title}
      </Typography>
      <Box>{children}</Box>
    </Paper>
  )
}

export default ReportCard
