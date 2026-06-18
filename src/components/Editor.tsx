'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import Toolbar from './Toolbar'

interface EditorProps {
  noteId: string
  initialTitle: string
  initialContent: string
  groupCode?: string
  username: string
}

interface Heading {
  level: number
  text: string
}

export default function NoteEditor({ noteId, initialTitle, initialContent, groupCode, username }: EditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [headings, setHeadings] = useState<Heading[]>([])
  const [lastEditor, setLastEditor] = useState('')
  const [stats, setStats] = useState({ words: 0, chars: 0 })
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isRemoteUpdate = useRef(false)
  const titleRef = useRef(title)
  const usernameRef = useRef(username)
  const router = useRouter()

  useEffect(() => { titleRef.current = title }, [title])
  useEffect(() => { usernameRef.current = username }, [username])

  const extractHeadings = useCallback((ed: ReturnType<typeof useEditor>) => {
    if (!ed) return
    const items: Heading[] = []
    let words = 0
    let chars = 0
    ed.state.doc.descendants((node) => {
      if (node.type.name === 'heading') {
        items.push({ level: node.attrs.level, text: node.textContent })
      }
      if (node.isText) {
        const text = node.text || ''
        chars += text.length
        words += text.trim() ? text.trim().split(/\s+/).length : 0
      }
    })
    setHeadings(items)
    setStats({ words, chars })
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your note...' }),
      TextStyle,
      Underline,
    ],
    content: (() => { try { return JSON.parse(initialContent) } catch { return initialContent || '' } })(),
    onUpdate({ editor: ed }) {
      if (isRemoteUpdate.current) return
      setSaveStatus('unsaved')
      extractHeadings(ed)
      const content = JSON.stringify(ed.getJSON())
      scheduleAutoSave(titleRef.current, content)
      channelRef.current?.send({
        type: 'broadcast',
        event: 'note-change',
        payload: { noteId, content, title: titleRef.current, username: usernameRef.current },
      })
    },
    immediatelyRender: false,
  })

  useEffect(() => { if (editor) extractHeadings(editor) }, [editor, extractHeadings])

  // Supabase Realtime for group collaboration
  useEffect(() => {
    if (!groupCode) return

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase.channel(`group-${groupCode}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'note-change' }, ({ payload }) => {
        if (payload.noteId !== noteId) return
        setLastEditor(payload.username)
        if (payload.title !== undefined) setTitle(payload.title)
        if (payload.content && editor) {
          try {
            isRemoteUpdate.current = true
            const parsed = JSON.parse(payload.content)
            const { from, to } = editor.state.selection
            editor.commands.setContent(parsed, false)
            editor.commands.setTextSelection({ from, to })
            isRemoteUpdate.current = false
            extractHeadings(editor)
          } catch {
            isRemoteUpdate.current = false
          }
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => { supabase.removeChannel(channel) }
  }, [groupCode, noteId, editor, extractHeadings])

  const scheduleAutoSave = useCallback((t: string, c: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveNote(t, c), 1200)
  }, [])

  const saveNote = useCallback(async (t: string, c: string) => {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, content: c }),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    }
  }, [noteId])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    setSaveStatus('unsaved')
    const content = editor ? JSON.stringify(editor.getJSON()) : initialContent
    scheduleAutoSave(val, content)
    channelRef.current?.send({
      type: 'broadcast',
      event: 'note-change',
      payload: { noteId, content, title: val, username },
    })
  }

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !editor) return
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (res.ok) {
        const { url } = await res.json()
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
    input.click()
  }, [editor])

  const deleteNote = async () => {
    if (!confirm('Delete this note?')) return
    await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  const statusColors = { saved: 'text-cyber-cyan', saving: 'text-cyber-yellow', unsaved: 'text-cyber-orange', error: 'text-cyber-pink' }
  const statusText = { saved: '✓ Saved', saving: '⟳ Saving...', unsaved: '● Unsaved', error: '✕ Error' }

  return (
    <div className="flex h-full">
      {/* Headings outline */}
      <aside className="w-52 flex-shrink-0 border-r border-cyber-cyan/10 overflow-y-auto bg-cyber-dark/50 cyber-scrollbar hidden lg:block">
        <div className="p-3">
          <p className="text-xs font-semibold text-cyber-cyan/40 uppercase tracking-wider mb-2 font-display">Headings</p>
          {headings.length === 0 && <p className="text-xs text-white/20 italic">No headings yet</p>}
          {headings.map((h, i) => (
            <button
              key={i}
              onClick={() => {
                const els = document.querySelectorAll('h1,h2,h3,h4')
                els[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{ paddingLeft: `${(h.level - 1) * 10}px` }}
              className="block w-full text-left text-xs py-1 px-1 hover:bg-cyber-cyan/[0.04] text-white/40 hover:text-cyber-cyan truncate mb-0.5 transition-all border-l border-transparent hover:border-cyber-cyan/30"
            >
              <span className="cyber-gradient-text mr-1 font-mono text-[10px]">H{h.level}</span>{h.text || '(empty)'}
            </button>
          ))}
        </div>
      </aside>

      {/* Editor area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-cyber-cyan/10 bg-cyber-dark/30">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="flex-1 text-2xl font-bold text-white/80 bg-transparent outline-none placeholder-white/10 font-display"
          />
          <div className="flex items-center gap-3 ml-4">
            {lastEditor && (
              <span className="text-xs text-cyber-cyan/50 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 bg-cyber-cyan animate-pulse" />
                {lastEditor} editing
              </span>
            )}
            <span className={`text-xs font-mono ${statusColors[saveStatus]}`}>{statusText[saveStatus]}</span>
            <button onClick={deleteNote} className="text-xs text-cyber-pink/50 hover:text-cyber-pink px-2 py-1 hover:bg-cyber-pink/[0.04] transition-all rounded">Delete</button>
          </div>
        </div>

        <Toolbar editor={editor} onImageUpload={handleImageUpload} />

        <div className="flex-1 overflow-y-auto bg-cyber-black/50 cyber-grid">
          <EditorContent editor={editor} className="prose prose-gray max-w-none px-8 py-6 min-h-full focus:outline-none" />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-cyber-cyan/10 bg-cyber-dark/20 text-[10px] font-mono text-white/20">
          <span>{stats.words} words · {stats.chars} characters</span>
        </div>
      </div>
    </div>
  )
}
