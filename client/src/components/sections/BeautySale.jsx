import ProductCard from "../ui/ProductCard";
import Button from "../ui/Button";

export default function BeautySale({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section id="sale" className="bg-charcoal py-16 lg:py-24">
      <div className="container-luxe">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-luxe text-rose mb-3">
            Limited Time
          </p>
          <h2 className="text-3xl sm:text-4xl text-ivory">Beauty Sale — Up to 35% Off</h2>
          <p className="mt-3 text-cream/70">
            Indulge in your favorites before they're gone.
          </p>
          <Button variant="outlineLight" size="md" className="mt-6">
            Shop the Sale
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-charcoal [&_h3]:text-ivory [&_p]:text-cream/70 [&_span]:text-ivory">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
