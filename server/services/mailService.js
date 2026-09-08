const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();

// Set API key safely
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );
}

// Sender email must match your verified Brevo account email
const SENDER = {
  name: 'LUMÉA BEAUTY',
  email: process.env.BREVO_SENDER_EMAIL || 'thezafar0908@gmail.com',
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const sendOrderConfirmation = async (order) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured in environment variables');
  }

  const itemLines = order.items
    .map((item) => `${item.name} x ${item.qty} - ${formatMoney(item.price * item.qty)}`)
    .join('\n');

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e8ece8">${escapeHtml(item.name)}<br><span style="color:#68736d;font-size:13px">Qty: ${item.qty} at ${formatMoney(item.price)} each</span></td>
        <td style="padding:12px 0;border-bottom:1px solid #e8ece8;text-align:right;white-space:nowrap">${formatMoney(item.price * item.qty)}</td>
      </tr>`
    )
    .join('');

  const address = [
    order.address.house,
    order.address.street,
    order.address.city,
    order.address.state,
    order.address.pincode,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(', ');

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.subject = `Order ${order.orderId} is ready for dispatch`;
  sendSmtpEmail.sender = SENDER;
  sendSmtpEmail.to = [{ email: order.customer.email, name: order.customer.fullName }];
  sendSmtpEmail.textContent = [
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
  ].join('\n');

  sendSmtpEmail.htmlContent = `
    <div style="margin:0;background:#f3f8f4;padding:32px 16px;font-family:Arial,sans-serif;color:#25312b">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dce8df">
        <div style="padding:24px 28px;border-bottom:3px solid #53c6a2;color:#1a9b83;font-size:24px;font-weight:700;letter-spacing:1px">LUMÉA BEAUTY</div>
        <div style="padding:28px">
          <p style="margin:0 0 8px;color:#53ad8d;font-weight:700">Hello ${escapeHtml(order.customer.fullName)},</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:500">Your order is ready for dispatch</h1>
          <p style="margin:0 0 24px;color:#68736d">Order <strong>${escapeHtml(order.orderId)}</strong> has been packed and is on its way to you.</p>
          <table style="width:100%;border-collapse:collapse;font-size:15px">${itemRows}
            <tr><td style="padding:18px 0 4px;color:#68736d">Subtotal</td><td style="padding:18px 0 4px;text-align:right">${formatMoney(order.subtotal)}</td></tr>
            <tr><td style="padding:4px 0;color:#68736d">Discount</td><td style="padding:4px 0;text-align:right">-${formatMoney(order.discount)}</td></tr>
            <tr><td style="padding:14px 0 0;border-top:1px solid #dce8df;font-size:18px;font-weight:700">Total</td><td style="padding:14px 0 0;border-top:1px solid #dce8df;text-align:right;font-size:18px;font-weight:700">${formatMoney(order.total)}</td></tr>
          </table>
          <div style="margin-top:28px;padding:18px;background:#f6fbf7">
            <strong>Delivering to</strong><br><span style="color:#68736d">${address}</span>
          </div>
          <p style="margin:28px 0 0;color:#68736d">Payment method: ${escapeHtml(order.payment.method)}</p>
          <p style="margin:24px 0 0;color:#68736d">Thank you for shopping with LUMÉA BEAUTY.</p>
        </div>
      </div>
    </div>`;

  return await apiInstance.sendTransacEmail(sendSmtpEmail);
};

const sendLoginOtp = async (email, otp) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured in environment variables');
  }

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.subject = 'Your LUMÉA login code';
  sendSmtpEmail.sender = SENDER;
  sendSmtpEmail.to = [{ email: email.trim() }];
  sendSmtpEmail.textContent = `Your LUMÉA login code is ${otp}. It expires in 10 minutes. If you did not request this code, you can safely ignore this email.`;

  sendSmtpEmail.htmlContent = `
    <div style="margin:0;background:#FAF7F2;padding:32px 16px;font-family:Arial,sans-serif;color:#2B2622">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #EFEAE3;padding:32px;text-align:center">
        <h2 style="margin:0 0 16px;font-size:24px;letter-spacing:2px;color:#2B2622">LUMÉA BEAUTY</h2>
        <p style="margin:0 0 24px;font-size:15px;color:#68736d">Use the code below to log in to your account. This code expires in 10 minutes.</p>
        <div style="margin:24px auto;padding:16px 24px;background:#FAF7F2;border:1px dashed #D68F85;display:inline-block;font-size:28px;font-weight:700;letter-spacing:8px;color:#2B2622">
          ${escapeHtml(otp)}
        </div>
        <p style="margin:24px 0 0;font-size:13px;color:#999999">If you did not request this login code, you can safely ignore this email.</p>
      </div>
    </div>`;

  return await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendOrderConfirmation, sendLoginOtp };