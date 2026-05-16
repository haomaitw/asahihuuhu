'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

const LOCALES = [
  { key: 'zh-TW', label: '中文' },
  { key: 'en',    label: 'EN'   },
  { key: 'ja',    label: 'JA'   },
] as const
type LocaleKey = (typeof LOCALES)[number]['key']

type LocalizedStr = Record<LocaleKey, string>

const TABS = [
  { key: 'maintenance', label: '⚠ 維護模式'   },
  { key: 'basic',       label: '基本資料'     },
  { key: 'hours',       label: '營業時間'     },
  { key: 'tcat',        label: '黑貓出貨設定' },
  { key: 'email',       label: 'Email 設定'   },
  { key: 'seo',         label: 'SEO'          },
] as const
type TabKey = (typeof TABS)[number]['key']

type TcatState = {
  senderName:      string
  senderPhone:     string
  senderCellPhone: string
  senderZip:       string
  senderAddress:   string
  temperature:     string
  distance:        string
}

type EmailSettingsState = {
  fromAddress:               string
  fromName:                  string
  orderConfirmationEnabled:  boolean
  replyTo:                   string
}

type MaintenanceState = {
  enabled: boolean
  message: LocalizedStr
}

type FormState = {
  // non-localized
  maintenanceMode: MaintenanceState
  phone:           string
  lineId:          string
  googleMapsUrl:   string
  googleMapsEmbed: string
  facebookUrl:     string
  instagramUrl:    string
  tcat:            TcatState
  emailSettings:   EmailSettingsState
  // localized
  address:         LocalizedStr
  contact:         LocalizedStr
  hoursWeekday:    LocalizedStr
  hoursWeekend:    LocalizedStr
  hoursClosed:     LocalizedStr
  seoDescription:  LocalizedStr
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyLocalized(): LocalizedStr {
  return { 'zh-TW': '', en: '', ja: '' }
}

function initForm(data?: any): FormState {
  return {
    maintenanceMode: {
      enabled: data?.maintenanceMode?.enabled ?? false,
      message: {
        'zh-TW': data?.maintenanceMode?.message ?? '',
        en:      '',
        ja:      '',
      },
    },
    phone:           data?.phone           ?? '',
    lineId:          data?.lineId          ?? '',
    googleMapsUrl:   data?.googleMapsUrl   ?? '',
    googleMapsEmbed: data?.googleMapsEmbed ?? '',
    facebookUrl:     data?.facebookUrl     ?? '',
    instagramUrl:    data?.instagramUrl    ?? '',
    tcat: {
      senderName:      data?.tcat?.senderName      ?? '朝日夫婦',
      senderPhone:     data?.tcat?.senderPhone      ?? '',
      senderCellPhone: data?.tcat?.senderCellPhone  ?? '',
      senderZip:       data?.tcat?.senderZip        ?? '251',
      senderAddress:   data?.tcat?.senderAddress    ?? '新北市淡水區中正路233-3號',
      temperature:     data?.tcat?.temperature      ?? '0003',
      distance:        data?.tcat?.distance         ?? '00',
    },
    emailSettings: {
      fromAddress:              data?.emailSettings?.fromAddress              ?? '',
      fromName:                 data?.emailSettings?.fromName                 ?? '朝日夫婦',
      orderConfirmationEnabled: data?.emailSettings?.orderConfirmationEnabled ?? true,
      replyTo:                  data?.emailSettings?.replyTo                  ?? '',
    },
    address:        emptyLocalized(),
    contact:        emptyLocalized(),
    hoursWeekday:   emptyLocalized(),
    hoursWeekend:   emptyLocalized(),
    hoursClosed:    emptyLocalized(),
    seoDescription: emptyLocalized(),
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-5 py-4 border-b border-adm-border-subtle">
      <h2 className="text-sm font-semibold text-adm-text-primary">{title}</h2>
      {description && <p className="text-xs text-adm-text-tertiary mt-0.5">{description}</p>}
    </div>
  )
}

function Textarea({
  label,
  description,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label?: string
  description?: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs uppercase tracking-wider font-medium text-adm-text-secondary">
          {label}
        </label>
      )}
      {description && <p className="text-xs text-adm-text-tertiary -mt-1">{description}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary',
          'placeholder:text-adm-text-tertiary resize-none',
          'transition-colors duration-150',
          'focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15',
        )}
      />
    </div>
  )
}

