var express = require('express');
var app = require('express')();
var favicon = require('serve-favicon')
var path = require('path')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

var status = 0;
var account = "0x0"
var balance = 0.0;
var amount = 0.0;

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
    process.send('click')
  });
});



function ChangeStatus(newStatus){
  process.send('status:' + newStatus)
  status = newStatus;
  io.emit('set status', newStatus);
  return true;
}



function Start(){
  http.listen(port, function() {
    process.send('listening on *:' + port)
  });
  ChangeStatus(0)
}


process.on('message', function(m) {
  if (m=='Start') {
    Start();
  }
  if (m.startsWith("changeStatus:")) {
    ChangeStatus(parseInt(m.split(":")[1]))
  }
  if (m.startsWith("balance:")) {
    balance = (parseFloat(m.split(":")[1]))
    io.emit('set balance', balance);
  }
  if (m.startsWith("transaction:")) {
    amount = (parseFloat(m.split(":")[1]))
    io.emit('set amount', amount);
  }
  if (m.startsWith("coinbase:")) {
    account = (m.split(":")[1])
    io.emit('set account', account);
  }

});
