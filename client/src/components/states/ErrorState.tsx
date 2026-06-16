import { Alert, AlertTitle, Button } from '@mui/material'

type ErrorStateProps = {
  title?: string
  description: string
  onRetry?: () => void
}

function ErrorState({ title = 'Something went wrong', description, onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      role="alert"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {description}
    </Alert>
  )
}

export default ErrorState
