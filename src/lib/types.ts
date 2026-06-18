export interface NoteType {
  id: string
  title: string
  content: string
  userId: string
  groupId: string | null
  createdAt: string
  updatedAt: string
  user?: { username: string }
}

export interface GroupType {
  id: string
  code: string
  name: string
  createdAt: string
  members?: { userId: string; role: string; user: { username: string } }[]
  notes?: NoteType[]
}

export interface UserType {
  id: string
  username: string
  createdAt: string
}
