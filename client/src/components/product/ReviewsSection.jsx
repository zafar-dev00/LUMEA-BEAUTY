import { useState } from 'react';
import StarRating from '../ui/StarRating';
import { useAuth } from '../../context/AuthContext';

export default function ReviewsSection({ product, onReviewAdded }) {
  const auth = useAuth() || {};

  // Specifically targets 'lumea_token' from localStorage as verified in DevTools
  const getAuthToken = () => {
    return (
      localStorage.getItem('lumea_token') ||
      auth.token ||
      auth.user?.token ||
      localStorage.getItem('token') ||
      ''
    );
  };

  const token = getAuthToken();
  const isLoggedIn = Boolean(token || auth.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const reviewsList = product?.reviews || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', text: '' });

    const activeToken = getAuthToken();

    if (!activeToken) {
      setLoading(false);
      setFeedback({
        type: 'error',
        text: 'Session not found. Please log in again to post a review.',
      });
      return;
    }

    const targetProductId = product?._id || product?.id;
    if (!targetProductId) {
      setLoading(false);
      setFeedback({
        type: 'error',
        text: 'Product ID not found. Please refresh the page.',
      });
      return;
    }

    try {
      const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
      const baseApi = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

      const res = await fetch(`${baseApi}/products/${targetProductId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: Number(rating),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setFeedback({
        type: 'success',
        text: 'Thank you! Your verified review has been submitted.',
      });
      setComment('');
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-16 border-t border-charcoal/10 pt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between mb-8">
        <h2 className="text-2xl text-charcoal font-serif">Customer Reviews</h2>
        <div className="flex items-center gap-3">
          <StarRating rating={product?.rating || 0} size={16} />
          <span className="text-sm text-charcoal-soft">
            {(product?.rating || 0).toFixed(1)} out of 5
            {product?.reviewCount ? ` · ${product.reviewCount} reviews` : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Reviews List */}
        <div className="lg:col-span-7 space-y-4">
          {reviewsList.length > 0 ? (
            <div className="space-y-4">
              {reviewsList.map((review, idx) => (
                <div key={review._id || idx} className="bg-cream p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <StarRating rating={review.rating} size={13} />
                    {review.isVerifiedPurchase && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-charcoal-soft leading-relaxed">
                    "{review.comment}"
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-charcoal-soft">
                    <span className="font-medium text-charcoal">{review.name}</span>
                    {review.createdAt && (
                      <span>
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-cream/50 p-6 rounded-lg text-sm text-charcoal-soft">
              Be the first verified buyer to share your thoughts on this product.
            </div>
          )}
        </div>

        {/* Right: Write Review Form */}
        <div className="lg:col-span-5">
          <div className="bg-cream p-6 rounded-lg sticky top-24">
            <h3 className="text-lg font-serif text-charcoal mb-1">Write a Review</h3>
            <p className="text-xs text-charcoal-soft mb-4">
              Only verified buyers who purchased this product can submit a review.
            </p>

            {feedback.text && (
              <div
                className={`p-3 rounded text-xs mb-4 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {feedback.text}
              </div>
            )}

            {isLoggedIn ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full text-sm p-2 rounded border border-charcoal/20 bg-white focus:outline-none focus:border-charcoal"
                  >
                    <option value="5">★★★★★ (5 - Excellent)</option>
                    <option value="4">★★★★☆ (4 - Good)</option>
                    <option value="3">★★★☆☆ (3 - Average)</option>
                    <option value="2">★★☆☆☆ (2 - Below Expectation)</option>
                    <option value="1">★☆☆☆☆ (1 - Poor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your honest experience..."
                    required
                    className="w-full text-sm p-3 rounded border border-charcoal/20 bg-white focus:outline-none focus:border-charcoal resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-charcoal text-white text-xs font-semibold uppercase tracking-widest rounded hover:bg-charcoal/90 transition disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 border border-dashed border-charcoal/20 rounded">
                <p className="text-xs text-charcoal-soft mb-3">
                  Please log in to leave a verified review.
                </p>
                <a
                  href="/login"
                  className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal border border-charcoal rounded hover:bg-charcoal hover:text-white transition"
                >
                  Log In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}