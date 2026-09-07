import CategoryCard from "../ui/CategoryCard";
import Skeleton from "../ui/Skeleton";

export default function ShopByCategory({ categories = [], loading = false }) {
  if (!loading && categories.length === 0) return null;

  return (
    <section id="categories" className="container-luxe py-16 lg:py-24">
      <div className="text-center max-w-xl mx-auto mb-12">
        <p className="text-xs uppercase tracking-luxe text-rose mb-3">
          Curated For You
        </p>
        <h2 className="text-3xl sm:text-4xl text-charcoal">Shop by Category</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-10">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="rounded-full aspect-square mx-auto max-w-[220px]" />
                <Skeleton className="h-4 w-20 mt-4 mx-auto" />
              </div>
            ))
          : categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
      </div>
    </section>
  );
}
