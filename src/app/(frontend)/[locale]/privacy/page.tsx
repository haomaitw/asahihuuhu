import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: '隱私權政策 | 朝日夫婦',
}

export default async function PrivacyPage({
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
            PRIVACY POLICY
          </p>
          <h1 className="font-sans font-light text-4xl tracking-wide text-ink">
            隱私權政策
          </h1>
          <p className="text-sm text-ink/40 mt-3">最後更新：2025年1月</p>
        </header>

        <div className="prose-policy space-y-10 text-ink/80 leading-relaxed">

          <div>
            <p className="text-sm text-ink/60">
              朝日夫婦（以下簡稱「本公司」、「我們」）非常重視您的個人隱私。本政策說明我們如何收集、使用及保護您在使用
              asahihuuhu.com（以下簡稱「本網站」）時所提供的個人資料。請您在使用本網站前，詳細閱讀本隱私權政策。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              一、收集的個人資訊
            </h2>
            <p className="text-sm mb-3">當您在本網站進行購物、建立帳號或與我們聯繫時，我們可能收集以下資訊：</p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '姓名：用於訂單確認及物流配送',
                '電子郵件地址：用於帳號驗證、訂單通知及客服聯繫',
                '手機號碼：用於物流配送聯繫及緊急通知',
                '收件地址：用於商品配送',
                '訂單記錄：包含購買商品、金額、日期等交易資訊',
                '會員積點資料：用於會員回饋計畫',
                '瀏覽行為資料：包含 Cookie、IP 位址等技術資訊（詳見 Cookie 政策）',
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
              二、使用目的
            </h2>
            <p className="text-sm mb-3">我們收集您的個人資料僅用於以下目的：</p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '處理並履行您的訂單，包含出貨通知與物流追蹤',
                '提供客戶服務與售後支援',
                '管理您的會員帳號及積點',
                '寄送交易收據及訂單確認信',
                '依法律規定保存交易記錄',
                '改善網站功能與用戶體驗（使用匿名化分析資料）',
                '在您同意的情況下，發送最新消息及促銷訊息',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3 text-ink/60">
              我們不會將您的個人資料出售、出租或以其他方式提供給第三方，除非獲得您的明確同意，或法律有所規定。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              三、資料保護
            </h2>
            <p className="text-sm mb-3">
              我們採用業界標準的安全技術保護您的個人資料，包含：
            </p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                'SSL/TLS 加密傳輸，確保資料在傳輸過程中的安全',
                '密碼以單向雜湊加密存儲，我們無法讀取您的明文密碼',
                '定期進行安全性評估及系統更新',
                '限制僅授權人員可存取您的個人資料',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3 text-ink/60">
              訂單及交易資料將保存 <strong className="text-ink">3 年</strong>，以符合台灣消費者保護法及商業帳簿相關法規的規定。
              帳號資料於您申請刪除後 30 天內完成銷毀。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              四、Cookie 政策
            </h2>
            <p className="text-sm mb-3">
              本網站使用 Cookie 及類似技術以提升您的瀏覽體驗。我們使用的 Cookie 類型包含：
            </p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '必要性 Cookie：維持網站正常運作所需，例如購物車及登入狀態',
                '功能性 Cookie：記住您的語言偏好設定',
                '分析性 Cookie：使用匿名資料了解網站使用狀況，幫助我們持續改善',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3 text-ink/60">
              您可以透過瀏覽器設定管理或拒絕 Cookie，但部分網站功能可能因此受限。
            </p>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              五、第三方服務
            </h2>
            <p className="text-sm mb-3">
              本網站使用以下第三方服務，各服務均有其獨立的隱私權政策：
            </p>
            <ul className="text-sm space-y-3 list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                <span>
                  <strong className="text-ink">綠界科技（ECPay）</strong>：我們使用綠界科技處理線上付款。
                  您的付款資訊（信用卡號、銀行帳號等）直接由綠界科技處理，本公司不會儲存您的完整付款資訊。
                  請參閱<a href="https://www.ecpay.com.tw/Privacy" target="_blank" rel="noopener noreferrer" className="text-sea-500 hover:underline ml-1">綠界科技隱私權政策</a>。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sea-400 mt-0.5 shrink-0">·</span>
                <span>
                  <strong className="text-ink">黑貓宅急便（T-CAT）</strong>：我們將您的收件資料（姓名、電話、地址）
                  提供給黑貓宅急便以完成商品配送。
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans font-light text-xl tracking-wide text-ink mb-4 pb-2 border-b border-paper-200">
              六、您的權利
            </h2>
            <p className="text-sm mb-3">
              根據台灣個人資料保護法，您對您的個人資料享有以下權利：
            </p>
            <ul className="text-sm space-y-2 list-none pl-0">
              {[
                '查詢或請求閱覽您的個人資料',
                '請求製給複製本',
                '請求補充或更正',
                '請求停止蒐集、處理或利用',
                '請求刪除（於法律允許範圍內）',
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
              七、聯絡方式
            </h2>
            <p className="text-sm mb-3">
              若您對本隱私權政策有任何疑問，或欲行使個人資料相關權利，請透過以下方式與我們聯繫：
            </p>
            <div className="text-sm space-y-1 bg-white border border-paper-200 rounded-2xl p-5">
              <p><strong className="text-ink">朝日夫婦</strong></p>
              <p className="text-ink/60">新北市淡水區中正路 233-3 號 1 樓</p>
              <p className="text-ink/60">電話：0903-290-575</p>
              <p className="text-ink/60">Facebook：
                <a href="https://www.facebook.com/asahihuuhu" target="_blank" rel="noopener noreferrer" className="text-sea-500 hover:underline">
                  facebook.com/asahihuuhu
                </a>
              </p>
              <p className="text-ink/60">Instagram：
                <a href="https://www.instagram.com/asahihuuhu" target="_blank" rel="noopener noreferrer" className="text-sea-500 hover:underline">
                  @asahihuuhu
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
