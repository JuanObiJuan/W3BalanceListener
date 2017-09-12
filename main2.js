var cp = require('child_process');
var inSync = false;
var coinbase='';
var balance=0.0;
var transaction=0.0;

//Ethereum Logic
var w3Logic = cp.fork('./BalanceListener')

w3Logic.send('Start');
w3Logic.on('message', function(m) {
  // Receive messages from w3Logic process
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
var webServer = cp.fork('./index')
var serverStatus=0
webServer.send('Start')
webServer.on('message', function(m) {
  // Receive results from child process
  console.log('webServer --> ' + m);
  if (m=='Starded') {

  }
  if (m=='click') {
    UserClickWebButton();
  }
  if (m.startsWith("status:")) {
      serverStatus = parseFloat(m.split(":")[1])
  }
});



//Events from all scripts
function InSync(){
  inSync=true;
  w3Logic.send('Listen')
  WaitForTransaction()
}

function UpdateBalance(newBalance){
  balance=newBalance;
  webServer.send('balance:'+balance)
}

function UpdateCoinbase(account){
  coinbase=account;
  webServer.send('coinbase:'+coinbase)
}

function NewTransaction(amount){
  transaction = amount;
  webServer.send('transaction:'+transaction)
  webServer.send('changeStatus:'+2)
}

function UserPressPhysicalButton(){
//TODO Check conditions
StartCharging()
}

function UserClickWebButton(){
//TODO Check conditions
StartCharging()
}
function StartCharging(){
    webServer.send('changeStatus:'+3)
    setTimeout(ShowFinalScreen,10000)
}

function ShowFinalScreen(){
    webServer.send('changeStatus:'+4)
    setTimeout(WaitForTransaction,10000)
}

function WaitForTransaction(){
  webServer.send('changeStatus:'+1)

}
