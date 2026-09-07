import { Link } from "react-router-dom";
import ProductCard from "../ui/ProductCard";
import Button from "../ui/Button";
import { ProductGridSkeleton } from "../ui/Skeleton";

export default function ProductSection({
  id,
  eyebrow,
  title,
  subtitle,
  products,
  tone = "ivory",
  loading = false,
}) {
  const bg = tone === "cream" ? "bg-cream" : "bg-ivory";

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section id={id} className={`${bg} py-16 lg:py-24`}>
      <div className="container-luxe">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-luxe text-rose mb-3">
              {eyebrow}
            </p>
            <h2 className="text-3xl sm:text-4xl text-charcoal">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-charcoal-soft max-w-md">{subtitle}</p>
            )}
          </div>
          <Button as={Link} to="/shop" variant="secondary" size="sm">
            View All
          </Button>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
