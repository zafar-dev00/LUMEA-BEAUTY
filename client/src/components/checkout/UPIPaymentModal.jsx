import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getUPIPayment, generateQRCodeURL, updateOrderPaymentStatus } from '../../services/upiPaymentService';
import { useToast } from '../../context/ToastContext';

export default function UPIPaymentModal({ orderId, amount, onPaymentComplete, onClose }) {
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [upiString, setUpiString] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUPIDetails = async () => {
      try {
        const data = await getUPIPayment(amount, orderId);
        setUpiString(data.upiString);
        setQrCodeUrl(generateQRCodeURL(data.upiString));
        setLoading(false);
      } catch (error) {
        showToast(error?.message || 'Failed to load UPI payment');
        onClose();
      }
    };

    fetchUPIDetails();
  }, [orderId, amount, onClose, showToast]);

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      await updateOrderPaymentStatus(orderId, 'Paid', `upi_${Date.now()}`);
      setPaymentVerified(true);
      showToast('Payment verified successfully!');
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    } catch (error) {
      showToast(error?.message || 'Failed to verify payment');
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-stone-300 border-t-stone-900 rounded-full mx-auto mb-4"></div>
          <p className="text-stone-600">Loading UPI payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 className="text-lg font-serif text-stone-900">UPI Payment</h2>
          <button
            onClick={onClose}
            disabled={verifying}
            className="text-stone-500 hover:text-stone-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!paymentVerified ? (
            <>
              {/* QR Code Section */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-stone-500 mb-4">
                  Scan with any UPI app
                </p>
                {qrCodeUrl && (
                  <div className="flex justify-center bg-[#faf8f5] p-4 rounded border border-stone-200">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Amount Display */}
              <div className="text-center border-t border-b border-stone-200 py-4">
                <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">Amount to Pay</p>
                <p className="text-2xl font-serif text-stone-900">₹{Number(amount).toFixed(2)}</p>
              </div>

              {/* Manual UPI Link Option */}
              <div className="flex gap-3">
                <a
                  href={upiString}
                  className="flex-1 text-center bg-blue-500 text-white px-4 py-3 text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors font-medium rounded"
                >
                  Open UPI App
                </a>
              </div>

              {/* Instructions */}
              <div className="bg-stone-50 border border-stone-200 rounded p-4 text-xs text-stone-600 space-y-2">
                <p className="font-medium text-stone-900 mb-2">Payment Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Scan the QR code with any UPI app (Google Pay, PhonePe, etc.)</li>
                  <li>Complete the payment</li>
                  <li>Click "Confirm Payment" below</li>
                </ol>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleVerifyPayment}
                disabled={verifying}
                className="w-full bg-stone-900 text-white px-4 py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:bg-stone-400 font-medium rounded"
              >
                {verifying ? 'Verifying Payment...' : 'Confirm Payment'}
              </button>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-serif text-stone-900">Payment Successful!</h3>
                <p className="text-sm text-stone-600">
                  Your order has been confirmed. You'll be redirected shortly.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
