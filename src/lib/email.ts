/**
 * Email utility — sends transactional emails via the Payload nodemailer adapter.
 * All functions are server-side only.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

// ── Helpers ────────────────────────────────────────────────────────────────

function wrap(body: string, title: string) {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f7f5f0; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
    .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.08); }
    .header { background:#1a1208; padding:28px 32px; text-align:center; }
    .header img { height:32px; }
    .header h1 { color:#e8dcc8; font-size:13px; letter-spacing:0.2em; margin:10px 0 0; font-weight:400; }
    .body { padding:32px; color:#3d2d18; }
    .body h2 { font-size:20px; margin:0 0 16px; }
    .body p { font-size:14px; line-height:1.7; margin:0 0 12px; color:#6b5744; }
    .order-box { background:#f7f5f0; border-radius:10px; padding:20px; margin:20px 0; }
    .order-row { display:flex; justify-content:space-between; font-size:13px; padding:6px 0; border-bottom:1px solid #e8dcc8; }
    .order-row:last-child { border:none; font-weight:600; font-size:14px; color:#3d2d18; }
    .order-row span { color:#6b5744; }
    .btn { display:inline-block; background:#3d2d18; color:#e8dcc8; text-decoration:none; padding:12px 28px; border-radius:8px; font-size:13px; letter-spacing:0.1em; margin-top:8px; }
    .footer { background:#f7f5f0; padding:20px 32px; text-align:center; font-size:11px; color:#a0917e; line-height:1.6; border-top:1px solid #e8dcc8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div style="color:#e8dcc8;font-size:18px;font-weight:300;letter-spacing:0.3em">朝日夫婦</div>
      <h1>ASAHI FUUFU</h1>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      朝日夫婦 | 251 新北市淡水區中正路 233-3 號<br/>
      如有任何問題，請聯絡我們：<a href="mailto:oa@extrastudio.tw" style="color:#a0917e">oa@extrastudio.tw</a>
    </div>
  </div>
</body>
</html>`
}

// ── Send helper ────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string) {
  try {
    const payload = await getPayload({ config })
    await payload.sendEmail({ to, subject, html })
    return { ok: true }
  } catch (err: any) {
    console.error('[email] send failed:', err?.message)
    return { ok: false, error: err?.message }
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

/** 訂單確認信 — 付款成功後發送 */
export async function sendOrderConfirmation(order: {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: { productName: string; quantity: number; unitPrice: number }[]
  subtotal: number
  couponDiscount?: number
  pointsRedeemed?: number
  shippingFee?: number
  totalAmount: number
}) {
  const itemRows = order.items.map(item =>
    `<div class="order-row"><span>${item.productName} × ${item.quantity}</span><span>NT$ ${(item.unitPrice * item.quantity).toLocaleString()}</span></div>`
  ).join('')

  const discountRows = [
    order.couponDiscount && order.couponDiscount > 0
      ? `<div class="order-row"><span>折扣碼</span><span>-NT$ ${order.couponDiscount.toLocaleString()}</span></div>` : '',
    order.pointsRedeemed && order.pointsRedeemed > 0
      ? `<div class="order-row"><span>點數折抵</span><span>-NT$ ${order.pointsRedeemed.toLocaleString()}</span></div>` : '',
    order.shippingFee && order.shippingFee > 0
      ? `<div class="order-row"><span>運費</span><span>NT$ ${order.shippingFee.toLocaleString()}</span></div>` : '',
  ].filter(Boolean).join('')

  const html = wrap(`
    <h2>感謝您的訂購！🌸</h2>
    <p>親愛的 ${order.customerName}，您的訂單已確認付款成功，我們將盡快為您備貨出貨。</p>
    <div class="order-box">
      <div class="order-row" style="font-weight:600;color:#3d2d18;"><span>訂單編號</span><span style="font-family:monospace">${order.orderNumber}</span></div>
      ${itemRows}
      ${discountRows}
      <div class="order-row"><span>實付金額</span><span>NT$ ${order.totalAmount.toLocaleString()}</span></div>
    </div>
    <p>您可以透過以下連結即時查詢出貨進度，訪客與會員皆可使用，無需登入。</p>
    <a class="btn" href="${process.env.NEXT_PUBLIC_SITE_URL}/zh-TW/track?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.customerEmail)}">查看訂單狀態</a>
  `, '訂單確認 — 朝日夫婦')

  return send(order.customerEmail, `【朝日夫婦】訂單確認 ${order.orderNumber}`, html)
}

