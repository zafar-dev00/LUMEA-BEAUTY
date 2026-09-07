/**
 * Backend status: no wishlist routes exist yet (no /api/wishlist anywhere
 * in server/routes). WishlistContext therefore continues to store the
 * wishlist in localStorage for everyone — that behaviour is intentionally
 * untouched in this phase.
 *
 * Missing backend endpoints this depends on (none of these exist today):
 *   GET    /api/wishlist         — fetch the authenticated user's wishlist
 *   POST   /api/wishlist/items   — add an item
 *   DELETE /api/wishlist/items/:id — remove an item
 *
 * Deliberately not implemented — do not call these, they will 404.
 */
export const wishlistService = {
  isBackendAvailable: false,
};
