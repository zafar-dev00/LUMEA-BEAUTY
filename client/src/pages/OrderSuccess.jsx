import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import { getLastOrder, formatDate } from "../utils/order";
import { usePageTitle } from "../hooks/usePageTitle";

export default function OrderSuccess() {
  usePageTitle("Order Confirmed");
  const location = useLocation();
  const order = location.state?.order ?? getLastOrder();

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="container-luxe py-16 lg:py-24">
      <div className="max-w-lg mx-auto text-center">
        <CheckCircle2 size={56} className="mx-auto text-rose" />
        <h1 className="mt-6 text-3xl sm:text-4xl text-charcoal">
          Order Confirmed
        </h1>
        <p className="mt-2 text-charcoal-soft">
          Thank you — your LUMÉA order has been placed successfully.
        </p>

        <div className="mt-10 border border-charcoal/10 bg-cream p-6 sm:p-8 text-left space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-soft">Order ID</span>
            <span className="text-charcoal font-medium">{order.orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-soft">Order Date</span>
            <span className="text-charcoal font-medium">
              {formatDate(order.date)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-soft">Payment Method</span>
            <span className="text-charcoal font-medium">
              {order.payment.label}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-soft">Estimated Delivery</span>
            <span className="text-charcoal font-medium">
              {formatDate(order.estimatedDelivery)}
            </span>
          </div>
          <div className="flex justify-between text-base pt-4 border-t border-charcoal/10">
            <span className="text-charcoal font-medium">Total Amount</span>
            <span className="text-charcoal font-medium">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button as={Link} to="/track-order" variant="primary" size="lg">
            Track Order
          </Button>
          <Button as={Link} to="/shop" variant="secondary" size="lg">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
