var fs = require('fs')
var express = require('express');
var http = require('http');
var app = express();
var favicon = require('serve-favicon')
var path = require('path')
var port = process.env.PORT || 80;

var status = 0;
var account = "0x0"
var balance = 0.0;
var amount = 0.0

server = http.createServer(app);
var io = require('socket.io')(server);


app.get('/', function(req, res) {
	//res.header('Content-type', 'text/html');
      	//return res.end('<h1>Hello, Secure World!</h1>');
  	res.sendFile(__dirname + '/index.html');
});


var GoogleSpreadsheet = require('google-spreadsheet');

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet('14Hbas_07QpH3SqdVi87vn8khUD3y4QhlNOi_DpI4gqk');
var sheet;
var myRows;


function getInfoAndWorksheets() {
    doc.getInfo(function(err, info) {
      console.log('Loaded doc: '+info.title+' by '+info.author.email);
      sheet = info.worksheets[0];
      console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
      //console.log(sheet);
      sheet.getRows({
      offset: 0,
      limit: 20,
      orderby: 'col2'
    }, function( err, rows ){
      //console.log('Read '+rows.length+' rows');
      myRows = rows;
      // the row is an object with keys set by the column headers
      var i = 0;
      while(rows[i]!=undefined) {
        //replace
        console.log(rows[i].german)
        $('#'+rows[i].part).text(rows[i].german)
        i=i+1
      }

      //console.log(rows[0].english)
      //console.log(rows[0].german)
      console.log($.html().toString())
      saveFile($.html().toString())
    });
    });
  }

getInfoAndWorksheets()

var cheerio = require('cheerio')
var $ = cheerio.load('index.html')
var fs = require('fs')
fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err;
    } else {
        $ = cheerio.load(html.toString());
    }
})

function saveFile(content){
  var fs = require('fs');
  fs.writeFile("./index.html", content, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });

}




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
   server.listen(port)
   ChangeStatus(0)
}

if (process.send===undefined){
console.log('standalone mode')
Start()
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
  if (m.startsWith("progress:")){
    io.emit('progress',m.split(":")[1])
  }

});
