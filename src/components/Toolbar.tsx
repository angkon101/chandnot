'use client'

import { Editor } from '@tiptap/react'
import { ReactNode } from 'react'

interface ToolbarProps { editor: Editor | null; onImageUpload: () => void }

export default function Toolbar({ editor, onImageUpload }: ToolbarProps) {
  if (!editor) return null

  const btn = (active: boolean, title: string, onClick: () => void, children: ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 text-xs font-mono transition-all shrink-0 rounded ${
        active
          ? 'bg-cyber-fg/12 text-cyber-fg font-semibold'
          : 'text-cyber-fg/30 hover:text-cyber-fg/60 hover:bg-cyber-fg/[0.03]'
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

  const divider = <div className="w-px h-4 bg-cyber-fg/5 mx-1 shrink-0" />

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-0 px-3 sm:px-4 py-1.5 border-b border-cyber-fg/5 bg-cyber-fg/[0.02] min-w-max">
        {btn(editor.isActive('heading', { level: 1 }), 'Heading 1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1')}
        {btn(editor.isActive('heading', { level: 2 }), 'Heading 2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
        {btn(editor.isActive('heading', { level: 3 }), 'Heading 3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3')}
        {divider}
        {btn(editor.isActive('bold'), 'Bold', () => editor.chain().focus().toggleBold().run(), <strong>B</strong>)}
        {btn(editor.isActive('italic'), 'Italic', () => editor.chain().focus().toggleItalic().run(), <em>I</em>)}
        {btn(editor.isActive('underline'), 'Underline', () => editor.chain().focus().toggleUnderline().run(), <u>U</u>)}
        {btn(editor.isActive('strike'), 'Strikethrough', () => editor.chain().focus().toggleStrike().run(), <s>S</s>)}
        {btn(editor.isActive('code'), 'Inline code', () => editor.chain().focus().toggleCode().run(), <>{'</>'}</>)}
        {divider}
        <div className="flex items-center gap-0 px-1 bg-cyber-fg/[0.02] rounded">
          {btn(editor.isActive('highlight', { color: '#fef08a' }), 'Yellow', () => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run(),
            <span style={{ background: '#fef08a', color: '#000', padding: '0 2px', fontSize: '10px' }}>A</span>)}
          {btn(editor.isActive('highlight', { color: '#bbf7d0' }), 'Green', () => editor.chain().focus().toggleHighlight({ color: '#bbf7d0' }).run(),
            <span style={{ background: '#bbf7d0', color: '#000', padding: '0 2px', fontSize: '10px' }}>A</span>)}
          {btn(editor.isActive('highlight', { color: '#fecaca' }), 'Red', () => editor.chain().focus().toggleHighlight({ color: '#fecaca' }).run(),
            <span style={{ background: '#fecaca', color: '#000', padding: '0 2px', fontSize: '10px' }}>A</span>)}
          {btn(editor.isActive('highlight', { color: '#bfdbfe' }), 'Blue', () => editor.chain().focus().toggleHighlight({ color: '#bfdbfe' }).run(),
            <span style={{ background: '#bfdbfe', color: '#000', padding: '0 2px', fontSize: '10px' }}>A</span>)}
        </div>
        {divider}
        {btn(editor.isActive('bulletList'), 'Bullet list', () => editor.chain().focus().toggleBulletList().run(), '•')}
        {btn(editor.isActive('orderedList'), 'Ordered list', () => editor.chain().focus().toggleOrderedList().run(), '1.')}
        {btn(editor.isActive('blockquote'), 'Blockquote', () => editor.chain().focus().toggleBlockquote().run(), '"')}
        {btn(editor.isActive('codeBlock'), 'Code block', () => editor.chain().focus().toggleCodeBlock().run(), '{ }')}
        {divider}
        {btn(editor.isActive('link'), 'Link', addLink, <span className="text-[11px]">Link</span>)}
        <button type="button" title="Image" onClick={onImageUpload} className="px-2 py-1 text-xs text-cyber-fg/30 hover:text-cyber-fg/60 hover:bg-cyber-fg/[0.03] transition-all font-mono shrink-0 rounded">
          Img
        </button>
        {divider}
        <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="px-2 py-1 text-xs text-cyber-fg/20 hover:text-cyber-fg/50 hover:bg-cyber-fg/[0.03] disabled:opacity-15 transition-all font-mono shrink-0 rounded">Undo</button>
        <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="px-2 py-1 text-xs text-cyber-fg/20 hover:text-cyber-fg/50 hover:bg-cyber-fg/[0.03] disabled:opacity-15 transition-all font-mono shrink-0 rounded">Redo</button>
      </div>
    </div>
  )
}
