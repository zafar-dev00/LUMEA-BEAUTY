import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import StarRating from "./StarRating";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";

export default function ProductCard({ product, onQuickView }) {
  const { id, name, category, price, oldPrice, rating, image, badge } = product;
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();
  const wishlisted = isWishlisted(id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    showToast(`${name} added to your bag`);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    showToast(
      wishlisted ? `${name} removed from wishlist` : `${name} added to wishlist`
    );
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden bg-cream aspect-[4/5]">
        <Link to={`/product/${id}`} className="block h-full w-full">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {badge && (
          <span className="absolute left-3 top-3 bg-charcoal text-ivory text-[10px] uppercase tracking-luxe px-3 py-1">
            {badge}
          </span>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            aria-label="Add to wishlist"
            aria-pressed={wishlisted}
            onClick={handleToggleWishlist}
            className={`flex h-9 w-9 items-center justify-center transition-all duration-300 hover:bg-rose hover:text-ivory ${
              wishlisted
                ? "bg-rose text-ivory opacity-100"
                : "bg-ivory/90 text-charcoal opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart size={16} className={wishlisted ? "fill-current" : ""} />
          </button>

          {onQuickView && (
            <button
              type="button"
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="flex h-9 w-9 items-center justify-center bg-ivory/90 text-charcoal opacity-0 transition-opacity duration-300 hover:bg-rose hover:text-ivory group-hover:opacity-100"
            >
              <Eye size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 bg-ivory/95 py-3 text-xs uppercase tracking-luxe text-charcoal opacity-0 transition-all duration-300 translate-y-2 hover:bg-charcoal hover:text-ivory group-hover:opacity-100 group-hover:translate-y-0"
        >
          <ShoppingBag size={14} />
          Add to Bag
        </button>
      </div>

      <Link to={`/product/${id}`} className="block mt-4 space-y-1">
        <p className="text-[11px] uppercase tracking-luxe text-nude-dark">
          {category}
        </p>
        <h3 className="text-base text-charcoal font-medium leading-snug">
          {name}
        </h3>
        <StarRating rating={rating} />
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm font-medium text-charcoal">
            ${price}
          </span>
          {oldPrice && (
            <span className="text-sm text-nude-dark line-through">
              ${oldPrice}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
