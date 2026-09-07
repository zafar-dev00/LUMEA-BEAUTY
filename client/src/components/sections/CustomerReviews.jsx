import { reviews } from "../../data/products";
import StarRating from "../ui/StarRating";
import { Quote } from "lucide-react";

export default function CustomerReviews() {
  return (
    <section className="bg-blush/40 py-16 lg:py-24">
      <div className="container-luxe">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-luxe text-rose mb-3">
            Loved By Many
          </p>
          <h2 className="text-3xl sm:text-4xl text-charcoal">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-ivory p-8 rounded-xl shadow-sm flex flex-col"
            >
              <Quote className="text-rose mb-4" size={26} />
              <StarRating rating={review.rating} />
              <p className="mt-4 text-charcoal-soft leading-relaxed text-sm flex-1">
                "{review.text}"
              </p>
              <div className="mt-6 border-t border-nude/40 pt-4">
                <p className="text-sm font-medium text-charcoal">
                  {review.name}
                </p>
                <p className="text-xs text-nude-dark uppercase tracking-luxe">
                  {review.product}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
