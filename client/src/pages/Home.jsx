import { useEffect, useState } from "react";
import Hero from "../components/sections/Hero";
import ShopByCategory from "../components/sections/ShopByCategory";
import ProductSection from "../components/sections/ProductSection";
import BeautySale from "../components/sections/BeautySale";
import CustomerReviews from "../components/sections/CustomerReviews";
import Newsletter from "../components/sections/Newsletter";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { usePageTitle } from "../hooks/usePageTitle";

const CATEGORY_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop";

export default function Home() {
  usePageTitle(null, "Discover premium, clean cosmetics and skincare made to let your natural beauty shine.");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    productService
      .getProductsBatch(100)
      .then((res) => {
        if (cancelled) return;
        
        // Ensure 'all' is always an array
        const all = Array.isArray(res) ? res : res?.products || [];

        const feat = all.filter((p) => p.badge === "New" || p.badge === "Sale").slice(0, 4);
        const best = all.filter((p) => p.badge === "Bestseller").slice(0, 4);

        setFeaturedProducts(feat.length > 0 ? feat : all.slice(0, 4));
        setBestSellers(best.length > 0 ? best : all.slice(4, 8));
        setSaleProducts(all.filter((p) => p.oldPrice).slice(0, 6));

        return categoryService.getCategories().then((cats) => {
          if (cancelled) return;
          const catList = Array.isArray(cats) ? cats : cats?.categories || [];
          const counts = all.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          }, {});

          setCategories(
            catList.map((c) => ({
              id: c._id || c.id,
              name: c.name,
              image: c.image || CATEGORY_FALLBACK_IMAGE,
              count: `${counts[c.name] || 0} product${counts[c.name] === 1 ? "" : "s"}`,
            }))
          );
        });
      })
      .catch((err) => {
        console.error("Home page load error:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setProductsLoading(false);
          setCategoriesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Hero />
      <ShopByCategory categories={categories || []} loading={categoriesLoading} />
      <ProductSection
        id="featured"
        eyebrow="Handpicked"
        title="Featured Products"
        subtitle="Our editors' favorite picks this season."
        products={featuredProducts || []}
        tone="ivory"
        loading={productsLoading}
      />
      <ProductSection
        id="bestsellers"
        eyebrow="Fan Favorites"
        title="Best Sellers"
        subtitle="The products our customers can't stop repurchasing."
        products={bestSellers || []}
        tone="cream"
        loading={productsLoading}
      />
      <BeautySale products={saleProducts || []} />
      <CustomerReviews />
      <Newsletter />
    </>
  );
}