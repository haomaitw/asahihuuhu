import { Link } from '@/i18n/routing'

interface Props {
  href: string
  label: string
}

/**
 * "See More" pill button that matches the original asahihuuhu.com design:
 *   White background + gray border + right-arrow circle in brand blue.
 *   On hover: whole button fills sea-400, arrow inverts to white.
 */
export function SeeMoreLink({ href, label }: Props) {
  return (
    <Link href={href} className="pill-button group">
      <span className="pl-4 pr-2">{label}</span>
      <span className="pill-arrow" aria-hidden>→</span>
    </Link>
  )
}
