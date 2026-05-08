import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: '退換貨政策 | 朝日夫婦',
}

export default async function ReturnsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <section className="bg-paper-50 min-h-dvh py-24">
      <div className="container-content max-w-3xl">

        <header className="mb-12">
          <p className="font-sans font-light text-xs tracking-[0.3em] text-ink/40 uppercase mb-4">
            RETURNS &amp; EXCHANGES
          </p>
          <h1 className="font-sans font-light text-4xl tracking-wide text-ink">
            退換貨政策
          </h1>
          <p className="text-sm text-ink/40 mt-3">最後更新：2025年1月</p>
        </header>

        <div className="space-y-10 text-ink/80 leading-relaxed">

          <div className="bg-sea-50 border border-sea-100 rounded-2xl px-6 py-5">
            <p className="text-sm text-sea-800">
              依據<strong>消費者保護法第19條</strong>，您享有商品到貨後
              <strong> 7 日猶豫期</strong>，得以退回商品（食品類例外，詳見下方說明）。
              猶豫期非試用期，商品需保持完整原狀。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              一、一般商品退貨（7 日猶豫期）
            </h2>
            <p className="text-sm mb-3">
              非食品類周邊商品（如杯子、周邊商品等），於收到後 7 日內可申請退貨，
              需符合以下條件：
            </p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '商品未使用，且維持完整原狀（含包裝、吊牌、配件）',
                '非因消費者使用不當造成的損壞',
                '退貨時需附上原始收據或訂單編號',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3 text-ink/60">
              退貨運費由買方負擔，確認退貨商品符合條件後，我們將於 7 個工作天內辦理退款。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              二、食品類商品（不適用猶豫期）
            </h2>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-4">
              <p className="text-sm text-amber-800">
                依消費者保護法第19條第1項但書，<strong>易於腐敗、保存期限較短或解凍後即不適合再冷凍之食品</strong>，
                不適用7日猶豫期退貨規定。
              </p>
            </div>
            <p className="text-sm mb-3">
              以下商品屬食品類，<strong className="text-ink">出貨後恕不接受退換貨申請</strong>：
            </p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '各式冷凍刨冰原料包（芒果、草莓等水果磚）',
                '手工醬料及糖漿',
                '其他冷凍或冷藏食品',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3 text-ink/60">
              請在下單前確認商品規格及內容物，如有疑問歡迎先行聯繫我們。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              三、瑕疵品及錯誤出貨
            </h2>
            <p className="text-sm mb-3">
              若收到以下情形，<strong className="text-ink">請於收貨後 24 小時內</strong>拍照存證並聯繫我們：
            </p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '商品於運送中損壞（凹陷、破裂、滲漏等）',
                '收到商品與訂單內容不符（品項錯誤、數量短缺）',
                '冷凍食品送達時已完全解凍且有異味或變色',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3 text-ink/60">
              提供清晰照片後，我們將盡快為您安排補寄或退款，補寄運費由本公司全額負擔。
              超過 24 小時後申請之瑕疵品案件，恕無法受理。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              四、退貨流程
            </h2>
            <ol className="text-sm space-y-4 list-none pl-0">
              {[
                {
                  step: '聯繫我們',
                  desc: '透過 Facebook / Instagram 私訊，或來電 0903-290-575，說明退貨原因並提供訂單編號及照片。',
                },
                {
                  step: '等待確認',
                  desc: '我們將於 1-2 個工作天內回覆，確認退貨資格及寄件方式。',
                },
                {
                  step: '寄回商品',
                  desc: '確認後請依指示將商品寄至指定地址（新北市淡水區中正路 233-3 號），請使用有追蹤號碼的寄件方式。',
                },
                {
                  step: '完成退款',
                  desc: '確認商品到貨且符合退貨條件後，7 個工作天內辦理退款至原付款方式。',
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sea-100 text-sea-600 text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{item.step}</p>
                    <p className="text-ink/60 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              五、聯絡我們
            </h2>
            <div className="text-sm space-y-2 bg-white border border-paper-200 rounded-2xl p-5">
              <p><strong className="text-ink">朝日夫婦 退換貨客服</strong></p>
              <p className="text-ink/60">電話：<a href="tel:0903290575" className="text-sea-500 hover:underline">0903-290-575</a></p>
              <p className="text-ink/60">
                Facebook：
                <a href="https://www.facebook.com/asahihuuhu" target="_blank" rel="noopener noreferrer" className="text-sea-500 hover:underline">
                  facebook.com/asahihuuhu
                </a>
              </p>
              <p className="text-ink/60">
                Instagram：
                <a href="https://www.instagram.com/asahihuuhu" target="_blank" rel="noopener noreferrer" className="text-sea-500 hover:underline">
                  @asahihuuhu
                </a>
              </p>
              <p className="text-xs text-ink/40 mt-3">
                客服回覆時間：週二至週日 12:00–18:00（週一及國定假日休息）
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
