import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "./CartContext";

const product = {
  id: "serum-1",
  name: "Radiance Serum",
  image: "/serum.jpg",
  price: 40,
  category: "Skincare",
};

function CartProbe() {
  const { addToCart, increaseQty, decreaseQty, removeFromCart, items, cartCount, subtotal, shipping, tax, total } = useCart();

  return (
    <div>
      <button onClick={() => addToCart(product)}>Add</button>
      <button onClick={() => addToCart(product, 2)}>Add two</button>
      <button onClick={() => increaseQty(product.id)}>Increase</button>
      <button onClick={() => decreaseQty(product.id)}>Decrease</button>
      <button onClick={() => removeFromCart(product.id)}>Remove</button>
      <output data-testid="items">{items.length}</output>
      <output data-testid="count">{cartCount}</output>
      <output data-testid="subtotal">{subtotal}</output>
      <output data-testid="shipping">{shipping}</output>
      <output data-testid="tax">{tax}</output>
      <output data-testid="total">{total}</output>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <CartProbe />
    </CartProvider>
  );
}

describe("CartProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("merges duplicate products and calculates checkout totals", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Add two" }));

    expect(screen.getByTestId("items").textContent).toBe("1");
    expect(screen.getByTestId("count").textContent).toBe("3");
    expect(screen.getByTestId("subtotal").textContent).toBe("120");
    expect(screen.getByTestId("shipping").textContent).toBe("0");
    expect(screen.getByTestId("tax").textContent).toBe("0");
    expect(screen.getByTestId("total").textContent).toBe("120");
  });

  it("never decreases quantity below one and persists cart changes", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Decrease" }));

    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(JSON.parse(window.localStorage.getItem("lumea_cart"))).toEqual([
      expect.objectContaining({ id: product.id, qty: 1 }),
    ]);

    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.getByTestId("items").textContent).toBe("0");
    expect(window.localStorage.getItem("lumea_cart")).toBe("[]");
  });
});
