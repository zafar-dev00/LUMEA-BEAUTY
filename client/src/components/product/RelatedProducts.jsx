import ProductCard from "../ui/ProductCard";

export default function RelatedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="container-luxe">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-luxe text-rose mb-3">
            You May Also Like
          </p>
          <h2 className="text-3xl sm:text-4xl text-charcoal">
            Related Products
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
