/**

 * Module dependencies.

 */



var express = require('express');

// var routes = require('./routes');


var http = require('http');

var path = require('path');



var app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


var httpServer =http.createServer(app).listen(8080, function(req,res){

  console.log('Socket IO server has been started');

});

// upgrade http server to socket.io server

var io = require('socket.io').listen(httpServer);

io.sockets.on('connection',function(socket){

   socket.emit('registerId',{id: socket.id});

   socket.on('positionUpdate',function(data){

       socket.broadcast.emit('getPosition',data); // 자신을 제외하고 다른 클라이언트에게 보냄
       socket.emit('getPosition',data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?

       console.log('Message from client :'+data);

   });

   socket.on('fromclient1',function(data){

       socket.broadcast.emit('getPosition',data); // 자신을 제외하고 다른 클라이언트에게 보냄

       socket.emit('getPosition',data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?

       console.log('Message from client :'+data);

   });

    socket.on('sendRequest',function(data){
        console.log('서버측 sendRequest');
        io.sockets.connected[data.receiveId].emit('recieveRequest',data);
        // io.sockets.socket(data.receiveId).emit('recieveRequest',data);
    });

    // 연결 끊을 때
    socket.on('disconnect', function (data) {
        // io.emit('user disconnected');
        socket.broadcast.emit('deleteMarker',socket.id);
        // console.log(data)
    });

});
