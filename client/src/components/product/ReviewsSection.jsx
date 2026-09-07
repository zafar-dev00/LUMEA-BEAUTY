import { reviews as allReviews } from "../../data/products";
import StarRating from "../ui/StarRating";

export default function ReviewsSection({ product }) {
  const productReviews = allReviews.filter((r) => r.product === product.name);

  return (
    <section className="mt-16 border-t border-charcoal/10 pt-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between mb-8">
        <h2 className="text-2xl text-charcoal">Customer Reviews</h2>
        <div className="flex items-center gap-3">
          <StarRating rating={product.rating} size={16} />
          <span className="text-sm text-charcoal-soft">
            {product.rating.toFixed(1)} out of 5
            {product.reviewCount ? ` · ${product.reviewCount} reviews` : ""}
          </span>
        </div>
      </div>

      {productReviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {productReviews.map((review) => (
            <div key={review.id} className="bg-cream p-6">
              <StarRating rating={review.rating} size={13} />
              <p className="mt-3 text-sm text-charcoal-soft leading-relaxed">
                "{review.text}"
              </p>
              <p className="mt-4 text-sm font-medium text-charcoal">
                {review.name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-charcoal-soft">
          Be the first to share your thoughts on this product.
        </p>
      )}
    </section>
  );
}
