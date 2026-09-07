const TONE_MAP = {
  // Order statuses
  Pending: "bg-nude/40 text-charcoal-soft",
  Confirmed: "bg-blush text-rose-dark",
  Processing: "bg-blush text-rose-dark",
  Packed: "bg-nude/40 text-charcoal-soft",
  Shipped: "bg-gold/20 text-charcoal",
  "Out for Delivery": "bg-gold/20 text-charcoal",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-rose/15 text-rose-dark",
  // Payment statuses
  Paid: "bg-green-100 text-green-800",
  Failed: "bg-rose/15 text-rose-dark",
  Refunded: "bg-orange-100 text-orange-800",
  // Generic
  active: "bg-green-100 text-green-800",
  inactive: "bg-charcoal/10 text-charcoal-soft",
  // Reviews
  pending: "bg-nude/40 text-charcoal-soft",
  approved: "bg-green-100 text-green-800",
  hidden: "bg-charcoal/10 text-charcoal-soft",
  // Stock
  "In Stock": "bg-green-100 text-green-800",
  "Low Stock": "bg-gold/25 text-charcoal",
  "Out of Stock": "bg-rose/15 text-rose-dark",
};

export default function StatusBadge({ status }) {
  const classes = TONE_MAP[status] || "bg-charcoal/10 text-charcoal-soft";
  // Map payment status "Paid" to display as "prepaid" for UX
  const displayStatus = status === "Paid" ? "Prepaid" : status;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide ${classes}`}
    >
      {displayStatus}
    </span>
  );
}
