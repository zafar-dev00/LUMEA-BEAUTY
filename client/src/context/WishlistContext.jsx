import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "lumea_wishlist";

function readStoredWishlist() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(readStoredWishlist);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const isWishlisted = (id) => items.some((item) => item.id === id);

  const addToWishlist = (product) => {
    setItems((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev
        : [
            ...prev,
            {
              id: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              oldPrice: product.oldPrice ?? null,
              category: product.category,
              rating: product.rating,
              badge: product.badge ?? null,
            },
          ]
    );
  };

  const removeFromWishlist = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleWishlist = (product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components -- context + hook colocated by design
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
