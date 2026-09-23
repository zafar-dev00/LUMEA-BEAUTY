import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function UPIPaymentModal({ orderId, amount, onPaymentComplete, onClose }) {
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  // Kotak811 Verified VPA & Exact NPCI Registered Name
  const upiId = '9082148681@kotakbank';
  const merchantName = 'ZAFAR KHAN AYYUB KHAN';
  const cleanAmount = Number(amount).toFixed(2);

  // Standard NPCI URI Scheme
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  // Reliable QR code rendering API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiString)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    showToast('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 10) {
      showToast('Please enter a valid 12-digit UPI Reference / UTR Number.');
      return;
    }

    setSubmitting(true);
    // UTR pass ho raha hai parent handler ko
    if (typeof onPaymentComplete === 'function') {
      onPaymentComplete(cleanUtr);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-none max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-stone-800" />
            <h2 className="text-base font-serif font-semibold text-stone-900">
              UPI Direct Pay & Verification
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            type="button"
            className="text-stone-400 hover:text-stone-700 disabled:opacity-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* QR Code Frame */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-stone-500 mb-2 font-medium">
              Scan with GPay, PhonePe, or Paytm
            </p>
            <div className="flex justify-center bg-[#faf8f5] p-3 border border-stone-200 mx-auto w-fit">
              <img
                src={qrCodeUrl}
                alt="UPI QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1 block">
              Direct Bank Transfer (Zero Gateway Fees)
            </span>
          </div>

          {/* Amount & VPA Details */}
          <div className="text-center border-t border-b border-stone-200 py-3 space-y-1">
            <p className="text-xs uppercase tracking-wider text-stone-500">Amount to Pay</p>
            <p className="text-2xl font-serif font-bold text-stone-900">₹{cleanAmount}</p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-xs font-mono bg-stone-100 px-2.5 py-1 text-stone-800 border border-stone-200 font-medium">
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-stone-600 hover:text-stone-900 underline font-medium"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy ID'}
              </button>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="bg-stone-50 p-3 border border-stone-200 text-xs text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-stone-900">
              <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
              <span>Payment Proof Required</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Payment complete karne ke baad apne banking app se 12-digit <strong>UPI Ref No. / UTR</strong> copy karke niche enter karein.
            </p>
          </div>

          {/* UTR Form */}
          <form onSubmit={handleConfirm} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1 font-medium">
                12-Digit UPI Reference / UTR Number *
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\s/g, ''))}
                placeholder="e.g. 426819283746"
                className="w-full bg-white border border-stone-300 px-3 py-2 text-xs font-mono outline-none focus:border-stone-800"
              />
            </div>

            {/* Mobile Deep Link Option */}
            <div>
              <a
                href={upiString}
                className="block w-full text-center bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors"
              >
                Open UPI App on Mobile
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting || utrNumber.trim().length < 10}
              className="w-full bg-stone-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:bg-stone-400 font-medium cursor-pointer"
            >
              {submitting ? 'Verifying & Submitting...' : 'Submit UTR & Confirm Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}