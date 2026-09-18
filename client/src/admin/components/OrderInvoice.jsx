import React, { forwardRef } from "react";

const OrderInvoice = forwardRef(({ order }, ref) => {
  if (!order) return null;

  const items = order.items || [
    {
      name: "Radiance Glow 10% Vitamin C Face Serum",
      quantity: 1,
      price: 699,
      total: 699,
    },
  ];

  return (
    <div
      ref={ref}
      id="printable-invoice"
      className="bg-white text-black p-8 max-w-[800px] mx-auto text-xs font-sans border border-gray-300 print:border-none print:p-4 print:max-w-full"
    >
      {/* Header */}
      <div className="text-center pb-3 border-b border-gray-400">
        <h1 className="text-xl font-bold tracking-wider uppercase text-charcoal">LUMÉA BEAUTY</h1>
        <p className="text-[11px] text-gray-600">
          Plot No. 120, Premium Retail Hub, Mumbai, Maharashtra - 400088
        </p>
        <p className="text-[11px] text-gray-600">
          GSTIN: 27AABCL1234F1Z5 | CIN: U52100MH2026PTC123456
        </p>
      </div>

      {/* Invoice Title & Meta */}
      <div className="text-center my-3">
        <h2 className="text-base font-bold uppercase tracking-wide border-y border-black py-1 inline-block px-6">
          TAX INVOICE / RETAIL INVOICE
        </h2>
      </div>

      <div className="flex justify-between items-start mb-4 text-[11px]">
        <div>
          <p><span className="font-semibold">Invoice No:</span> INV-{order._id?.slice(-8).toUpperCase() || "2026-9874"}</p>
          <p><span className="font-semibold">Order ID:</span> {order.orderNumber || order._id || "LUMEA-MU6LO7VZSI4D"}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Invoice Date:</span> {new Date().toLocaleDateString("en-IN")}</p>
          <p><span className="font-semibold">Order Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "18/09/2026"}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-3 border border-gray-400 p-3 gap-3 mb-4 text-[11px]">
        <div>
          <h3 className="font-bold uppercase text-[10px] text-gray-600 mb-1">Sold By / Sender</h3>
          <p className="font-semibold">LUMÉA BEAUTY RETAIL</p>
          <p>Mumbai Central Hub, Maharashtra</p>
          <p>GSTIN: 27AABCL1234F1Z5</p>
        </div>

        <div>
          <h3 className="font-bold uppercase text-[10px] text-gray-600 mb-1">Bill To</h3>
          <p className="font-semibold">{order.shippingAddress?.fullName || order.user?.name || "Zafar Khan"}</p>
          <p>{order.shippingAddress?.addressLine1 || "33, 01 Pancharatna Niwas V N Purav Marg"}</p>
          <p>{order.shippingAddress?.city || "Mumbai"}, {order.shippingAddress?.state || "Maharashtra"} - {order.shippingAddress?.postalCode || "400088"}</p>
          <p>Phone: {order.shippingAddress?.phone || order.user?.phone || "9082148681"}</p>
        </div>

        <div>
          <h3 className="font-bold uppercase text-[10px] text-gray-600 mb-1">Ship To</h3>
          <p className="font-semibold">{order.shippingAddress?.fullName || order.user?.name || "Zafar Khan"}</p>
          <p>{order.shippingAddress?.addressLine1 || "33, 01 Pancharatna Niwas V N Purav Marg"}</p>
          <p>{order.shippingAddress?.city || "Mumbai"}, {order.shippingAddress?.state || "Maharashtra"} - {order.shippingAddress?.postalCode || "400088"}</p>
          <p>Phone: {order.shippingAddress?.phone || order.user?.phone || "9082148681"}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-gray-400 mb-4 text-[11px]">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border border-gray-400 p-1.5 w-10 text-center">S.No.</th>
            <th className="border border-gray-400 p-1.5">Product Description</th>
            <th className="border border-gray-400 p-1.5 text-center w-14">Qty</th>
            <th className="border border-gray-400 p-1.5 text-right w-24">Unit Price (₹)</th>
            <th className="border border-gray-400 p-1.5 text-right w-24">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-400 p-1.5 text-center">{index + 1}</td>
              <td className="border border-gray-400 p-1.5 font-medium">
                {item.product?.name || item.name}
              </td>
              <td className="border border-gray-400 p-1.5 text-center">{item.quantity}</td>
              <td className="border border-gray-400 p-1.5 text-right">₹{item.price?.toFixed(2)}</td>
              <td className="border border-gray-400 p-1.5 text-right">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Calculation & Payment Info */}
      <div className="grid grid-cols-2 gap-4 items-start mb-6">
        <div className="border border-gray-300 p-2.5 text-[11px]">
          <p className="font-semibold mb-1">Payment Method: <span className="uppercase">{order.paymentMethod || "COD"}</span></p>
          <p className="font-semibold">Payment Status: <span className="uppercase">{order.paymentStatus || "PENDING"}</span></p>
          <p className="mt-3 text-[10px] text-gray-500">This is a system generated tax invoice. No signature required.</p>
        </div>

        <table className="w-full border-collapse border border-gray-400 text-[11px]">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-1.5">Subtotal</td>
              <td className="border border-gray-400 p-1.5 text-right font-medium">₹{order.subtotal?.toFixed(2) || "699.00"}</td>
            </tr>
            {order.discount > 0 && (
              <tr>
                <td className="border border-gray-400 p-1.5 text-green-700">Discount ({order.couponCode || "COUPON"})</td>
                <td className="border border-gray-400 p-1.5 text-right text-green-700 font-medium">-₹{order.discount?.toFixed(2) || "692.01"}</td>
              </tr>
            )}
            <tr>
              <td className="border border-gray-400 p-1.5">Shipping Charges</td>
              <td className="border border-gray-400 p-1.5 text-right">₹{order.shippingCost ? order.shippingCost.toFixed(2) : "0.00"}</td>
            </tr>
            <tr className="bg-gray-100 font-bold text-xs">
              <td className="border border-gray-400 p-2">Grand Total</td>
              <td className="border border-gray-400 p-2 text-right">₹{order.total?.toFixed(2) || "6.99"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-400 pt-3 flex justify-between items-end">
        <p className="text-[10px] text-gray-500 italic">Thank you for shopping with LUMÉA BEAUTY!</p>
        <div className="text-right">
          <p className="font-bold text-xs">LUMÉA BEAUTY</p>
          <p className="text-[10px] text-gray-500">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
});

export default OrderInvoice;