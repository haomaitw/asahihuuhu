import type { CollectionConfig } from 'payload'

const REGISTRATION_BONUS_POINTS = 50

export const Customers: CollectionConfig = {
  slug: 'customers',
  hooks: {
    afterOperation: [
      async ({ operation, result, req }) => {
        if (operation !== 'create') return result
        try {
          // Award registration bonus points
          await req.payload.create({
            collection: 'point-transactions',
            data: {
              customer: result.id,
              type: 'registration_bonus',
              points: REGISTRATION_BONUS_POINTS,
              balance: REGISTRATION_BONUS_POINTS,
              description: '新會員加入贈點',
            },
            overrideAccess: true,
          })
          await req.payload.update({
            collection: 'customers',
            id: result.id as string,
            data: { points: REGISTRATION_BONUS_POINTS },
            overrideAccess: true,
          })
          // Send welcome email (non-blocking)
          req.payload.sendEmail({
            to: result.email as string,
            subject: '【朝日夫婦】歡迎加入會員！',
            html: `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"/><style>body{margin:0;padding:0;background:#f7f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);}.header{background:#1a1208;padding:28px 32px;text-align:center;color:#e8dcc8;}.body{padding:32px;color:#3d2d18;}.footer{background:#f7f5f0;padding:20px 32px;text-align:center;font-size:11px;color:#a0917e;border-top:1px solid #e8dcc8;}.btn{display:inline-block;background:#3d2d18;color:#e8dcc8;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:13px;letter-spacing:0.1em;margin-top:8px;}.box{background:#f7f5f0;border-radius:10px;padding:20px;margin:20px 0;display:flex;justify-content:space-between;font-size:13px;}</style></head><body><div class="wrap"><div class="header"><div style="font-size:18px;font-weight:300;letter-spacing:0.3em">朝日夫婦</div><div style="font-size:13px;letter-spacing:0.2em;margin-top:10px;font-weight:400">ASAHI FUUFU</div></div><div class="body"><h2 style="font-size:20px;margin:0 0 16px">歡迎加入朝日夫婦 🌸</h2><p style="font-size:14px;line-height:1.7;color:#6b5744">親愛的 ${result.name ?? '新朋友'}，感謝您成為朝日夫婦的會員！</p><div class="box"><span>⭐ 加入贈點</span><span><strong>${REGISTRATION_BONUS_POINTS} 點</strong></span></div><p style="font-size:14px;line-height:1.7;color:#6b5744">點數可在下次消費時折抵，1點 = NT$1。</p><a class="btn" href="${process.env.NEXT_PUBLIC_SITE_URL}/zh-TW/shop">立即選購</a></div><div class="footer">朝日夫婦 | 251 新北市淡水區中正路 233-3 號<br/>如有任何問題，請聯絡我們：<a href="mailto:oa@extrastudio.tw" style="color:#a0917e">oa@extrastudio.tw</a></div></div></body></html>`,
          }).catch((e: any) => console.error('[welcome email]', e))
        } catch (e) {
          console.error('[customers afterOperation]', e)
        }
        return result
      },
    ],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    verify: false,
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000, // 10 minutes
    forgotPassword: {
      generateEmailHTML: async (args?: { req?: any; token?: string; user?: any }) => {
        const { token, user } = args ?? {}
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://asahihuuhu.zeabur.app'
        const resetUrl = `${siteUrl}/zh-TW/account/reset-password?token=${token ?? ''}`
        const name = (user?.name as string) ?? '顧客'
        return `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"/><style>body{margin:0;padding:0;background:#f7f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);}.header{background:#1a1208;padding:28px 32px;text-align:center;color:#e8dcc8;}.body{padding:32px;color:#3d2d18;font-size:14px;line-height:1.7;}.footer{background:#f7f5f0;padding:20px 32px;text-align:center;font-size:11px;color:#a0917e;border-top:1px solid #e8dcc8;}.btn{display:inline-block;background:#3d2d18;color:#e8dcc8 !important;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:13px;letter-spacing:0.1em;margin-top:8px;}</style></head><body><div class="wrap"><div class="header"><div style="font-size:18px;font-weight:300;letter-spacing:0.3em">朝日夫婦</div><div style="font-size:13px;letter-spacing:0.2em;margin-top:10px">ASAHI FUUFU</div></div><div class="body"><h2 style="font-size:20px;margin:0 0 16px">重設密碼</h2><p>親愛的 ${name}，我們收到您的密碼重設請求。</p><p>請點擊下方按鈕重設密碼，此連結將在 <strong>1 小時</strong>後失效：</p><a class="btn" href="${resetUrl}">重設密碼</a><p style="margin-top:16px;font-size:12px;color:#a0917e;">如果您沒有申請重設密碼，請忽略此郵件。</p></div><div class="footer">朝日夫婦 | 251 新北市淡水區中正路 233-3 號<br/>如有問題請聯絡：<a href="mailto:oa@extrastudio.tw" style="color:#a0917e">oa@extrastudio.tw</a></div></div></body></html>`
      },
      generateEmailSubject: () => '【朝日夫婦】重設您的密碼',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'points', 'tier', 'totalSpent', 'createdAt'],
    group: '會員管理',
  },
  access: {
    // Admins (Users) can read all; customers can only read themselves
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      if (req.user?.collection === 'customers') return { id: { equals: req.user.id } }
      return false
    },
    // Allow public registration
    create: () => true,
    update: ({ req }) => {
      if (req.user?.collection === 'users') return true
      if (req.user?.collection === 'customers') return { id: { equals: req.user.id } }
      return false
    },
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '姓名',
    },
    {
      name: 'phone',
      type: 'text',
      label: '手機號碼',
    },
    {
      name: 'birthday',
      type: 'date',
      label: '生日',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'gender',
      type: 'select',
      label: '性別',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '不透露', value: 'other' },
      ],
    },
    // Loyalty points (managed by system via PointTransactions)
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
      label: '可用點數',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: '由系統自動計算，請勿手動修改',
      },
    },
    {
      name: 'tier',
      type: 'select',
      defaultValue: 'regular',
      label: '會員等級',
      options: [
        { label: '一般會員', value: 'regular' },
        { label: '銀卡會員（累消 NT$3,000）', value: 'silver' },
        { label: '金卡會員（累消 NT$10,000）', value: 'gold' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'totalSpent',
      type: 'number',
      defaultValue: 0,
      label: '累計消費金額',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: '付款成功後自動累計',
      },
    },
    {
      name: 'marketingConsent',
      type: 'checkbox',
      defaultValue: false,
      label: '同意接收行銷通知',
    },
    // Shipping addresses (denormalized for simplicity)
    {
      name: 'defaultAddress',
      type: 'group',
      label: '預設收件地址',
      fields: [
        { name: 'recipient', type: 'text', label: '收件人' },
        { name: 'phone', type: 'text', label: '收件電話' },
        { name: 'zip', type: 'text', label: '郵遞區號', admin: { width: '30%' } },
        { name: 'city', type: 'text', label: '縣市', admin: { width: '35%' } },
        { name: 'district', type: 'text', label: '鄉鎮市區', admin: { width: '35%' } },
        { name: 'address', type: 'text', label: '詳細地址' },
      ],
    },
  ],
}
