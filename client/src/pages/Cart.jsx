import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const {
    items: cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    subtotal,
    total,
  } = useCart();

  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif text-stone-900 mb-4">Your Shopping Bag is Empty</h1>
        <p className="text-stone-500 mb-8 text-sm">Discover our clean beauty essentials and fill your bag.</p>
        <Link
          to="/shop"
          className="inline-block bg-stone-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">Shopping Bag</span>
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mt-2">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
            {cartItems.map((item) => {
              const { id, name, price, qty, image } = item;

              return (
                <div key={id} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={image}
                      alt={name}
                      className="w-20 h-20 object-cover bg-white border border-stone-200 flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    <div>
                      <h3 className="text-sm font-medium text-stone-900">{name}</h3>
                      <p className="text-xs text-stone-500 mt-1">${price.toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-stone-300 bg-white">
                      <button
                        type="button"
                        onClick={() => decreaseQty(id)}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-mono">{qty}</span>
                      <button
                        type="button"
                        onClick={() => increaseQty(id)}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-100"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-serif font-semibold text-stone-900 min-w-[4rem] text-right">
                      ${(price * qty).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(id)}
                      className="text-stone-400 hover:text-rose-600 text-sm ml-2"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link to="/shop" className="text-xs uppercase tracking-wider underline text-stone-700 hover:text-stone-900 font-medium">
              ← Continue Shopping
            </Link>
            {clearCart && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs uppercase tracking-wider text-rose-600 hover:underline font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-[#faf8f5] border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-serif text-stone-900 border-b border-stone-200 pb-3">Order Summary</h3>

            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-semibold text-stone-900 border-t border-stone-200 pt-3">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full bg-stone-900 text-white py-3.5 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors font-medium mt-4 cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}