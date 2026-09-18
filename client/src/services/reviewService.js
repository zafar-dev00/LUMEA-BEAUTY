/**
 * Backend status: no review routes exist yet (no /api/reviews anywhere in
 * server/routes â€” Product only stores aggregate `rating` / `reviewCount`
 * fields, not individual reviews). ReviewsSection therefore continues to
 * read the small local `reviews` dataset in data/products.js for display
 * copy â€” that behaviour is intentionally untouched in this phase.
 *
 * Missing backend endpoints this depends on (none of these exist today):
 *   GET  /api/products/:id/reviews â€” list reviews for a product
 *   POST /api/products/:id/reviews â€” submit a review (authenticated)
 *
 * Deliberately not implemented â€” do not call these, they will 404.
 */
export const reviewService = {
  isBackendAvailable: false,
};

