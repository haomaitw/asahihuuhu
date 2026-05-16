type Props = {
  data: any
  className?: string
}

function lexicalToHtml(node: any): string {
  if (!node) return ''
  if (node.type === 'text') {
    let t = node.text ?? ''
    if (node.format & 1) t = `<strong>${t}</strong>`
    if (node.format & 2) t = `<em>${t}</em>`
    if (node.format & 8) t = `<u>${t}</u>`
    return t
  }
  const children = (node.children ?? []).map(lexicalToHtml).join('')
  switch (node.type) {
    case 'paragraph': return `<p>${children}</p>`
    case 'heading':   return `<h${node.tag?.replace('h','') ?? 2}>${children}</h${node.tag?.replace('h','') ?? 2}>`
    case 'list':      return node.listType === 'number' ? `<ol>${children}</ol>` : `<ul>${children}</ul>`
    case 'listitem':  return `<li>${children}</li>`
    case 'link':      return `<a href="${node.url ?? '#'}">${children}</a>`
    case 'quote':     return `<blockquote>${children}</blockquote>`
    case 'root':      return children
    default:          return children
  }
}

export function RichText({ data, className }: Props) {
  if (!data) return null

  let html: string
  if (typeof data === 'string') {
    html = data
  } else if (data?.root) {
    html = lexicalToHtml(data.root)
  } else {
    return null
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
