var cp = require('child_process');
const exec = cp.exec;
var sleep = require('./node_modules/sleep/');
var ip = require('ip')

var coinbase='';
var balance=0.0;
var transaction=0.0;
var waitPress=false;


//GPIO Control
function SetColor(color){gpiocontrol.send('SetColor:'+color)}
function ShowText(text){gpiocontrol.send('ShowText:'+text)}
function ShowTextIp(text){gpiocontrol.send('ShowText:'+text+'\n'+ip.address())}

var gpiocontrol = cp.fork('./gpiocontrol')
gpiocontrol.on('message', function(m) {
  // Receive messages from w3Logic process
  console.log('gpiocontrol --> ' + m);
  if (m=='Button') {
    UserPressPhysicalButton()
  }
});
SetColor('green')
ShowText('Starting process'+'\n'+ip.address())

var inSync=false;
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
    if(inSync){
     InSync()
    }
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
  inSync=true
  UpdateBalance(balance)
  UpdateCoinbase(coinbase)
  WaitForTransaction()
}



function UpdateBalance(newBalance){
  balance=newBalance
  webServer.send('balance:'+balance)
}


function UpdateCoinbase(account){
  coinbase=account
  webServer.send('coinbase:'+coinbase)
}

progress=0.0
function updateProgress(){
  progress=progress-transaction/100
  console.log('p '+progress)
  if(progress>0.0001){
  webServer.send('progress:'+progress)
  }
else{
  webServer.send('progress:'+0.00)
  clearInterval(interval)
  }
}

function NewTransaction(amount){
  //str to float
  transaction = amount
  //round
  transaction = Number((amount).toFixed(3));
  progress=transaction;
  SetColor('green')
  ShowText('New Transaction'+'\n'+'Amount '+transaction );
  webServer.send('transaction:'+transaction)
  webServer.send('changeStatus:'+2)
  waitPress=true
  gpiocontrol.send('BuzzShort')
}

function UserPressPhysicalButton(){
  StartCharging()
}

function UserClickWebButton(){
  StartCharging()
}

var interval
function StartCharging(){
    if(waitPress){
    progress = transaction
    SetColor('red')
    ShowText('....charging....'+'\n'+'DONT UNPLUG IT!');
    gpiocontrol.send('SwitchLedOn')
    waitPress=false
    webServer.send('changeStatus:'+3)
    interval = setInterval(updateProgress,50)
    setTimeout(ShowFinalScreen,10000)
    }
}

function ShowFinalScreen(){
    SetColor('white')
    ShowText('...Thank you!!'+'\n'+'Unplug your car');
    gpiocontrol.send('BuzzLong')
    gpiocontrol.send('SwitchLedOff')
    webServer.send('changeStatus:'+4)
    setTimeout(WaitForTransaction,10000)
}

function WaitForTransaction(){
    SetColor('blue')
    ShowText('waiting for '+'\n'+'transaction!!');
    webServer.send('changeStatus:'+1)
}
