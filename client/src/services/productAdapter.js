/**
 * The premium UI (ProductCard, QuickViewModal, Cart, Wishlist, Shop, Home
 * sections...) was built against a simple mock shape:
 *   { id, name, category, price, oldPrice, rating, image, badge, description, reviewCount }
 *
 * The real backend Product model (server/models/Product.js) has a richer,
 * differently-named shape (_id, thumbnail, originalPrice, shades: [String],
 * howToUse: String, ingredients: [String], ...). Rather than touch every
 * component that already works, we adapt at this single boundary so the
 * existing UI keeps working unmodified.
 */

function deriveBadge(doc) {
  if (doc.isNew) return "New";
  if (doc.isBestSeller) return "Bestseller";
  if (doc.discountPercentage > 0) return "Sale";
  return null;
}

/** Deterministic, pleasant-looking colour for a shade name that has no
 * explicit hex value in the backend (the Product model only stores shade
 * names as strings, e.g. "Ivory", "Beige"). */
function colorForShade(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 42%, 72%)`;
}

function toSteps(text) {
  if (!text) return [];
  const parts = text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [text];
}

/** Card/list shape — used by ProductCard, QuickViewModal, RelatedProducts, cart/wishlist entries. */
export function toCardProduct(doc) {
  if (!doc) return null;
  const oldPrice =
    doc.originalPrice && doc.originalPrice > doc.price ? doc.originalPrice : null;

  return {
    id: doc._id,
    name: doc.name,
    category: doc.category,
    price: doc.price,
    oldPrice,
    rating: doc.rating || 0,
    reviewCount: doc.reviewCount || 0,
    image: doc.thumbnail || doc.images?.[0] || "",
    badge: deriveBadge(doc),
    description: doc.shortDescription || doc.description || "",
    brand: doc.brand,
    stock: doc.stock,
  };
}

/** Full detail shape — used by the Product Details page. */
export function toDetailProduct(doc) {
  if (!doc) return null;
  const card = toCardProduct(doc);

  return {
    ...card,
    images: doc.images && doc.images.length > 0 ? doc.images : [doc.thumbnail].filter(Boolean),
    description: doc.description || doc.shortDescription || "",
    shades: (doc.shades || []).map((name) => ({ name, color: colorForShade(name) })),
    ingredients: (doc.ingredients || []).join(", "),
    benefits: doc.benefits || [],
    howToUse: toSteps(doc.howToUse),
    sku: doc.sku,
    tags: doc.tags || [],
    stock: doc.stock,
    slug: doc.slug,
  };
}

export function toCardProducts(docs = []) {
  return docs.map(toCardProduct);
}
