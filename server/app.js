var express = require('express');
var ejs_layout = require('ejs-layouts');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080, "192.168.0.55");

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

  // 채팅 요청을 보낼때
  // 특정 유저에게만 보냄
  socket.on('sendRequest',function(data){
    io.sockets.connected[data.receiveId].emit('recieveRequest',data);
    // io.sockets.socket(data.receiveId).emit('recieveRequest',data);
  });

  // 연결 끊을 때
  socket.on('disconnect', function (data) {
    // io.emit('user disconnected');
    socket.broadcast.emit('deleteMarker',socket.id);
    // console.log(data)
  });

  // 채팅을 수락했을 때
  socket.on('chatOk', function(data){
    console.log('채팅 수락!!');
    io.sockets.connected[data.receiveId].emit('ChatSuccess',data);
  });

  // 채팅을 거절했을 때
  socket.on('chatRefuse', function(data){
    console.log('채팅 거절!');
    io.sockets.connected[data.receiveId].emit('ChatFail',data);
  });

  // 채팅 메시지를 보냈을 때
  socket.on('sendMessage', function(data) {
    console.log("채팅 메시지 전송!");
    io.sockets.connected[data.receiveId].emit('receiveMessage', data.sendMessage);
  })
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(ejs_layout.express);

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
