const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Uses Resend's free verified sandbox address; works immediately without DNS setup
const FROM_EMAIL = 'LUMÉA BEAUTY <onboarding@resend.dev>';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const sendOrderConfirmation = async (order) => {
  if (!resend) {
    throw new Error('Resend email service is not configured (missing RESEND_API_KEY)');
  }

  const itemLines = order.items
    .map((item) => `${item.name} x ${item.qty} - ${formatMoney(item.price * item.qty)}`)
    .join('\n');
  const itemRows = order.items
    .map((item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e8ece8">${escapeHtml(item.name)}<br><span style="color:#68736d;font-size:13px">Qty: ${item.qty} at ${formatMoney(item.price)} each</span></td>
        <td style="padding:12px 0;border-bottom:1px solid #e8ece8;text-align:right;white-space:nowrap">${formatMoney(item.price * item.qty)}</td>
      </tr>`)
    .join('');
  const address = [order.address.house, order.address.street, order.address.city, order.address.state, order.address.pincode]
    .filter(Boolean)
    .map(escapeHtml)
    .join(', ');
  const customerName = escapeHtml(order.customer.fullName);
  const orderId = escapeHtml(order.orderId);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [order.customer.email],
    subject: `Order ${order.orderId} is ready for dispatch`,
    text: [
      `Hello ${order.customer.fullName},`,
      '',
      `Your order ${order.orderId} is ready for dispatch.`,
      '',
      itemLines,
      '',
      `Subtotal: ${formatMoney(order.subtotal)}`,
      `Discount: -${formatMoney(order.discount)}`,
      `Total: ${formatMoney(order.total)}`,
      `Payment: ${order.payment.method}`,
      '',
      `Shipping to: ${address}`,
    ].join('\n'),
    html: `
      <div style="margin:0;background:#f3f8f4;padding:32px 16px;font-family:Arial,sans-serif;color:#25312b">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dce8df">
          <div style="padding:24px 28px;border-bottom:3px solid #53c6a2;color:#1a9b83;font-size:24px;font-weight:700;letter-spacing:1px">LUMÉA BEAUTY</div>
          <div style="padding:28px">
            <p style="margin:0 0 8px;color:#53ad8d;font-weight:700">Hello ${customerName},</p>
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:500">Your order is ready for dispatch</h1>
            <p style="margin:0 0 24px;color:#68736d">Order <strong>${orderId}</strong> has been packed and is on its way to you.</p>
            <table style="width:100%;border-collapse:collapse;font-size:15px">${itemRows}
              <tr><td style="padding:18px 0 4px;color:#68736d">Subtotal</td><td style="padding:18px 0 4px;text-align:right">${formatMoney(order.subtotal)}</td></tr>
              <tr><td style="padding:4px 0;color:#68736d">Discount</td><td style="padding:4px 0;text-align:right">-${formatMoney(order.discount)}</td></tr>
              <tr><td style="padding:14px 0 0;border-top:1px solid #dce8df;font-size:18px;font-weight:700">Total</td><td style="padding:14px 0 0;border-top:1px solid #dce8df;text-align:right;font-size:18px;font-weight:700">${formatMoney(order.total)}</td></tr>
            </table>
            <div style="margin-top:28px;padding:18px;background:#f6fbf7">
              <strong>Delivering to</strong><br><span style="color:#68736d">${address}</span>
            </div>
            <p style="margin:28px 0 0;color:#68736d">Payment method: ${escapeHtml(order.payment.method)}</p>
            <p style="margin:24px 0 0;color:#68736d">Thank you for shopping with LUMEA BEAUTY.</p>
          </div>
        </div>
      </div>`,
  });

  if (error) {
    throw new Error(error.message);
  }
};

const sendLoginOtp = async (email, otp) => {
  if (!resend) {
    throw new Error('Resend email service is not configured (missing RESEND_API_KEY)');
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: 'Your LUMEA login code',
    text: `Your LUMEA login code is ${otp}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
  });

  if (error) {
    console.error('❌ Resend API Error:', error);
    throw new Error(error.message);
  }
};

module.exports = { sendOrderConfirmation, sendLoginOtp };