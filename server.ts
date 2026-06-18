import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

declare global {
  var io: SocketIOServer | undefined
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  })

  global.io = io

  io.on('connection', (socket) => {
    socket.on('join-group', (groupCode: string) => {
      socket.join(`group:${groupCode}`)
    })

    socket.on('leave-group', (groupCode: string) => {
      socket.leave(`group:${groupCode}`)
    })

    socket.on('note-change', ({ groupCode, noteId, content, title, username }: {
      groupCode: string
      noteId: string
      content: string
      title: string
      username: string
    }) => {
      socket.to(`group:${groupCode}`).emit('note-updated', { noteId, content, title, username })
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
