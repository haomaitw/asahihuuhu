import { BrandMark } from './BrandMark'

type Props = {
  message?: string | null
}

export function MaintenancePage({ message }: Props) {
  return (
    <div className="min-h-dvh bg-paper-50 flex flex-col items-center justify-center px-6 text-center">
      <BrandMark variant="black" className="h-20 mb-10" />

      <p className="font-sans font-light text-xs tracking-[0.3em] text-ink/40 uppercase mb-6">
        UNDER MAINTENANCE
      </p>

      <h1 className="font-sans font-light text-4xl tracking-widest text-ink mb-6">
        維護中
      </h1>

      {message ? (
        <p className="text-sm text-ink/60 max-w-sm leading-relaxed mb-6 whitespace-pre-line">
          {message}
        </p>
      ) : null}

      <p className="text-sm text-ink/40 font-sans font-light tracking-wide">
        感謝您的耐心等候，我們即將恢復服務。
      </p>
    </div>
  )
}
