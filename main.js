

var inSync=false;
var w3Logic = require("./BalanceListener.js")
w3Logic.w3Emmiter.on('inSync', function() {
  inSync=true;
  console.log('>>>>>>>>>>>>>>>>>>>>---------------');
});
w3Logic.Start();



var webServer = require("./index.js");
webServer.serverEmmiter.on('startCharging', () => {
  // The client click Start
  console.log('startCharging event occurred in client side!');
});

webServer.serverEmmiter.on('init', () => {
  webServer.changeStatus(0);
  console.log('init event occurred!');
});
webServer.startServer(8080);
