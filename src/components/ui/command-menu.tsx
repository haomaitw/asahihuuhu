'use client'
import * as React from 'react'
import { Command } from 'cmdk'
import { Search, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from './dialog'

type CommandItem = {
  id: string
  label: string
  group?: string
  icon?: React.ReactNode
  shortcut?: string
  onSelect?: () => void
}

type CommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items?: CommandItem[]
}

export function CommandMenu({ open, onOpenChange, items = [] }: CommandMenuProps) {
  const groups = React.useMemo(() => {
    const map: Record<string, CommandItem[]> = {}
    for (const item of items) {
      const g = item.group ?? '操作'
      if (!map[g]) map[g] = []
      map[g].push(item)
    }
    return map
  }, [items])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0 gap-0 overflow-hidden">
        <Command className="[&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-adm-text-tertiary [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-adm-border-subtle">
            <Search className="h-4 w-4 shrink-0 text-adm-text-tertiary" />
            <Command.Input
              placeholder="搜尋商品、訂單、設定…"
              className="flex-1 bg-transparent text-sm text-adm-text-primary placeholder:text-adm-text-tertiary outline-none"
            />
            <kbd className="shrink-0 rounded-adm-sm border border-adm-border-default bg-adm-bg-base px-1.5 py-0.5 text-2xs text-adm-text-tertiary">ESC</kbd>
          </div>
          <Command.List className="max-h-[360px] overflow-y-auto p-2">
            <Command.Empty className="py-12 text-center text-sm text-adm-text-tertiary">
              找不到符合的結果
            </Command.Empty>
            {Object.entries(groups).map(([group, groupItems]) => (
              <Command.Group key={group} heading={group}>
                {groupItems.map(item => (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={() => { item.onSelect?.(); onOpenChange(false) }}
                    className={cn(
                      'flex items-center gap-2.5 rounded-adm-md px-3 py-2 text-sm text-adm-text-primary cursor-pointer',
                      'data-[selected=true]:bg-adm-brand-50 data-[selected=true]:text-adm-brand-700',
                      'transition-colors duration-100'
                    )}
                  >
                    {item.icon && <span className="h-4 w-4 text-adm-text-tertiary">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="rounded-adm-sm border border-adm-border-default bg-adm-bg-base px-1.5 py-0.5 text-2xs text-adm-text-tertiary">{item.shortcut}</kbd>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-adm-text-disabled" />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
          <div className="border-t border-adm-border-subtle px-4 py-2.5 flex items-center gap-4 text-2xs text-adm-text-tertiary">
            <span><kbd className="mr-1 rounded px-1 border border-adm-border-default">↑↓</kbd>導覽</span>
            <span><kbd className="mr-1 rounded px-1 border border-adm-border-default">↵</kbd>選擇</span>
            <span><kbd className="mr-1 rounded px-1 border border-adm-border-default">ESC</kbd>關閉</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