function SelectField({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string
  description?: string
  value: string
  onChange: (val: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wider font-medium text-adm-text-secondary">
        {label}
      </label>
      {description && <p className="text-xs text-adm-text-tertiary -mt-1">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 text-sm text-adm-text-primary',
          'transition-colors duration-150',
          'focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15',
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function LocaleTabs({
  locale,
  onSelect,
}: {
  locale: LocaleKey
  onSelect: (l: LocaleKey) => void
}) {
  return (
    <div className="flex gap-1 border-b border-adm-border-subtle px-5">
      {LOCALES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={cn(
            'px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors',
            locale === key
              ? 'border-adm-brand-500 text-adm-brand-600'
              : 'border-transparent text-adm-text-tertiary hover:text-adm-text-primary',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function SiteSettingsForm({ initialData }: { initialData?: any }) {
  const [form, setForm]     = React.useState<FormState>(() => initForm(initialData))
  const [tab, setTab]       = React.useState<TabKey>('maintenance')
  const [locale, setLocale] = React.useState<LocaleKey>('zh-TW')
  const [loading, setLoading] = React.useState(false)

  // Hydrate localized fields from API on mount
  React.useEffect(() => {
    Promise.all(
      LOCALES.map(async ({ key }) => {
        const r = await fetch(`/api/admin/globals/site-settings?locale=${key}&depth=0`)
        if (!r.ok) return { key, data: null }
        return { key, data: await r.json() }
      }),
    ).then((results) => {
      setForm((prev) => {
        const next = { ...prev }
        // non-localized — take from zh-TW response (same in all)
        const base = results.find((r) => r.key === 'zh-TW')?.data
        if (base) {
          // Maintenance mode (non-localized enabled flag)
          next.maintenanceMode = {
            enabled: base.maintenanceMode?.enabled ?? prev.maintenanceMode.enabled,
            message: { ...prev.maintenanceMode.message },
          }
          next.phone           = base.phone           ?? prev.phone
          next.lineId          = base.lineId          ?? prev.lineId
          next.googleMapsUrl   = base.googleMapsUrl   ?? prev.googleMapsUrl
          next.googleMapsEmbed = base.googleMapsEmbed ?? prev.googleMapsEmbed
          next.facebookUrl     = base.facebookUrl     ?? prev.facebookUrl
          next.instagramUrl    = base.instagramUrl    ?? prev.instagramUrl
          if (base.tcat) {
            next.tcat = {
              senderName:      base.tcat.senderName      ?? prev.tcat.senderName,
              senderPhone:     base.tcat.senderPhone      ?? prev.tcat.senderPhone,
              senderCellPhone: base.tcat.senderCellPhone  ?? prev.tcat.senderCellPhone,
              senderZip:       base.tcat.senderZip        ?? prev.tcat.senderZip,
              senderAddress:   base.tcat.senderAddress    ?? prev.tcat.senderAddress,
              temperature:     base.tcat.temperature      ?? prev.tcat.temperature,
              distance:        base.tcat.distance         ?? prev.tcat.distance,
            }
          }
          if (base.emailSettings) {
            next.emailSettings = {
              fromAddress:              base.emailSettings.fromAddress              ?? prev.emailSettings.fromAddress,
              fromName:                 base.emailSettings.fromName                 ?? prev.emailSettings.fromName,
              orderConfirmationEnabled: base.emailSettings.orderConfirmationEnabled ?? prev.emailSettings.orderConfirmationEnabled,
              replyTo:                  base.emailSettings.replyTo                  ?? prev.emailSettings.replyTo,
            }
          }
        }
        // localized fields
        for (const { key } of LOCALES) {
          const d = results.find((r) => r.key === key)?.data
          if (!d) continue
          const k = key as LocaleKey
          next.address        = { ...next.address,        [k]: d.address        ?? '' }
          next.contact        = { ...next.contact,        [k]: d.contact        ?? '' }
          next.hoursWeekday   = { ...next.hoursWeekday,   [k]: d.hoursWeekday   ?? '' }
          next.hoursWeekend   = { ...next.hoursWeekend,   [k]: d.hoursWeekend   ?? '' }
          next.hoursClosed    = { ...next.hoursClosed,    [k]: d.hoursClosed    ?? '' }
          next.seoDescription = { ...next.seoDescription, [k]: d.seoDescription ?? '' }
          // Localized maintenance message
          next.maintenanceMode.message = {
            ...next.maintenanceMode.message,
            [k]: d.maintenanceMode?.message ?? '',
          }
        }
        return next
      })
    }).catch(() => {/* ignore */})
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setLoading(true)
    try {
      // Non-localized fields + tcat — spread into each per-locale request
      const nonLocalizedBody = {
        maintenanceMode: { enabled: form.maintenanceMode.enabled },
        phone:           form.phone,
        lineId:          form.lineId,
        googleMapsUrl:   form.googleMapsUrl,
        googleMapsEmbed: form.googleMapsEmbed,
        facebookUrl:     form.facebookUrl,
        instagramUrl:    form.instagramUrl,
        tcat:            form.tcat,
      }

      // Per-locale POSTs for localized fields
      await Promise.all(
        LOCALES.map(({ key }) =>
          fetch(`/api/admin/globals/site-settings?locale=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...nonLocalizedBody,
              // Strip empty strings from email-type fields to avoid Payload validation errors
              emailSettings: {
                ...form.emailSettings,
                fromAddress: form.emailSettings.fromAddress || undefined,
                replyTo:     form.emailSettings.replyTo     || undefined,
              },
              maintenanceMode: {
                enabled: form.maintenanceMode.enabled,
                message: form.maintenanceMode.message[key],
              },
              address:        form.address[key],
              contact:        form.contact[key],
              hoursWeekday:   form.hoursWeekday[key],
              hoursWeekend:   form.hoursWeekend[key],
              hoursClosed:    form.hoursClosed[key],
              seoDescription: form.seoDescription[key],
            }),
          }).then(async (r) => {
            if (!r.ok) {
              const body = await r.json().catch(() => ({}))
              const msg = body?.errors?.[0]?.message ?? body?.message ?? `HTTP ${r.status}`
              throw new Error(msg)
            }
          }),
        ),
      )

      toast.success('設定已儲存')
    } catch (err: any) {
      toast.error(`儲存失敗：${err?.message ?? '請稍後再試'}`)
    } finally {
      setLoading(false)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setLoc = (field: keyof Pick<FormState, 'address' | 'contact' | 'hoursWeekday' | 'hoursWeekend' | 'hoursClosed' | 'seoDescription'>, val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  const setField = (field: keyof Omit<FormState, 'tcat' | 'address' | 'contact' | 'hoursWeekday' | 'hoursWeekend' | 'hoursClosed' | 'seoDescription'>) =>
    (val: string) => setForm((p) => ({ ...p, [field]: val }))

  const setTcat = (field: keyof TcatState) =>
    (val: string) => setForm((p) => ({ ...p, tcat: { ...p.tcat, [field]: val } }))

  const setEmail = (field: keyof EmailSettingsState) =>
    (val: string | boolean) => setForm((p) => ({ ...p, emailSettings: { ...p.emailSettings, [field]: val } }))

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">網站設定</h1>
        <Button variant="primary" size="md" loading={loading} onClick={handleSave}>
          儲存設定
        </Button>
      </div>

      {/* Top-level tabs */}
      <div className="flex gap-0.5 border-b border-adm-border-subtle">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === key
                ? 'border-adm-brand-500 text-adm-brand-600'
                : 'border-transparent text-adm-text-tertiary hover:text-adm-text-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: 維護模式 ──────────────────────────────────────────── */}
      {tab === 'maintenance' && (
        <div className="space-y-4">
          {/* Status banner */}
          <div className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-3 border text-sm font-medium',
            form.maintenanceMode.enabled
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700',
          )}>
            <span className={cn(
              'inline-block h-2.5 w-2.5 rounded-full shrink-0',
              form.maintenanceMode.enabled ? 'bg-red-500 animate-pulse' : 'bg-green-500',
            )} />
            {form.maintenanceMode.enabled
              ? '⚠ 維護模式已開啟 — 訪客目前無法瀏覽前台'
              : '✓ 前台正常運作中'}
          </div>

          <Card>
            <SectionHeader
              title="維護模式開關"
              description="開啟後，所有前台頁面將顯示維護畫面。後台管理員不受影響。"
            />
            <CardContent className="p-5 space-y-5">
              {/* Big toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-adm-text-primary">開啟維護模式</p>
                  <p className="text-xs text-adm-text-tertiary mt-0.5">
                    儲存後立即生效（約 30 秒快取刷新）
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.maintenanceMode.enabled}
                  onClick={() => setForm((p) => ({
                    ...p,
                    maintenanceMode: { ...p.maintenanceMode, enabled: !p.maintenanceMode.enabled },
                  }))}
                  className={cn(
                    'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-adm-brand-500 focus:ring-offset-2',
                    form.maintenanceMode.enabled ? 'bg-red-500' : 'bg-adm-border-default',
                  )}
                >
                  <span className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
                    form.maintenanceMode.enabled ? 'translate-x-6' : 'translate-x-1',
                  )} />
                </button>
              </div>

              {/* Localized maintenance message */}
              <div>
                <LocaleTabs locale={locale} onSelect={setLocale} />
                <div className="pt-4">
                  <Textarea
                    label={`維護說明訊息（${locale}）`}
                    description="顯示給訪客的說明文字，留空使用預設訊息"
                    value={form.maintenanceMode.message[locale]}
                    onChange={(val) => setForm((p) => ({
                      ...p,
                      maintenanceMode: {
                        ...p.maintenanceMode,
                        message: { ...p.maintenanceMode.message, [locale]: val },
                      },
                    }))}
                    placeholder={
                      locale === 'zh-TW'
                        ? '網站目前進行維護，預計於 XX 日 XX 時恢復。感謝您的耐心等候。'
                        : 'We are currently performing maintenance. Please check back soon.'
                    }
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: 基本資料 ──────────────────────────────────────────── */}
      {tab === 'basic' && (
        <div className="space-y-4">
          <Card>
            <SectionHeader title="聯絡資訊" />
            <CardContent className="p-5 space-y-4">
              <Input
                label="電話"
                value={form.phone}
                onChange={(e) => setField('phone')(e.target.value)}
                placeholder="02-1234-5678"
              />
              <Input
                label="LINE ID"
                value={form.lineId}
                onChange={(e) => setField('lineId')(e.target.value)}
                placeholder="@asahihuuhu"
              />
            </CardContent>
          </Card>

          <Card>
            <SectionHeader title="社群媒體" />
            <CardContent className="p-5 space-y-4">
              <Input
                label="Facebook URL"
                value={form.facebookUrl}
                onChange={(e) => setField('facebookUrl')(e.target.value)}
                placeholder="https://facebook.com/..."
              />
              <Input
                label="Instagram URL"
                value={form.instagramUrl}
                onChange={(e) => setField('instagramUrl')(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </CardContent>
          </Card>

          <Card>
            <SectionHeader
              title="Google 地圖"
              description="讓顧客導航到門市的地圖設定"
            />
            <CardContent className="p-5 space-y-4">
              <Input
                label="Google Maps 分享連結"
                value={form.googleMapsUrl}
                onChange={(e) => setField('googleMapsUrl')(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
              />
              <Textarea
                label="Google Maps 嵌入 iframe src"
                description="貼入 Google Maps「嵌入地圖」的 iframe src 網址"
                value={form.googleMapsEmbed}
                onChange={setField('googleMapsEmbed')}
                placeholder="https://www.google.com/maps/embed?pb=..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: 營業時間 ─────────────────────────────────────────── */}
      {tab === 'hours' && (
        <div className="space-y-4">
          <Card>
            <SectionHeader
              title="地址與聯絡"
              description="依語言分別設定，顯示於網站各語言版本"
            />
            <LocaleTabs locale={locale} onSelect={setLocale} />
            <CardContent className="p-5 space-y-4">
              <Textarea
                label={`地址（${locale}）`}
                value={form.address[locale]}
                onChange={(val) => setLoc('address', val)}
                placeholder={locale === 'zh-TW' ? '251新北市淡水區中正路233-3號' : 'Address...'}
                rows={2}
              />
              <Input
                label={`聯絡方式（${locale}）`}
                value={form.contact[locale]}
                onChange={(e) => setLoc('contact', e.target.value)}
                placeholder={locale === 'zh-TW' ? '電話或 LINE' : 'Contact info...'}
              />
            </CardContent>
          </Card>

          <Card>
            <SectionHeader title="營業時間" />
            <LocaleTabs locale={locale} onSelect={setLocale} />
            <CardContent className="p-5 space-y-4">
              <Input
                label={`平日營業時間（${locale}）`}
                value={form.hoursWeekday[locale]}
                onChange={(e) => setLoc('hoursWeekday', e.target.value)}
                placeholder={locale === 'zh-TW' ? '週二至週五 11:00–18:00' : 'Tue–Fri 11:00–18:00'}
              />
              <Input
                label={`假日營業時間（${locale}）`}
                value={form.hoursWeekend[locale]}
                onChange={(e) => setLoc('hoursWeekend', e.target.value)}
                placeholder={locale === 'zh-TW' ? '週六、週日 10:00–19:00' : 'Sat–Sun 10:00–19:00'}
              />
              <Input
                label={`公休日（${locale}）`}
                value={form.hoursClosed[locale]}
                onChange={(e) => setLoc('hoursClosed', e.target.value)}
                placeholder={locale === 'zh-TW' ? '週一公休' : 'Closed on Mondays'}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: 黑貓出貨設定 ─────────────────────────────────────── */}
      {tab === 'tcat' && (
        <Card>
          <SectionHeader
            title="黑貓宅急便寄件設定"
            description="建立黑貓出貨單時使用的寄件人資料，請填寫與綠界物流申請時相同的資訊"
          />
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="寄件人姓名"
                value={form.tcat.senderName}
                onChange={(e) => setTcat('senderName')(e.target.value)}
                placeholder="朝日夫婦"
              />
              <Input
                label="寄件人郵遞區號"
                value={form.tcat.senderZip}
                onChange={(e) => setTcat('senderZip')(e.target.value)}
                placeholder="251"
              />
            </div>
            <Input
              label="寄件人地址"
              value={form.tcat.senderAddress}
              onChange={(e) => setTcat('senderAddress')(e.target.value)}
              placeholder="新北市淡水區中正路233-3號"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="寄件人電話"
                value={form.tcat.senderPhone}
                onChange={(e) => setTcat('senderPhone')(e.target.value)}
                placeholder="02-12345678"
              />
              <Input
                label="寄件人手機"
                value={form.tcat.senderCellPhone}
                onChange={(e) => setTcat('senderCellPhone')(e.target.value)}
                placeholder="0912345678"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="配送溫層"
                description="冰品建議使用冷凍配送"
                value={form.tcat.temperature}
                onChange={setTcat('temperature')}
                options={[
                  { label: '常溫', value: '0001' },
                  { label: '冷藏（7°C 以下）', value: '0002' },
                  { label: '冷凍（-18°C 以下）', value: '0003' },
                ]}
              />
              <SelectField
                label="配送距離"
                value={form.tcat.distance}
                onChange={setTcat('distance')}
                options={[
                  { label: '全台（00）', value: '00' },
                  { label: '同縣市（01）', value: '01' },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Email 設定 ──────────────────────────────────────── */}
      {tab === 'email' && (
        <Card>
          <SectionHeader
            title="電子郵件設定"
            description="系統寄件設定（覆寫環境變數 SMTP_FROM / SMTP_FROM_NAME）"
          />
          <CardContent className="p-5 space-y-4">
            <Input
              label="寄件人 Email"
              value={form.emailSettings.fromAddress}
              onChange={(e) => setEmail('fromAddress')(e.target.value)}
              placeholder="hello@asahihuuhu.com"
            />
            <Input
              label="寄件人名稱"
              value={form.emailSettings.fromName}
              onChange={(e) => setEmail('fromName')(e.target.value)}
              placeholder="朝日夫婦"
            />
            <Input
              label="回覆地址"
              value={form.emailSettings.replyTo}
              onChange={(e) => setEmail('replyTo')(e.target.value)}
              placeholder="hello@asahihuuhu.com"
            />
            <div className="flex items-center gap-3 pt-1">
              <input
                id="orderConfirmationEnabled"
                type="checkbox"
                checked={form.emailSettings.orderConfirmationEnabled}
                onChange={(e) => setEmail('orderConfirmationEnabled')(e.target.checked)}
                className="h-4 w-4 rounded border-adm-border-default accent-adm-brand-500 cursor-pointer"
              />
              <Label htmlFor="orderConfirmationEnabled" className="text-sm text-adm-text-primary cursor-pointer select-none">
                啟用訂單確認信
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tab: SEO ───────────────────────────────────────────────── */}
      {tab === 'seo' && (
        <Card>
          <SectionHeader
            title="SEO 設定"
            description="依語言分別設定，顯示於 Google 搜尋結果"
          />
          <LocaleTabs locale={locale} onSelect={setLocale} />
          <CardContent className="p-5 space-y-4">
            <Textarea
              label={`SEO 描述（${locale}）`}
              description="建議 120–160 字元，簡短說明網站內容"
              value={form.seoDescription[locale]}
              onChange={(val) => setLoc('seoDescription', val)}
              placeholder={
                locale === 'zh-TW'
                  ? '朝日夫婦，台灣淡水職人刨冰，使用在地食材手工製作，每季限定口味。'
                  : 'Asahi Huuhu, artisan shaved ice from Tamsui, Taiwan...'
              }
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Sticky save footer */}
      <div className="flex justify-end pt-2 pb-8">
        <Button variant="primary" size="md" loading={loading} onClick={handleSave}>
          儲存設定
        </Button>
      </div>
    </div>
  )
}
