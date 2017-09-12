var cp = require('child_process');

//Ethereum Logic
var w3Logic = cp.fork('./BalanceListener')
var inSync = false;
var coinbase='';
var balance=0.0;
var transaction=0.0;

w3Logic.send('Start');
w3Logic.on('message', function(m) {
  // Receive messages from child process
  console.log('w3Logic --> ' + m);
  if (m=='inSync') {
    InSync();
  }
  if (m.startsWith("balance:")) {
    UpdateBalance(parseFloat(m.split(":")[1]))
  }
  if (m.startsWith("coinbase:")) {
    UpdateCoinbase(m.split(":")[1])
  }
  if (m.startsWith("transaction:")) {
    NewTransaction(parseFloat(m.split(":")[1]))
  }
});

//WebServer








//Events from all scripts
function InSync(){
  inSync=true;
  w3Logic.send('Listen');
}

function UpdateBalance(newBalance){
  balance=newBalance;
}

function UpdateCoindbase(account){
  coinbase=account;
}

function NewTransaction(amount){
  transaction = amount;
}


// var webServer = cp.fork('./index')
// webServer.on('message', function(m) {
//   // Receive results from child process
//   console.log('webServer received message: ' + m);
//   if (m=='Starded') {
//   }
// });
//
// webServer.send('Start');
