import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Printer, Download } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import Button from "../../components/ui/Button";
import { AdminErrorState } from "../components/AdminStates";
import { adminOrderService } from "../../services/adminOrderService";
import { useToast } from "../../context/ToastContext";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const { showToast } = useToast();
  const invoiceRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminOrderService
      .getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.message || "Couldn't load this order."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setUpdating(true);
    try {
      const updated = await adminOrderService.updateOrderStatus(id, status);
      setOrder(updated);
      showToast(`Order status updated to "₹{status}".`);
    } catch (err) {
      showToast(err.message || "Couldn't update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Order Details" />
        <div className="h-64 animate-pulse bg-ivory border border-charcoal/10" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <AdminPageHeader title="Order Details" />
        <AdminErrorState message={error || "Order not found."} onRetry={load} />
      </div>
    );
  }

  return (
    <div>
      {/* Back Button & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxe text-charcoal-soft hover:text-rose"
        >
          <ChevronLeft size={14} /> Back to Orders
        </Link>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="inline-flex items-center gap-2"
          >
            <Printer size={15} /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Screen Header */}
      <div className="print:hidden">
        <AdminPageHeader
          title={order.orderId || order._id}
          subtitle={`Placed on ${new Date(order.createdAt).toLocaleString()}`}
          actions={
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              <select
                value={order.status}
                onChange={handleStatusChange}
                disabled={updating}
                className="border border-charcoal/20 bg-ivory px-3 py-2 text-sm focus:outline-none focus:border-rose"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {/* Regular Admin Screen View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
              <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Products</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, i) => (
                    <tr key={i} className="border-b border-charcoal/5 last:border-0">
                      <td className="py-3 flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            loading="lazy"
                            className="h-10 w-10 object-cover bg-cream"
                          />
                        )}
                        <span className="text-charcoal">{item.name}</span>
                      </td>
                      <td className="py-3 text-charcoal-soft">{item.qty}</td>
                      <td className="py-3 text-charcoal-soft">â‚¹{item.price}</td>
                      <td className="py-3 text-charcoal">â‚¹{item.price * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-charcoal/10 space-y-1.5 text-sm max-w-xs ml-auto">
                <div className="flex justify-between text-charcoal-soft">
                  <span>Subtotal</span>
                  <span>â‚¹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-charcoal-soft">
                    <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                    <span>-â‚¹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal-soft">
                  <span>Shipping</span>
                  <span>â‚¹{order.shipping ?? 0}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-charcoal-soft">
                    <span>Tax</span>
                    <span>â‚¹{order.tax}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal font-medium pt-1.5 border-t border-charcoal/10">
                  <span>Total</span>
                  <span>â‚¹{order.total}</span>
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
              <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Shipping</h2>
              <p className="text-sm text-charcoal">
                {order.address?.house ? `${order.address.house}, ` : ""}
                {order.address?.street}
              </p>
              <p className="text-sm text-charcoal-soft">
                {order.address?.city}, {order.address?.state} - {order.address?.pincode}
              </p>
            </section>
          </div>

          <div className="space-y-6">
            {/* Customer */}
            <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
              <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Customer</h2>
              <p className="text-sm text-charcoal font-medium">{order.customer?.fullName || "â€”"}</p>
              <p className="text-sm text-charcoal-soft">{order.customer?.email || "â€”"}</p>
              <p className="text-sm text-charcoal-soft">{order.customer?.phone || "â€”"}</p>
            </section>

            {/* Payment */}
            <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
              <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Payment</h2>
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal-soft">Method</span>
                <span className="text-charcoal capitalize">{order.payment?.method || "COD"}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-charcoal-soft">Status</span>
                <StatusBadge status={order.payment?.status || "Pending"} />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Printable Invoice Container (Only visible during print / PDF export) */}
      <div id="printable-invoice" ref={invoiceRef} className="hidden print:block text-black bg-white">
        <div className="p-8 max-w-[820px] mx-auto text-xs font-sans border border-gray-400">
          {/* Header */}
          <div className="text-center pb-2 border-b border-gray-400">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-black">LUMÃ‰A BEAUTY</h1>
            <p className="text-[11px] text-gray-700 mt-1">
              Plot No. 120, Premium Retail Hub, Mumbai, Maharashtra - 400088
            </p>
            <p className="text-[11px] text-gray-700">
              GSTIN: 27AABCL1234F1Z5 | CIN: U52100MH2026PTC123456
            </p>
          </div>

          {/* Title */}
          <div className="text-center my-3">
            <h2 className="text-sm font-bold uppercase tracking-wider border-y border-black py-1 inline-block px-8">
              TAX INVOICE / RETAIL INVOICE
            </h2>
          </div>

          {/* Invoice Meta */}
          <div className="flex justify-between items-start mb-3 text-[11px] leading-tight">
            <div>
              <p><span className="font-semibold">Invoice No:</span> INV-{order._id ? order._id.slice(-8).toUpperCase() : "2026-98745"}</p>
              <p><span className="font-semibold">Order ID:</span> {order.orderId || order._id}</p>
            </div>
            <div className="text-right">
              <p><span className="font-semibold">Invoice Date:</span> {new Date().toLocaleDateString("en-IN")}</p>
              <p><span className="font-semibold">Order Date:</span> {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          </div>

          {/* Addresses Grid */}
          <div className="grid grid-cols-3 border border-gray-400 p-2.5 gap-2 mb-3 text-[11px] leading-tight">
            <div>
              <h3 className="font-bold uppercase text-[10px] text-gray-700 mb-1">Sold By / Sender</h3>
              <p className="font-semibold">LUMÃ‰A BEAUTY RETAIL</p>
              <p>Plot No. 120, Central Hub</p>
              <p>Mumbai, Maharashtra - 400088</p>
              <p>GSTIN: 27AABCL1234F1Z5</p>
            </div>

            <div>
              <h3 className="font-bold uppercase text-[10px] text-gray-700 mb-1">Bill To</h3>
              <p className="font-semibold">{order.customer?.fullName || "Guest Customer"}</p>
              <p>{order.address?.house ? `${order.address.house}, ` : ""}{order.address?.street || ""}</p>
              <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
              <p>Phone: {order.customer?.phone || "â€”"}</p>
            </div>

            <div>
              <h3 className="font-bold uppercase text-[10px] text-gray-700 mb-1">Ship To</h3>
              <p className="font-semibold">{order.customer?.fullName || "Guest Customer"}</p>
              <p>{order.address?.house ? `${order.address.house}, ` : ""}{order.address?.street || ""}</p>
              <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
              <p>Phone: {order.customer?.phone || "â€”"}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-gray-400 mb-3 text-[11px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border border-gray-400 p-1.5 w-10 text-center">S.No.</th>
                <th className="border border-gray-400 p-1.5">Product Description</th>
                <th className="border border-gray-400 p-1.5 text-center w-12">Qty</th>
                <th className="border border-gray-400 p-1.5 text-right w-24">Unit Price (â‚¹)</th>
                <th className="border border-gray-400 p-1.5 text-right w-24">Total Amount (â‚¹)</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-1.5 text-center">{index + 1}</td>
                  <td className="border border-gray-400 p-1.5 font-medium">{item.name}</td>
                  <td className="border border-gray-400 p-1.5 text-center">{item.qty}</td>
                  <td className="border border-gray-400 p-1.5 text-right">â‚¹{Number(item.price).toFixed(2)}</td>
                  <td className="border border-gray-400 p-1.5 text-right">â‚¹{(Number(item.price) * Number(item.qty)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing & Footer Calculations */}
          <div className="grid grid-cols-2 gap-3 items-start mb-4">
            <div className="border border-gray-400 p-2 text-[11px] leading-relaxed">
              <p className="font-semibold">
                Payment Mode: <span className="uppercase">{order.payment?.method || "COD"} ({order.payment?.status || "Pending"})</span>
              </p>
              <p className="mt-2 text-[10px] text-gray-600">
                This is a computer-generated tax invoice, signature is not required.
              </p>
              <p className="text-[10px] text-gray-600">
                Thank you for shopping with LUMÃ‰A BEAUTY!
              </p>
            </div>

            <table className="w-full border-collapse border border-gray-400 text-[11px]">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-1.5">Subtotal</td>
                  <td className="border border-gray-400 p-1.5 text-right font-medium">â‚¹{Number(order.subtotal || 0).toFixed(2)}</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td className="border border-gray-400 p-1.5 text-green-700">
                      Discount {order.couponCode ? `(${order.couponCode})` : ""}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right text-green-700 font-medium">
                      -â‚¹{Number(order.discount).toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="border border-gray-400 p-1.5">Delivery / Shipping</td>
                  <td className="border border-gray-400 p-1.5 text-right">â‚¹{Number(order.shipping || 0).toFixed(2)}</td>
                </tr>
                {order.tax > 0 && (
                  <tr>
                    <td className="border border-gray-400 p-1.5">Tax (GST)</td>
                    <td className="border border-gray-400 p-1.5 text-right">â‚¹{Number(order.tax).toFixed(2)}</td>
                  </tr>
                )}
                <tr className="bg-gray-100 font-bold text-xs">
                  <td className="border border-gray-400 p-2">Grand Total</td>
                  <td className="border border-gray-400 p-2 text-right">â‚¹{Number(order.total || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Signatory */}
          <div className="border-t border-gray-400 pt-3 flex justify-between items-end">
            <p className="text-[10px] text-gray-500 italic">For any query contact: support@lumeabeauty.com</p>
            <div className="text-right">
              <p className="font-bold text-xs">LUMÃ‰A BEAUTY RETAIL</p>
              <p className="text-[10px] text-gray-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
