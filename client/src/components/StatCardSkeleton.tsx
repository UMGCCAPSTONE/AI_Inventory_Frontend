import { Card, CardContent, Skeleton } from '@mui/material'

// Skeleton placeholder for StatCard. Mirrors the card's footprint
// (flex 1 1 160px, min 160) so the metrics row doesn't reflow when the
// real values arrive.
function StatCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ flex: '1 1 160px', minWidth: 160 }}>
      <CardContent>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="45%" height={40} />
      </CardContent>
    </Card>
  )
}

export default StatCardSkeleton
