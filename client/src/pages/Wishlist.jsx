import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import ProductCard from "../components/ui/ProductCard";
import Button from "../components/ui/Button";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";

export default function Wishlist() {
  usePageTitle("Wishlist");
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
    showToast(`${product.name} moved to your bag`);
  };

  if (items.length === 0) {
    return (
      <div className="container-luxe py-24 text-center">
        <Heart size={44} className="mx-auto text-nude-dark" />
        <h1 className="mt-6 text-2xl sm:text-3xl text-charcoal">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-charcoal-soft">
          Save the products you love to find them here later.
        </p>
        <Button as={Link} to="/shop" variant="primary" size="lg" className="mt-8">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-ivory">
      <div className="bg-cream py-12">
        <div className="container-luxe text-center">
          <p className="text-xs uppercase tracking-luxe text-rose mb-3">
            {items.length} Item{items.length !== 1 ? "s" : ""}
          </p>
          <h1 className="text-4xl sm:text-5xl text-charcoal">Your Wishlist</h1>
        </div>
      </div>

      <div className="container-luxe py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleMoveToCart(product)}
                >
                  Move to Cart
                </Button>
                <button
                  type="button"
                  aria-label={`Remove ${product.name} from wishlist`}
                  onClick={() => removeFromWishlist(product.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-charcoal/20 text-charcoal-soft hover:border-rose hover:text-rose transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
