/**
 * Wrapper around @payloadcms/richtext-lexical's RichText JSX converter.
 * Works in both RSC and client components.
 */
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

type Props = {
  data: any
  className?: string
}

export function RichText({ data, className }: Props) {
  if (!data) return null
  return (
    <div className={className}>
      <LexicalRichText data={data} />
    </div>
  )
}
