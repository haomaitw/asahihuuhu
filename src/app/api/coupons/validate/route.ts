import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.toUpperCase().trim()
  const amount = Number(searchParams.get('amount') ?? 0)

  if (!code) {
    return NextResponse.json({ valid: false, error: '請輸入折扣碼' }, { status: 400 })
  }

  try {
    const snap = await adminDb.collection('coupons').where('code', '==', code).limit(1).get()
    if (snap.empty) {
      return NextResponse.json({ valid: false, error: '折扣碼不存在或已停用' })
    }

    const coupon = snap.docs[0].data() as any
    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: '折扣碼不存在或已停用' })
    }

    const now = new Date()
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json({ valid: false, error: '折扣碼尚未開始' })
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json({ valid: false, error: '折扣碼已過期' })
    }
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: '折扣碼已達使用上限' })
    }
    if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
      return NextResponse.json({ valid: false, error: `訂單需滿 NT$${coupon.minOrderAmount} 才可使用` })
    }

    let discountAmount = 0
    if (coupon.type === 'percentage') {
      discountAmount = Math.floor((amount * coupon.value) / 100)
      if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount)
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = Math.min(coupon.value, amount)
    }

    return NextResponse.json({
      valid: true,
      coupon: { code: coupon.code, type: coupon.type, value: coupon.value, description: coupon.description },
      discountAmount,
      finalAmount: Math.max(0, amount - discountAmount),
    })
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
