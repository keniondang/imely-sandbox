import type { ElementType, ReactNode } from 'react'

interface NoSheetProps {
  children: ReactNode
  as?: ElementType
  className?: string
}

// Marks text that's genuinely absent from the translator's source sheet —
// no key in strings.json exists for it at all, so there's nothing to wire
// it to (as opposed to the bracket-placeholder convention in mockContent.ts,
// which marks intentionally-fake UGC content, a different concept). Purely
// a visual aid for scanning a screen to see what still needs sheet content;
// doesn't affect Str/RichStr's usage-tracking or locale resolution.
export function NoSheet({ children, as: Tag = 'span', className }: NoSheetProps) {
  return (
    <Tag
      className={`${className ?? ''} decoration-2 decoration-dashed decoration-amber-500 underline underline-offset-4`.trim()}
      title="Not in strings sheet — hardcoded, no translatable key exists"
    >
      {children}
    </Tag>
  )
}
