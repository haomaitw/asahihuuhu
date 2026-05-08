import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // ── 維護模式 ──────────────────────────────────────────────────
    {
      name: 'maintenanceMode',
      type: 'group',
      label: '維護模式',
      admin: { description: '開啟後，前台所有頁面將顯示維護中畫面（管理員仍可正常使用後台）' },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: '開啟維護模式',
          defaultValue: false,
        },
        {
          name: 'message',
          type: 'textarea',
          label: '維護說明',
          localized: true,
          admin: { description: '顯示給訪客的說明文字' },
        },
      ],
    },
    // ── 聯絡資訊 ──────────────────────────────────────────────────
    {
      name: 'address',
      type: 'textarea',
      localized: true,
      admin: { description: '門市地址（各語言版本）' },
    },
    {
      name: 'phone',
      type: 'text',
      admin: { description: '聯絡電話，如 02-1234-5678' },
    },
    {
      name: 'lineId',
      type: 'text',
      admin: { description: 'LINE 官方帳號 ID，如 @asahihuuhu' },
    },
    {
      name: 'contact',
      type: 'text',
      localized: true,
      admin: { description: '聯絡方式說明（各語言，顯示於網站）' },
    },
    // ── 營業時間 ──────────────────────────────────────────────────
    {
      name: 'hoursWeekday',
      type: 'text',
      localized: true,
      admin: { description: '平日營業時間，如 週二至週五 11:00–18:00' },
    },
    {
      name: 'hoursWeekend',
      type: 'text',
      localized: true,
      admin: { description: '假日營業時間，如 週六、週日 10:00–19:00' },
    },
    {
      name: 'hoursClosed',
      type: 'text',
      localized: true,
      admin: { description: '公休說明，如 週一公休' },
    },
    // ── 地圖 ──────────────────────────────────────────────────────
    {
      name: 'googleMapsUrl',
      type: 'text',
      admin: { description: 'Google Maps 分享連結（讓顧客點擊導航）' },
    },
    {
      name: 'googleMapsEmbed',
      type: 'textarea',
      admin: { description: 'Google Maps 內嵌 iframe src（用於網站地圖顯示）' },
    },
    // ── 社群媒體 ──────────────────────────────────────────────────
    {
      name: 'facebookUrl',
      type: 'text',
      admin: { description: 'Facebook 粉絲專頁網址' },
    },
    {
      name: 'instagramUrl',
      type: 'text',
      admin: { description: 'Instagram 帳號網址' },
    },
    {
      name: 'copyright',
      type: 'text',
      admin: { description: '版權聲明文字（不含年份），如：ASAHI HUUHU. All Rights Reserved.' },
      defaultValue: 'ASAHI HUUHU. All Rights Reserved.',
    },
    // ── 黑貓宅急便寄件人設定 ─────────────────────────────────────
    {
      name: 'tcat',
      type: 'group',
      label: '黑貓宅急便寄件設定',
      admin: {
        description: '建立黑貓出貨單時使用的寄件人資料，請填寫與綠界物流申請時相同的資訊',
      },
      fields: [
        {
          name: 'senderName',
          type: 'text',
          label: '寄件人姓名',
          admin: { description: '如：朝日夫婦' },
        },
        {
          name: 'senderPhone',
          type: 'text',
          label: '寄件人電話',
          admin: { description: '如：0912345678' },
        },
        {
          name: 'senderCellPhone',
          type: 'text',
          label: '寄件人手機',
        },
        {
          name: 'senderZip',
          type: 'text',
          label: '寄件人郵遞區號',
          defaultValue: '251',
          admin: { description: '淡水區為 251' },
        },
        {
          name: 'senderAddress',
          type: 'text',
          label: '寄件人地址',
          defaultValue: '新北市淡水區中正路233-3號',
        },
        {
          name: 'temperature',
          type: 'select',
          label: '配送溫層',
          defaultValue: '0003',
          options: [
            { label: '常溫', value: '0001' },
            { label: '冷藏（7°C 以下）', value: '0002' },
            { label: '冷凍（-18°C 以下）', value: '0003' },
          ],
          admin: { description: '冰品建議使用冷凍配送' },
        },
        {
          name: 'distance',
          type: 'select',
          label: '配送距離',
          defaultValue: '00',
          options: [
            { label: '全台（00）', value: '00' },
            { label: '同縣市（01）', value: '01' },
          ],
        },
      ],
    },
    // ── 網站 SEO ─────────────────────────────────────────────────
    {
      name: 'seoDescription',
      type: 'textarea',
      localized: true,
      admin: { description: '網站 SEO 描述（顯示於 Google 搜尋結果）' },
    },
  ],
};
