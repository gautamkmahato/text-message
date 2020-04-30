const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateMap } = require('./utils/messages')
const app = express();
const server = http.Server(app);
const io = socketio(server);
const { addUser,removeUser,getUser,getUserInRoom } = require('./utils/users.js');
const port = process.env.PORT || 3000;

app.use(express.static('public')); 

app.get('/', function(req, res){
    res.send("hello")
});

server.listen(port, function(){
    console.log("server is running...")
});


io.on('connection', function(socket){
    console.log("new websocket connection...");

    socket.on('joinroom',function({username, room}, callback){
        const {error, user} = addUser({id: socket.id, username, room})
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        // send a welcome message
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin', `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            allUsers: getUserInRoom(user.room)
        })
        callback()
    })


    socket.on('sendMessage', function(msg, callback){
        const filter = new Filter();
        const user = getUser(socket.id);

        if(filter.isProfane(msg)){
            return callback('profanity is not allowed...');
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg));
        callback();
    })

    socket.on('disconnect', function(){
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                allUsers: getUserInRoom(user.room)
            })
        }
    })

    // to get the location from client side
    socket.on('location', function(coords, callback){
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateMap(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })
})



// socket.emit :- Send and event to a specific client
// io.emit :- Send and event to every client
// socket.broadcast.emit :- Send and event to every client except this one
// io.to.emit :- send an event to a specific room
// socket.broadcast.to.emit :- send an event to a everyone in a specific room except this one