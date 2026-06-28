import { useNavigate } from 'react-router-dom'
import { useRecommendationPreviews, useRecommendationAvailability } from '../hooks'
import type { RecommendationAvailability } from '../types'

export default function RecommendationPreviewSection() {
  const navigate = useNavigate()
  const content = useRecommendationPreviews()
  const availability = useRecommendationAvailability()

  if (content.isPending) {
    return (
      <section className="recommendation-preview-section" aria-label="AI recommendation preview">
        <p className="status-message" role="status">
          Loading recommendations…
        </p>
      </section>
    )
  }

  if (content.isError) {
    return (
      <section className="recommendation-preview-section" aria-label="AI recommendation preview">
        <p className="status-message danger" role="alert">
          We couldn't load recommendations. Check your connection and try again.
        </p>
      </section>
    )
  }

  if (content.data.length === 0) {
    return (
      <section className="recommendation-preview-section" aria-label="AI recommendation preview">
        <p className="status-message">
          No recommendations yet — they appear once the AI has analysed your inventory.
        </p>
      </section>
    )
  }

  const availabilityById = new Map<string, RecommendationAvailability>(
    (availability.data ?? []).map((a) => [a.id, a]),
  )

  return (
    <section className="recommendation-preview-section" aria-label="AI recommendation preview">
      <h2>AI Recommendations</h2>
      <div className="recommendation-grid">
        {content.data.slice(0, 3).map((rec) => {
          const avail = availabilityById.get(rec.id)
          return (
            <article key={rec.id} className="recommendation-card">
              <h3>{rec.name}</h3>
              <p>{rec.summary}</p>
              {avail != null && (
                <div className="availability-badge">
                  <span className={avail.isAvailable ? 'success' : 'warning'}>
                    {avail.isAvailable ? 'Available' : 'Not available'}
                  </span>
                  {!avail.isAvailable && avail.limitingIngredient != null && (
                    <span className="limiting-ingredient">{avail.limitingIngredient}</span>
                  )}
                </div>
              )}
              <button type="button" onClick={() => navigate('/menu')}>
                Go to Menu Builder
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
