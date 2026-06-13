import { Box, CircularProgress, Typography } from '@mui/material'

type LoadingStateProps = {
  label?: string
}

function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
      <CircularProgress size={20} aria-hidden="true" />
      <Typography component="span">{label}</Typography>
    </Box>
  )
}

export default LoadingState
