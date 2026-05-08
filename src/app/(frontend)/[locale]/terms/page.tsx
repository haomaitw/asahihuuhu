import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: '服務條款 | 朝日夫婦',
}

export default async function TermsPage({
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
            TERMS OF SERVICE
          </p>
          <h1 className="font-sans font-light text-4xl tracking-wide text-ink">
            服務條款
          </h1>
          <p className="text-sm text-ink/40 mt-3">最後更新：2025年1月</p>
        </header>

        <div className="space-y-10 text-ink/80 leading-relaxed">

          <div>
            <p className="text-sm text-ink/60">
              歡迎使用朝日夫婦網路商城（asahihuuhu.com）。請在購物前詳細閱讀以下服務條款。
              使用本網站即表示您同意遵守本條款。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              一、商品說明
            </h2>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '本網站所有商品均為朝日夫婦自製或嚴選之職人食品及周邊商品。',
                '商品圖片僅供參考，實際外觀可能因拍攝光線或季節食材差異略有不同。',
                '食品類商品（冷凍刨冰原料、醬料等）為生鮮冷凍品，請注意保存期限及方式。',
                '商品上架數量有限，搶購熱門商品時建議盡早下單，售完為止。',
                '我們保留更動商品內容、規格及售價的權利，並以訂單成立當下顯示的資訊為準。',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              二、訂購流程
            </h2>
            <ol className="text-sm space-y-3 list-none pl-0 counter-reset-item">
              {[
                '選擇商品並加入購物車',
                '填寫收件資訊（姓名、電話、地址）',
                '選擇付款方式並完成付款',
                '收到訂單確認通知（電子郵件）',
                '等待出貨通知及黑貓宅急便追蹤資訊',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sea-100 text-sea-600 text-[10px] flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="text-sm mt-4 text-ink/60">
              訂單一旦確認付款成功即視為成立。若因系統異常導致重複付款，請立即聯繫我們處理退款。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              三、付款方式
            </h2>
            <p className="text-sm mb-3">
              本網站透過<strong className="text-ink">綠界科技（ECPay）</strong>提供安全的線上付款服務，支援：
            </p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '信用卡（Visa / Mastercard / JCB）',
                'ATM 虛擬帳號轉帳',
                '超商代碼繳費（7-11、全家、萊爾富、OK）',
                'LINE Pay',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3 text-ink/60">
              ATM 轉帳及超商代碼付款請於取得繳費資訊後 <strong className="text-ink">3 日內</strong> 完成，
              逾期未付款訂單將自動取消。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              四、配送方式與時效
            </h2>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '本網站所有商品以黑貓宅急便冷凍配送（-18°C 以下），確保食品品質。',
                '配送範圍：台灣本島及離島（部分偏遠地區需加收費用）。',
                '配送費用：每筆訂單運費 NT$120（訂單滿特定金額可享免運，依活動公告為準）。',
                '出貨時效：付款成功後 2-3 個工作天出貨，配送約需 1-3 個工作天，全程約 3-5 個工作天。',
                '我們將於出貨後以電子郵件或簡訊提供黑貓宅急便追蹤號碼。',
                '颱風、天災等不可抗力因素可能造成配送延誤，敬請見諒。',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              五、商品品質保證
            </h2>
            <p className="text-sm mb-3">
              我們保證所有商品出貨時均符合食品安全衛生標準，並以冷凍保鮮方式配送。
              若收到商品有以下情形，請於 <strong className="text-ink">24 小時內</strong> 拍照存證並聯繫我們：
            </p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '商品於運送過程中損壞或變質',
                '收到商品與訂購內容不符',
                '冷凍商品於送達時已完全解凍且無法使用',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              六、會員積點
            </h2>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '完成訂單付款後，將依消費金額給予對應積點（每 NT$100 得 1 點，以此類推）。',
                '積點可於下次購物時折抵消費（1 點 = NT$1）。',
                '積點有效期限為取得後 2 年，逾期歸零。',
                '積點不可轉讓或兌換現金。',
                '如訂單發生退款，已給予之積點將同步扣除。',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              七、智慧財產權
            </h2>
            <p className="text-sm text-ink/60">
              本網站所有內容，包含但不限於文字、圖片、影片、商標、Logo 及設計，均為朝日夫婦所有或授權使用，
              受中華民國著作權法保護。未經書面授權，禁止複製、轉載或作商業使用。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              八、準據法及管轄
            </h2>
            <p className="text-sm text-ink/60">
              本服務條款之解釋及適用，以中華民國（台灣）法律為準據法。
              因本條款或交易產生之糾紛，雙方同意以台灣新北地方法院為第一審管轄法院。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              九、聯絡我們
            </h2>
            <div className="text-sm space-y-1 bg-white border border-paper-200 rounded-2xl p-5">
              <p><strong className="text-ink">朝日夫婦</strong></p>
              <p className="text-ink/60">新北市淡水區中正路 233-3 號 1 樓</p>
              <p className="text-ink/60">電話：0903-290-575</p>
              <p className="text-ink/60">Facebook / Instagram：@asahihuuhu</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
