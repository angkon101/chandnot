# My Open Notebook

A full-stack collaborative note-taking web app built with Next.js 14, TipTap, and Supabase.

## Features

- **Rich text editor** — Bold, italic, underline, strikethrough, headings (H1/H2/H3), bullet & ordered lists, blockquote, code blocks, highlight (4 colors), links, and image uploads
- **Auto-save** — Notes save automatically as you type (1.2s debounce)
- **Heading outline** — Sidebar panel shows a live outline of headings in the current note
- **Personal notes** — Each user has their own private notes
- **Group notes** — Create a group with a unique 8-character code; share the code with others to collaborate
- **Real-time collaboration** — Multiple users editing the same group note see each other's changes live (powered by Supabase Realtime Broadcast)
- **Image uploads** — Images are stored in Supabase Storage and embedded in notes
- **Authentication** — Username + password login; no email required. Sessions use httpOnly cookies (JWT)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Editor | TipTap |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime Broadcast |
| Storage | Supabase Storage |
| Auth | bcryptjs + jsonwebtoken + jose |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/angkon101/my-open-notebook..git
cd my-open-notebook.
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

### 4. Create database tables

Run the SQL in `migrate.sql` in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new). This creates the `User`, `Group`, `Note`, and `GroupMember` tables and the `uploads` storage bucket.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

This project is deployed on **Vercel**. Add the four environment variables from step 3 in your Vercel project settings before deploying.

## Database Schema

```
User         — id, username (unique), password, createdAt
Group        — id, code (unique 8-char), name, createdAt
Note         — id, title, content (TipTap JSON), userId, groupId (nullable), createdAt, updatedAt
GroupMember  — id, userId, groupId, role (admin/member), createdAt
```
