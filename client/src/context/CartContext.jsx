import { createContext, useContext, useEffect, useState } from "react";
import { couponService } from "../services/couponService";

const CartContext = createContext(null);
const STORAGE_KEY = "lumea_cart";

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage fallback
    }
  }, [items]);

  const addToCart = (product, qty = 1) => {
    if (!product) return;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id || product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          oldPrice: product.oldPrice ?? null,
          category: product.category,
          qty,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQty = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
    );
  };

  const decreaseQty = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const cartCount = (items || []).reduce((sum, item) => sum + (item.qty || 1), 0);
  const subtotal = (items || []).reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  const applyCoupon = async (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return { status: "empty" };
    if (appliedCoupon?.code === code) return { status: "already", code };
    try {
      const coupon = await couponService.validateCoupon(code, subtotal);
      setAppliedCoupon(coupon);
      return { status: "success", code: coupon.code, rate: coupon.discountPercentage / 100 };
    } catch (err) {
      return { status: "invalid", code, message: err.message };
    }
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const meetsMinOrder = !appliedCoupon || subtotal >= (appliedCoupon.minOrder || 0);
  const discount =
    appliedCoupon && meetsMinOrder
      ? Math.min(
          subtotal * ((appliedCoupon.discountPercentage || 0) / 100),
          appliedCoupon.maxDiscount ?? Infinity
        )
      : 0;
  const discountedSubtotal = subtotal - discount;
  const shipping = 0;
  const tax = 0;
  const total = discountedSubtotal;

  return (
    <CartContext.Provider
      value={{
        items: items || [],
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        cartCount,
        subtotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discount,
        discountedSubtotal,
        shipping,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}