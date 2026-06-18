'use client'

import { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor | null
  onImageUpload: () => void
}

export default function Toolbar({ editor, onImageUpload }: ToolbarProps) {
  if (!editor) return null

  const btn = (active: boolean, title: string, onClick: () => void, children: React.ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (!url) return
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white sticky top-0 z-10">
      {/* Headings */}
      {btn(editor.isActive('heading', { level: 1 }), 'Heading 1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <span className="font-bold">H1</span>)}
      {btn(editor.isActive('heading', { level: 2 }), 'Heading 2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <span className="font-bold">H2</span>)}
      {btn(editor.isActive('heading', { level: 3 }), 'Heading 3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <span className="font-bold">H3</span>)}

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Text formatting */}
      {btn(editor.isActive('bold'), 'Bold', () => editor.chain().focus().toggleBold().run(), <strong>B</strong>)}
      {btn(editor.isActive('italic'), 'Italic', () => editor.chain().focus().toggleItalic().run(), <em>I</em>)}
      {btn(editor.isActive('underline'), 'Underline', () => editor.chain().focus().toggleUnderline().run(), <u>U</u>)}
      {btn(editor.isActive('strike'), 'Strikethrough', () => editor.chain().focus().toggleStrike().run(), <s>S</s>)}
      {btn(editor.isActive('code'), 'Inline code', () => editor.chain().focus().toggleCode().run(), <code className="text-xs">{'</>'}</code>)}

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Highlight */}
      {btn(editor.isActive('highlight', { color: '#fef08a' }), 'Highlight Yellow', () => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run(),
        <span style={{ background: '#fef08a', padding: '0 2px' }}>A</span>)}
      {btn(editor.isActive('highlight', { color: '#bbf7d0' }), 'Highlight Green', () => editor.chain().focus().toggleHighlight({ color: '#bbf7d0' }).run(),
        <span style={{ background: '#bbf7d0', padding: '0 2px' }}>A</span>)}
      {btn(editor.isActive('highlight', { color: '#fecaca' }), 'Highlight Red', () => editor.chain().focus().toggleHighlight({ color: '#fecaca' }).run(),
        <span style={{ background: '#fecaca', padding: '0 2px' }}>A</span>)}
      {btn(editor.isActive('highlight', { color: '#bfdbfe' }), 'Highlight Blue', () => editor.chain().focus().toggleHighlight({ color: '#bfdbfe' }).run(),
        <span style={{ background: '#bfdbfe', padding: '0 2px' }}>A</span>)}

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Lists */}
      {btn(editor.isActive('bulletList'), 'Bullet list', () => editor.chain().focus().toggleBulletList().run(), '• List')}
      {btn(editor.isActive('orderedList'), 'Ordered list', () => editor.chain().focus().toggleOrderedList().run(), '1. List')}
      {btn(editor.isActive('blockquote'), 'Blockquote', () => editor.chain().focus().toggleBlockquote().run(), '"Quote"')}
      {btn(editor.isActive('codeBlock'), 'Code block', () => editor.chain().focus().toggleCodeBlock().run(), '{ Code }')}

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Link */}
      {btn(editor.isActive('link'), 'Link', addLink, '🔗 Link')}

      {/* Image */}
      <button
        type="button"
        title="Insert image"
        onClick={onImageUpload}
        className="px-2 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        🖼 Image
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Undo / Redo */}
      <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="px-2 py-1.5 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30">↩</button>
      <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="px-2 py-1.5 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30">↪</button>
    </div>
  )
}
