import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
      {action ? <Box sx={{ mt: 2 }}>{action}</Box> : null}
    </Box>
  )
}

export default EmptyState
