import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Zap, ChevronRight } from "lucide-react";
import { productService } from "../services/productService";
import StarRating from "../components/ui/StarRating";
import Button from "../components/ui/Button";
import QuantitySelector from "../components/ui/QuantitySelector";
import ImageGallery from "../components/product/ImageGallery";
import ShadeSelector from "../components/product/ShadeSelector";
import ProductInfoTabs from "../components/product/ProductInfoTabs";
import ReviewsSection from "../components/product/ReviewsSection";
import RelatedProducts from "../components/product/RelatedProducts";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();

  const [qty, setQty] = useState(1);
  const [selectedShade, setSelectedShade] = useState(null);

  usePageTitle(
    product ? product.name : notFound ? "Product Not Found" : "Product",
    product?.description
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setQty(1);

    productService
      .getProductById(id)
      .then((fetched) => {
        if (cancelled) return;
        setProduct(fetched);
        setSelectedShade(fetched?.shades?.[0] ?? null);
        return productService.getRelatedProducts(fetched);
      })
      .then((relatedProducts) => {
        if (cancelled || !relatedProducts) return;
        setRelated(relatedProducts);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || "Something went wrong loading this product.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-luxe py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 animate-pulse">
          <div className="aspect-square bg-cream" />
          <div className="space-y-4">
            <div className="h-3 w-24 bg-cream" />
            <div className="h-8 w-2/3 bg-cream" />
            <div className="h-4 w-1/3 bg-cream" />
            <div className="h-24 w-full bg-cream" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="text-3xl sm:text-4xl text-charcoal">Product not found</h1>
        <p className="mt-3 text-charcoal-soft">
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <Button as={Link} to="/shop" variant="primary" size="lg" className="mt-8">
          Back to Shop
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="text-2xl text-charcoal">Something went wrong</h1>
        <p className="mt-3 text-charcoal-soft">{error}</p>
        <Button
          variant="primary"
          size="lg"
          className="mt-8"
          onClick={() => navigate(0)}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    showToast(`${product.name} added to your bag`);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate("/cart");
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    showToast(
      wishlisted
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist`
    );
  };

  return (
    <div className="bg-ivory">
      {/* Breadcrumb */}
      <div className="container-luxe pt-8 pb-2">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-luxe text-charcoal-soft">
          <Link to="/" className="hover:text-rose transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-rose transition-colors">
            Shop
          </Link>
          <ChevronRight size={12} />
          <span className="text-charcoal">{product.name}</span>
        </nav>
      </div>

      <div className="container-luxe py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <ImageGallery
          images={product.images}
          name={product.name}
          badge={product.badge}
        />

        <div>
          <p className="text-xs uppercase tracking-luxe text-nude-dark">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl text-charcoal">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-charcoal-soft">
              {product.rating.toFixed(1)}
              {product.reviewCount ? ` (${product.reviewCount} reviews)` : ""}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-medium text-charcoal">
              ${product.price}
            </span>
            {product.oldPrice && (
              <span className="text-lg text-nude-dark line-through">
                ${product.oldPrice}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm text-charcoal-soft leading-relaxed max-w-md">
            {product.description}
          </p>

          {product.shades.length > 0 && (
            <div className="mt-8">
              <ShadeSelector
                shades={product.shades}
                selected={selectedShade}
                onSelect={setSelectedShade}
              />
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-xs uppercase tracking-luxe text-charcoal mb-3">
              Quantity
            </h3>
            <QuantitySelector value={qty} onChange={setQty} />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={16} />
              Add to Cart
            </Button>
            <Button
              variant="rose"
              size="lg"
              className="flex-1"
              onClick={handleBuyNow}
            >
              <Zap size={16} />
              Buy Now
            </Button>
            <button
              type="button"
              aria-label="Add to wishlist"
              aria-pressed={wishlisted}
              onClick={handleToggleWishlist}
              className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center border transition-colors ${
                wishlisted
                  ? "border-rose bg-rose text-ivory"
                  : "border-charcoal/20 text-charcoal hover:border-rose hover:text-rose"
              }`}
            >
              <Heart size={18} className={wishlisted ? "fill-current" : ""} />
            </button>
          </div>

          <ProductInfoTabs product={product} />
        </div>
      </div>

      <div className="container-luxe">
        <ReviewsSection product={product} />
      </div>

      <div className="mt-16">
        <RelatedProducts products={related} />
      </div>
    </div>
  );
}
