'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { useCallback, useEffect, useRef, useState } from 'react'
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

interface Heading { level: number; text: string }

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
    let words = 0, chars = 0
    ed.state.doc.descendants((node) => {
      if (node.type.name === 'heading') items.push({ level: node.attrs.level, text: node.textContent })
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
      StarterKit, Highlight.configure({ multicolor: true }), Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your note...' }),
      TextStyle, Underline,
    ],
    content: (() => { try { return JSON.parse(initialContent) } catch { return initialContent || '' } })(),
    onUpdate({ editor: ed }) {
      if (isRemoteUpdate.current) return
      setSaveStatus('unsaved')
      extractHeadings(ed)
      const content = JSON.stringify(ed.getJSON())
      scheduleAutoSave(titleRef.current, content)
      channelRef.current?.send({
        type: 'broadcast', event: 'note-change',
        payload: { noteId, content, title: titleRef.current, username: usernameRef.current },
      })
    },
    immediatelyRender: false,
  })

  useEffect(() => { if (editor) extractHeadings(editor) }, [editor, extractHeadings])

  useEffect(() => {
    if (!groupCode) return
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const channel = supabase.channel(`group-${groupCode}`, { config: { broadcast: { self: false } } })
    channel.on('broadcast', { event: 'note-change' }, ({ payload }) => {
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
        } catch { isRemoteUpdate.current = false }
      }
    }).subscribe()
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
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, content: c }),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch { setSaveStatus('error') }
  }, [noteId])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    setSaveStatus('unsaved')
    const content = editor ? JSON.stringify(editor.getJSON()) : initialContent
    scheduleAutoSave(val, content)
    channelRef.current?.send({
      type: 'broadcast', event: 'note-change',
      payload: { noteId, content, title: val, username },
    })
  }

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !editor) return
      const form = new FormData(); form.append('file', file)
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

  const statusColors = { saved: 'text-cyan-400/70', saving: 'text-yellow-400/70', unsaved: 'text-orange-400/70', error: 'text-red-400/70' }
  const statusText = { saved: 'Saved', saving: 'Saving...', unsaved: 'Unsaved', error: 'Error' }

  return (
    <div className="flex h-full">
      {/* Headings outline */}
      <aside className="w-52 flex-shrink-0 border-r border-white/5 overflow-y-auto bg-black/20 cyber-scrollbar hidden lg:block">
        <div className="p-4">
          <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-3">Headings</p>
          {headings.length === 0 && <p className="text-xs text-white/15 italic">No headings yet</p>}
          <div className="space-y-0.5">
            {headings.map((h, i) => (
              <button
                key={i}
                onClick={() => { document.querySelectorAll('h1,h2,h3,h4')[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                style={{ paddingLeft: `${(h.level - 1) * 12 + 4}px` }}
                className="block w-full text-left text-xs py-1.5 px-2 rounded-md hover:bg-white/[0.03] text-white/35 hover:text-cyber-cyan/70 truncate transition-all"
              >
                <span className="text-[10px] font-mono text-cyber-cyan/30 mr-1.5">H{h.level}</span>
                {h.text || <span className="italic text-white/15">(empty)</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Editor area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-white/5 bg-black/20">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="flex-1 text-lg sm:text-xl font-bold text-white/80 bg-transparent outline-none placeholder-white/10 font-display min-w-0 tracking-tight"
          />
          <div className="flex items-center gap-3 shrink-0">
            {lastEditor && (
              <span className="flex items-center gap-1.5 text-[11px] text-cyan-400/50 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse shrink-0" />
                <span className="hidden sm:inline">{lastEditor}</span>
              </span>
            )}
            <span className={`text-[11px] font-mono ${statusColors[saveStatus]} transition-colors`}>{statusText[saveStatus]}</span>
            <button onClick={deleteNote} className="text-[11px] text-red-400/40 hover:text-red-400/80 px-2 py-1 rounded-md hover:bg-red-400/5 transition-all">
              Delete
            </button>
          </div>
        </div>

        <Toolbar editor={editor} onImageUpload={handleImageUpload} />

        <div className="flex-1 overflow-y-auto bg-black/30 cyber-grid">
          <EditorContent editor={editor} className="max-w-none px-4 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10 min-h-full focus:outline-none prose prose-sm max-w-none" />
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-4 sm:px-6 py-2 border-t border-white/5 bg-black/20 text-[11px] font-mono text-white/20">
          <span>{stats.words} words</span>
          <span className="w-px h-3 bg-white/5" />
          <span>{stats.chars} characters</span>
        </div>
      </div>
    </div>
  )
}
