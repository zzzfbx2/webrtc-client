const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle offer from caller
    socket.on('offer', (data) => {
        socket.to(data.room).emit('offer', data);
    });

    // Handle answer from callee
    socket.on('answer', (data) => {
        socket.to(data.room).emit('answer', data);
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (data) => {
        socket.to(data.room).emit('ice-candidate', data);
    });

    // Handle call initiation
    socket.on('join', (room) => {
        socket.join(room);
        console.log(`Client joined room: ${room}`);
        // Notify other users in the room that someone has joined
        socket.to(room).emit('user-joined', { room });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 