/** 出貨通知信 — 建立黑貓出貨單後發送 */
export async function sendShippingNotification(order: {
  orderNumber: string
  customerName: string
  customerEmail: string
  trackingNumber?: string
  tcatOrderNo?: string
  shippingAddress: { zip?: string; city?: string; district?: string; address?: string }
}) {
  const addr = [order.shippingAddress.zip, order.shippingAddress.city, order.shippingAddress.district, order.shippingAddress.address].filter(Boolean).join(' ')

  const html = wrap(`
    <h2>您的商品已出貨！🚚</h2>
    <p>親愛的 ${order.customerName}，您的訂單 <strong>${order.orderNumber}</strong> 已交由黑貓宅急便配送，請注意簽收。</p>
    <div class="order-box">
      ${order.tcatOrderNo ? `<div class="order-row"><span>黑貓訂單編號</span><span style="font-family:monospace">${order.tcatOrderNo}</span></div>` : ''}
      ${order.trackingNumber ? `<div class="order-row"><span>追蹤號碼</span><span style="font-family:monospace">${order.trackingNumber}</span></div>` : ''}
      <div class="order-row"><span>收件地址</span><span>${addr}</span></div>
    </div>
    <p style="font-size:13px;color:#a0917e;">冷凍商品請於收到通知後盡快簽收，以確保品質。</p>
    <a class="btn" href="${process.env.NEXT_PUBLIC_SITE_URL}/zh-TW/track?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.customerEmail)}" style="margin-right:8px">查看訂單狀態</a>
    <a class="btn" href="https://www.t-cat.com.tw/Inquire/Trace.aspx${order.trackingNumber ? `?BillID=${encodeURIComponent(order.trackingNumber)}` : ''}" style="background:#5a7d8f;">黑貓追蹤查詢</a>
  `, '出貨通知 — 朝日夫婦')

  return send(order.customerEmail, `【朝日夫婦】商品已出貨 ${order.orderNumber}`, html)
}

/** 忘記密碼信（顧客端） */
export async function sendCustomerPasswordReset(to: string, name: string, resetUrl: string) {
  const html = wrap(`
    <h2>重設密碼</h2>
    <p>親愛的 ${name}，我們收到您的密碼重設請求。</p>
    <p>請點擊下方按鈕重設密碼，此連結將在 <strong>1 小時</strong>後失效：</p>
    <a class="btn" href="${resetUrl}">重設密碼</a>
    <p style="margin-top:16px;font-size:12px;color:#a0917e;">如果您沒有申請重設密碼，請忽略此郵件。</p>
  `, '重設密碼 — 朝日夫婦')

  return send(to, '【朝日夫婦】重設您的密碼', html)
}

/** 新會員歡迎信 + 贈點通知 */
export async function sendWelcomeEmail(to: string, name: string, bonusPoints: number) {
  const html = wrap(`
    <h2>歡迎加入朝日夫婦 🌸</h2>
    <p>親愛的 ${name}，感謝您成為朝日夫婦的會員！</p>
    ${bonusPoints > 0 ? `<div class="order-box"><div class="order-row"><span>⭐ 加入贈點</span><span>${bonusPoints} 點</span></div></div><p>點數可在下次消費時折抵，1點 = NT$1。</p>` : ''}
    <p>現在就來選購我們的人氣冰品吧！</p>
    <a class="btn" href="${process.env.NEXT_PUBLIC_SITE_URL}/zh-TW/shop">立即選購</a>
  `, '歡迎加入 — 朝日夫婦')

  return send(to, '【朝日夫婦】歡迎加入會員！', html)
}

/** 後台手動發送給顧客的訂單留言 */
export async function sendOrderMessage(order: {
  orderNumber: string
  customerName: string
  customerEmail: string
  subject: string
  message: string
}) {
  const html = wrap(`
    <h2>${order.subject}</h2>
    <p>親愛的 ${order.customerName}，</p>
    <p style="white-space:pre-line">${order.message}</p>
    <p style="margin-top:20px;font-size:13px;color:#a0917e;">此訊息關於您的訂單 <strong>${order.orderNumber}</strong></p>
    <a class="btn" href="${process.env.NEXT_PUBLIC_SITE_URL}/zh-TW/track?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.customerEmail)}">查看訂單狀態</a>
  `, `${order.subject} — 朝日夫婦`)

  return send(order.customerEmail, `【朝日夫婦】${order.subject}`, html)
}

/** 系統通知信（管理員用） */
export async function sendAdminNotification(subject: string, body: string) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || 'oa@extrastudio.tw'
  const html = wrap(`<h2>系統通知</h2><p>${body}</p>`, subject)
  return send(adminEmail, `【朝日夫婦後台】${subject}`, html)
}
