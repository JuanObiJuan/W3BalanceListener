

var webServer = require("./index.js");


webServer.startServer(8080);

webServer.serverEmmiter.on('startCharging', () => {
  // The client click Start
  console.log('startCharging event occurred in client side!');
});
webServer.serverEmmiter.on('init', () => {
  webServer.changeStatus(0);
  console.log('init event occurred!');
});
