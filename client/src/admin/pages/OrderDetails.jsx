import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Printer, Download } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
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
      showToast(`Order status updated to "${status}".`);
    } catch (err) {
      showToast(err.message || "Couldn't update order status.");
    } finally {
      setUpdating(false);
    }
  };

  // 100% working Print & Save as PDF for both Laptop & Mobile
  const handlePrintOrDownload = () => {
    if (!order) return;

    const orderRef = order.orderId || order._id || "LUMEA-ORDER";
    const invoiceDate = new Date().toLocaleDateString("en-IN");
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN");

    const itemsRows = (order.items || [])
      .map(
        (item, index) => `
        <tr>
          <td style="border: 1px solid #777; padding: 6px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #777; padding: 6px; font-weight: 500;">${item.name}</td>
          <td style="border: 1px solid #777; padding: 6px; text-align: center;">${item.qty}</td>
          <td style="border: 1px solid #777; padding: 6px; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
          <td style="border: 1px solid #777; padding: 6px; text-align: right;">₹${(Number(item.price) * Number(item.qty)).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const discountRow =
      order.discount > 0
        ? `<tr>
            <td style="border: 1px solid #777; padding: 6px; color: #15803d;">Discount ${order.couponCode ? `(${order.couponCode})` : ""}</td>
            <td style="border: 1px solid #777; padding: 6px; text-align: right; color: #15803d; font-weight: 500;">-₹${Number(order.discount).toFixed(2)}</td>
          </tr>`
        : "";

    const taxRow =
      order.tax > 0
        ? `<tr>
            <td style="border: 1px solid #777; padding: 6px;">Tax (GST)</td>
            <td style="border: 1px solid #777; padding: 6px; text-align: right;">₹${Number(order.tax).toFixed(2)}</td>
          </tr>`
        : "";

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice - ${orderRef}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 0; padding: 15px; background: #fff; }
            .invoice-box { max-width: 800px; margin: 0 auto; border: 1px solid #333; padding: 25px; }
            .header { text-align: center; border-bottom: 1px solid #555; padding-bottom: 12px; }
            .title { text-align: center; margin: 12px 0; }
            .title h2 { display: inline-block; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 20px; font-size: 14px; margin: 0; letter-spacing: 1.5px; }
            .meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px; }
            .addresses { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid #777; padding: 10px; gap: 10px; font-size: 11px; margin-bottom: 15px; }
            .addresses h4 { margin: 0 0 4px 0; font-size: 10px; text-transform: uppercase; color: #555; }
            .addresses p { margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
            th { background: #f2f2f2; border: 1px solid #777; padding: 6px; text-align: left; }
            .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 11px; }
            .payment-card { border: 1px solid #777; padding: 10px; }
            .footer { border-top: 1px solid #777; padding-top: 12px; margin-top: 15px; display: flex; justify-content: space-between; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <h1 style="margin: 0; font-size: 22px; letter-spacing: 2px;">LUMÉA BEAUTY</h1>
              <p style="margin: 4px 0; font-size: 11px; color: #555;">Plot No. 120, Premium Retail Hub, Mumbai, Maharashtra - 400088</p>
              <p style="margin: 0; font-size: 11px; color: #555;">GSTIN: 9081XXXXXXXXXXXX | CIN: 0000000001</p>
            </div>

            <div class="title">
              <h2>TAX INVOICE / RETAIL INVOICE</h2>
            </div>

            <div class="meta">
              <div>
                <p style="margin: 2px 0;"><strong>Invoice No:</strong> INV-${order._id ? order._id.slice(-8).toUpperCase() : "2026-98745"}</p>
                <p style="margin: 2px 0;"><strong>Order ID:</strong> ${orderRef}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 2px 0;"><strong>Invoice Date:</strong> ${invoiceDate}</p>
                <p style="margin: 2px 0;"><strong>Order Date:</strong> ${orderDate}</p>
              </div>
            </div>

            <div class="addresses">
              <div>
                <h4>Sold By / Sender</h4>
                <p><strong>LUMÉA BEAUTY RETAIL</strong></p>
                <p>Plot No. 120, Central Hub</p>
                <p>Mumbai, Maharashtra - 400088</p>
                <p>GSTIN: 9081XXXXXXXXXXXX</p>
              </div>
              <div>
                <h4>Bill To</h4>
                <p><strong>${order.customer?.fullName || "Valued Customer"}</strong></p>
                <p>${order.address?.house ? `${order.address.house}, ` : ""}${order.address?.street || ""}</p>
                <p>${order.address?.city || ""}, ${order.address?.state || ""} - ${order.address?.pincode || ""}</p>
                <p>Phone: ${order.customer?.phone || "—"}</p>
              </div>
              <div>
                <h4>Ship To</h4>
                <p><strong>${order.customer?.fullName || "Valued Customer"}</strong></p>
                <p>${order.address?.house ? `${order.address.house}, ` : ""}${order.address?.street || ""}</p>
                <p>${order.address?.city || ""}, ${order.address?.state || ""} - ${order.address?.pincode || ""}</p>
                <p>Phone: ${order.customer?.phone || "—"}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">S.No.</th>
                  <th>Product Description</th>
                  <th style="width: 50px; text-align: center;">Qty</th>
                  <th style="width: 90px; text-align: right;">Unit Price (₹)</th>
                  <th style="width: 90px; text-align: right;">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="calc-grid">
              <div class="payment-card">
                <p style="margin: 0 0 6px 0;"><strong>Payment Mode:</strong> <span style="text-transform: uppercase;">${order.payment?.method || "COD"} (${order.payment?.status || "Pending"})</span></p>
                <p style="margin: 15px 0 0 0; font-size: 10px; color: #555;">This is a computer-generated tax invoice, signature is not required.</p>
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #555;">Thank you for shopping with LUMÉA BEAUTY!</p>
              </div>
              <table>
                <tbody>
                  <tr>
                    <td style="border: 1px solid #777; padding: 6px;">Subtotal</td>
                    <td style="border: 1px solid #777; padding: 6px; text-align: right; font-weight: 500;">₹${Number(order.subtotal || 0).toFixed(2)}</td>
                  </tr>
                  ${discountRow}
                  <tr>
                    <td style="border: 1px solid #777; padding: 6px;">Delivery / Shipping</td>
                    <td style="border: 1px solid #777; padding: 6px; text-align: right;">₹${Number(order.shipping || 0).toFixed(2)}</td>
                  </tr>
                  ${taxRow}
                  <tr style="background: #f2f2f2; font-weight: bold; font-size: 12px;">
                    <td style="border: 1px solid #777; padding: 8px;">Grand Total</td>
                    <td style="border: 1px solid #777; padding: 8px; text-align: right;">₹${Number(order.total || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              <span style="font-size: 10px; color: #666; font-style: italic;">For support contact: lumea0beauty@gmail.com</span>
              <div style="text-align: right;">
                <p style="margin: 0; font-weight: bold; font-size: 11px;">LUMÉA BEAUTY RETAIL</p>
                <p style="margin: 2px 0 0 0; font-size: 9px; color: #666;">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Open isolated print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      // Fallback if popup blocker is enabled
      window.print();
    }
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
          {/* Direct HTML Native Buttons: Guaranteed click & response */}
          <button
            type="button"
            onClick={handlePrintOrDownload}
            className="inline-flex items-center gap-2 bg-charcoal text-ivory hover:bg-charcoal/90 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Download size={15} /> Download PDF
          </button>

          <button
            type="button"
            onClick={handlePrintOrDownload}
            className="inline-flex items-center gap-2 border border-charcoal/30 bg-ivory hover:bg-cream text-charcoal px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* Screen Header */}
      <div>
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
                      <td className="py-3 text-charcoal-soft">₹{item.price}</td>
                      <td className="py-3 text-charcoal">₹{item.price * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-charcoal/10 space-y-1.5 text-sm max-w-xs ml-auto">
                <div className="flex justify-between text-charcoal-soft">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-charcoal-soft">
                    <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal-soft">
                  <span>Shipping</span>
                  <span>₹{order.shipping ?? 0}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-charcoal-soft">
                    <span>Tax</span>
                    <span>₹{order.tax}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal font-medium pt-1.5 border-t border-charcoal/10">
                  <span>Total</span>
                  <span>₹{order.total}</span>
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
              <p className="text-sm text-charcoal font-medium">{order.customer?.fullName || "—"}</p>
              <p className="text-sm text-charcoal-soft">{order.customer?.email || "—"}</p>
              <p className="text-sm text-charcoal-soft">{order.customer?.phone || "—"}</p>
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
    </div>
  );
}