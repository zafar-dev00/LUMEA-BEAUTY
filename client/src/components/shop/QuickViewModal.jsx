import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import StarRating from "../ui/StarRating";
import Button from "../ui/Button";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";

export default function QuickViewModal({ product, onClose }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();

  if (!product) return null;

  const { id, name, category, price, oldPrice, rating, reviewCount, image, description, badge } =
    product;
  const wishlisted = isWishlisted(id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    showToast(`${name} added to your bag`);
    onClose();
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    showToast(
      wishlisted ? `${name} removed from wishlist` : `${name} added to wishlist`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/50" onClick={onClose} />

      <div className="relative bg-ivory w-full max-w-3xl max-h-[90vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 shadow-xl">
        <button
          type="button"
          aria-label="Close quick view"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center bg-ivory/90 text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
        >
          <X size={18} />
        </button>

        <div className="relative bg-cream aspect-square sm:aspect-auto">
          <img src={image} alt={name} className="h-full w-full object-cover" />
          {badge && (
            <span className="absolute left-4 top-4 bg-charcoal text-ivory text-[10px] uppercase tracking-luxe px-3 py-1">
              {badge}
            </span>
          )}
        </div>

        <div className="p-6 sm:p-8 flex flex-col">
          <p className="text-[11px] uppercase tracking-luxe text-nude-dark">
            {category}
          </p>
          <h2 className="mt-1 text-2xl text-charcoal">{name}</h2>

          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={rating} />
            {reviewCount && (
              <span className="text-xs text-charcoal-soft">
                ({reviewCount} reviews)
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xl font-medium text-charcoal">
              ${price}
            </span>
            {oldPrice && (
              <span className="text-base text-nude-dark line-through">
                ${oldPrice}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm text-charcoal-soft leading-relaxed">
            {description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-charcoal/20">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 flex items-center justify-center text-charcoal hover:bg-cream transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="h-11 w-11 flex items-center justify-center text-charcoal hover:bg-cream transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              aria-label="Add to wishlist"
              aria-pressed={wishlisted}
              onClick={handleToggleWishlist}
              className={`flex h-11 w-11 items-center justify-center border transition-colors ${
                wishlisted
                  ? "border-rose bg-rose text-ivory"
                  : "border-charcoal/20 text-charcoal hover:bg-rose hover:text-ivory hover:border-rose"
              }`}
            >
              <Heart size={16} className={wishlisted ? "fill-current" : ""} />
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            onClick={handleAddToCart}
          >
            <ShoppingBag size={16} />
            Add to Bag
          </Button>
        </div>
      </div>
    </div>
  );
}
