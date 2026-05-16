export type Locale = 'zh-TW' | 'en' | 'ja'

export type LocalizedString = {
  'zh-TW'?: string
  en?: string
  ja?: string
}

export type Product = {
  id: string
  name: LocalizedString
  slug: string
  price: number
  comparePrice?: number
  images: string[]
  category: string         // product-categories doc id
  categoryName?: string    // denormalized display name
  shortDescription?: LocalizedString
  description?: any        // rich text stored as HTML or structured JSON
  trackStock: boolean
  stock: number
  lowStockThreshold: number
  isAvailable: boolean
  seo?: { title?: LocalizedString; description?: LocalizedString }
  createdAt: string
  updatedAt: string
}

export type Order = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: 'pending_payment' | 'paid' | 'failed' | 'refunded'
  fulfillmentStatus: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: { zip: string; city: string; district: string; address: string }
  shippingCarrier?: string
  trackingNumber?: string
  shippedAt?: string
  items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }>
  subtotal: number
  shippingFee: number
  couponCode?: string
  couponDiscount: number
  pointsRedeemed: number
  totalAmount: number
  ecpayTradeNo?: string
  paidAt?: string
  tcatOrderNo?: string
  note?: string
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export type NewsItem = {
  id: string
  title: LocalizedString
  slug: string
  date: string
  status: 'published' | 'draft'
  body?: any
  createdAt: string
  updatedAt: string
}

export type FaqItem = {
  id: string
  question: LocalizedString
  answer: LocalizedString
  order: number
}

export type ProductCategory = {
  id: string
  name: LocalizedString
  slug: string
  order: number
}

export type AdminUser = {
  id: string
  email: string
  name?: string
  role: 'super-admin' | 'admin' | 'staff'
  createdAt: string
}

export type SiteSettings = {
  maintenanceMode?: { enabled: boolean; message?: LocalizedString }
  address?: LocalizedString
  phone?: string
  lineId?: string
  contact?: LocalizedString
  hoursWeekday?: LocalizedString
  hoursWeekend?: LocalizedString
  hoursClosed?: LocalizedString
  googleMapsUrl?: string
  googleMapsEmbed?: string
  facebookUrl?: string
  instagramUrl?: string
  copyright?: string
  tcat?: {
    senderName?: string
    senderPhone?: string
    senderCellPhone?: string
    senderZip?: string
    senderAddress?: string
    temperature?: string
    distance?: string
  }
  emailSettings?: {
    fromAddress?: string
    fromName?: string
    orderConfirmationEnabled?: boolean
    replyTo?: string
  }
  seoDescription?: LocalizedString
}

export type HomePage = {
  tagline1?: LocalizedString
  tagline2?: LocalizedString
  heroLede?: LocalizedString
  heroVideo?: string
  heroPoster?: string
  featuredProducts?: string[]
  seasonalVideo?: string
  seasonalImage?: string
  seasonalTitle?: LocalizedString
  seasonalDesc?: LocalizedString
}

export type ShopPage = {
  heroTitle?: LocalizedString
  heroSubtitle?: LocalizedString
  heroImage?: string
  trustItems?: Array<{ title?: LocalizedString; description?: LocalizedString }>
}
