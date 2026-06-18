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
import Toolbar from './Toolbar'
import { io, Socket } from 'socket.io-client'

interface EditorProps {
  noteId: string
  initialTitle: string
  initialContent: string
  groupCode?: string
  username: string
  readOnly?: boolean
}

interface Heading {
  level: number
  text: string
  id: string
}

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  groupCode,
  username,
}: EditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [headings, setHeadings] = useState<Heading[]>([])
  const [lastEditor, setLastEditor] = useState<string>('')
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const isRemoteUpdate = useRef(false)
  const router = useRouter()

  const extractHeadings = useCallback((editor: ReturnType<typeof useEditor>) => {
    if (!editor) return
    const items: Heading[] = []
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        items.push({ level: node.attrs.level, text: node.textContent, id: `h-${pos}` })
      }
    })
    setHeadings(items)
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
    content: (() => {
      try { return JSON.parse(initialContent) } catch { return initialContent || '' }
    })(),
    onUpdate({ editor }) {
      if (isRemoteUpdate.current) return
      setSaveStatus('unsaved')
      extractHeadings(editor)
      scheduleAutoSave(title, JSON.stringify(editor.getJSON()))

      // Broadcast to group
      if (groupCode && socketRef.current) {
        socketRef.current.emit('note-change', {
          groupCode,
          noteId,
          content: JSON.stringify(editor.getJSON()),
          title,
          username,
        })
      }
    },
    immediatelyRender: false,
  })

  // Extract headings on init
  useEffect(() => {
    if (editor) extractHeadings(editor)
  }, [editor, extractHeadings])

  // Socket.io for group real-time
  useEffect(() => {
    if (!groupCode) return

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.emit('join-group', groupCode)

    socket.on('note-updated', ({ noteId: updatedId, content, title: updatedTitle, username: fromUser }) => {
      if (updatedId !== noteId) return
      setLastEditor(fromUser)
      if (updatedTitle !== undefined) setTitle(updatedTitle)
      if (content && editor) {
        try {
          isRemoteUpdate.current = true
          const parsed = JSON.parse(content)
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

    return () => {
      socket.emit('leave-group', groupCode)
      socket.disconnect()
    }
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
      if (res.ok) setSaveStatus('saved')
      else setSaveStatus('error')
    } catch {
      setSaveStatus('error')
    }
  }, [noteId])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    setSaveStatus('unsaved')
    const content = editor ? JSON.stringify(editor.getJSON()) : initialContent
    scheduleAutoSave(val, content)
    if (groupCode && socketRef.current) {
      socketRef.current.emit('note-change', { groupCode, noteId, content, title: val, username })
    }
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

  const statusColors = {
    saved: 'text-green-600',
    saving: 'text-yellow-500',
    unsaved: 'text-orange-500',
    error: 'text-red-500',
  }
  const statusText = {
    saved: '✓ Saved',
    saving: '⟳ Saving...',
    unsaved: '● Unsaved',
    error: '✕ Error saving',
  }

  return (
    <div className="flex h-full">
      {/* Headings sidebar */}
      <aside className="w-52 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50 hidden lg:block">
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Headings</p>
          {headings.length === 0 && (
            <p className="text-xs text-gray-400 italic">No headings yet</p>
          )}
          {headings.map((h, i) => (
            <button
              key={i}
              onClick={() => {
                const elements = document.querySelectorAll('h1,h2,h3,h4')
                elements[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{ paddingLeft: `${(h.level - 1) * 10}px` }}
              className="block w-full text-left text-xs py-1 px-1 rounded hover:bg-gray-200 text-gray-600 truncate mb-0.5"
            >
              <span className="text-gray-400 mr-1">H{h.level}</span>
              {h.text || '(empty)'}
            </button>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="flex-1 text-2xl font-bold text-gray-800 bg-transparent outline-none placeholder-gray-300"
          />
          <div className="flex items-center gap-3 ml-4">
            {lastEditor && (
              <span className="text-xs text-gray-400">edited by {lastEditor}</span>
            )}
            <span className={`text-xs font-medium ${statusColors[saveStatus]}`}>
              {statusText[saveStatus]}
            </span>
            <button
              onClick={deleteNote}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        <Toolbar editor={editor} onImageUpload={handleImageUpload} />

        <div className="flex-1 overflow-y-auto">
          <EditorContent
            editor={editor}
            className="prose prose-gray max-w-none px-8 py-6 min-h-full focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
