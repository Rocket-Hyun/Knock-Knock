var express = require('express');
var ejs_layout = require('ejs-layouts');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var fs = require('fs');
var options = {
	key : fs.readFileSync('server.key'),
	cert : fs.readFileSync('server.crt')
};
var app = express();
var https = require('https').Server(options, app);
var io = require('socket.io')(https);

https.listen(3000);

io.sockets.on('connection',function(socket){
  socket.emit('registerId',{id: socket.id});
  socket.on('positionUpdate',function(data){
    socket.broadcast.emit('getPosition',data); // 자신을 제외하고 다른 클라이언트에게 보냄
    // socket.emit('getPosition',data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
  });

  socket.on('fromclient1',function(data) {
    socket.broadcast.emit('getPosition',data); // 자신을 제외하고 다른 클라이언트에게 보냄
    socket.emit('getPosition',data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
  });

  // 채팅 요청을 보낼때 특정 유저에게만 보냄
  socket.on('sendRequest',function(data) {
	var target = io.sockets.connected[data.receiveId];
	if(target != null) target.emit('recieveRequest', data);
  });

  // 연결 끊을 때
  socket.on('disconnect', function (data) {
    socket.broadcast.emit('deleteMarker',socket.id);
  });

  // 채팅을 수락했을 때
  socket.on('chatOk', function(data) {
	var target = io.sockets.connected[data.receiveId];
    if(target != null) target.emit('ChatSuccess',data);
  });

  // 채팅을 거절했을 때
  socket.on('chatRefuse', function(data) {
	var target = io.sockets.connected[data.receiveId];
    if(target != null) target.emit('ChatFail',data);
  });

  // 채팅 메시지를 보냈을 때
  socket.on('sendMessage', function(data) {
	var target = io.sockets.connected[data.receiveId];
    if(target != null) target.emit('receiveMessage', data.sendMessage);
  });

  // 채팅창 중간 종료
  socket.on('chatExit', function(data) {
	var target = io.sockets.connected[data.receiveId];
	if(target != null) target.emit('ChatDone', data);
	socket.emit('ChatDone', data);
  });
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
