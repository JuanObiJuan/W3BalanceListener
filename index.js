var express = require('express');
var app = require('express')();
var favicon = require('serve-favicon')
var path = require('path')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

const EventEmitter = require('events');
class ServerEmitter extends EventEmitter {}
const serverEmmiter = new ServerEmitter();

var status = 0;
var account = "0x0"
var balance = 0.0;
var amount = 0;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use('/static', express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
io.on('connection', function(socket) {
  // Messages to broadcast in clients
  io.emit('set account', account);
  io.emit('set balance', balance);
  io.emit('set amount', amount);
  io.emit('set status', status);

  socket.on('startCharging', function(startCharging) {
    console.log('startCharging:' + startCharging);
    status = 3;
    io.emit('set status', status);
    serverEmmiter.emit('startCharging');
  });
});

exports.serverEmmiter = serverEmmiter;

exports.changeStatus = function(newStatus) {
  console.log('changing server status to '+newStatus);
  status = newStatus;
  io.emit('set status', newStatus);
  return true;
};

exports.startServer = function(port) {
  http.listen(port, function() {
    serverEmmiter.emit('init');
    console.log('listening on *:' + port);
  });
};
