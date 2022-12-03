const express = require("express")
const app = express()
const cors = require("cors")

app.use(cors())

app.get("/", (req, res) => {
  res.json({
    message: "rtc server"
  })
})


const { createServer } = require("http")
const server = createServer(app)

const { Server } = require("socket.io")

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://127.0.0.1:4173",
      "https://justme2002.github.io"
    ]
  }
})

let onlineUsers = []
let sender = ""


io.on("connection", (socket) => {
  console.log({
    id: socket.id
  })

  socket.on("gather_online_user", ({ sessionId, username }) => {
    socket.username = username
    console.log({
      sessionId,
      username
    })

    onlineUsers.push({
      sessionId,
      username
    })

    io.emit("add_new_user", onlineUsers)
    io.emit("get_online_users", onlineUsers)
  })

  socket.on("send_signal", ({ senderId, sessionId, username, offer }) => {
    sender = senderId
    socket.to(sessionId).emit("receive_signal", {
      senderId,
      sessionId, 
      username,
      offer
    })
  })

  socket.on("answer_signal", ({ senderId, username, answer }) => {
    socket.to(sender).emit("receive_answer", {
      senderId: sender, 
      username,
      answer
    })
  })

  socket.on("get_candidate", ({ candidate }) => {
    socket.to(sender).emit("return_ice_candidate", {
      candidate: candidate
    })
    console.log(candidate)
  })

  socket.on("disconnect", (reason) => {
    onlineUsers = onlineUsers.filter(user => {
      user.username === socket.username
    })

    socket.emit("offline_user", onlineUsers)
  })
})

const PORT = 4100 | process.env.PORT
server.listen(PORT, () => {
  console.log("init io server")
})