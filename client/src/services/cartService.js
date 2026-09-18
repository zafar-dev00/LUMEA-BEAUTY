/**
 * Backend status: no cart routes exist yet (no /api/cart anywhere in
 * server/routes). CartContext therefore continues to store the cart in
 * localStorage for everyone, guest or logged in — that behaviour is
 * intentionally untouched in this phase.
 *
 * This file exists so the *shape* of server-side cart persistence is ready
 * to drop in later: once endpoints exist, implement the methods below and
 * call them from CartContext (e.g. fetch the server cart on login, push
 * mutations on addToCart/removeFromCart/etc for authenticated users).
 *
 * Missing backend endpoints this depends on (none of these exist today):
 *   GET    /api/cart            — fetch the authenticated user's cart
 *   POST   /api/cart/items      — add/update a line item
 *   DELETE /api/cart/items/:id  — remove a line item
 *   POST   /api/cart/merge      — merge a guest cart into the user's cart on login
 *
 * Deliberately not implemented — do not call these, they will 404.
 */
export const cartService = {
  isBackendAvailable: false,
};
