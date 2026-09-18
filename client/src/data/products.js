// All product and category mock data has been replaced by live API calls —
// see src/services/productService.js and src/services/categoryService.js,
// used by Shop, ProductDetails, and Home.
//
// These testimonial-style reviews are the one thing still hardcoded here:
// the backend has no reviews endpoint yet (Product only stores aggregate
// rating/reviewCount, not individual reviews — see services/reviewService.js
// for details), so CustomerReviews (Home) and ReviewsSection (Product
// Details) keep reading from this small local dataset until that backend
// work exists.
export const reviews = [
  {
    id: "r1",
    name: "Amelia R.",
    rating: 5,
    text:
      "The Radiance Vitamin C Serum completely transformed my skin tone within three weeks. Lightweight, elegant packaging, and it truly glows.",
    product: "Radiance Vitamin C Serum",
  },
  {
    id: "r2",
    name: "Sophia L.",
    rating: 5,
    text:
      "LUMÉA's lipstick shades are unmatched — the Velvet Rose feels weightless and lasts through dinner without drying my lips.",
    product: "Velvet Rose Matte Lipstick",
  },
  {
    id: "r3",
    name: "Isabelle M.",
    rating: 4,
    text:
      "Beautiful, minimal branding and the fragrance line smells expensive without being overpowering. My new signature scent.",
    product: "Blush Petal Eau de Parfum",
  },
];
