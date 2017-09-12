var Web3 = require('web3')
var sleep = require('sleep')

//  Init vars
var gethServerURL = 'http://localhost:8545'
var account = '0xa74dca289a9674edf2ba4c68ab8ecacde3f0b780'
var balance = 0.0

var web3

function Start () {

  web3 = new Web3(new Web3.providers.HttpProvider(gethServerURL))
  process.send('geth:'+gethServerURL)
  process.send('coinbase:' + web3.eth.coinbase)

  // Check If the server is in Sync
  while (web3.eth.syncing) {
    sleep.sleep(2)
    console.log('...waitin to be in Sync ')
  }


  // Unlock Account
  web3.personal.unlockAccount(account, 'yourpasswordhere')

  //update Balance
  balance = web3.fromWei(web3.eth.getBalance(account), 'ether')
  process.send('balance:' + balance)
  process.send('inSync')
}

function Listen(){
  //TODO Listen transaction instead balance and put a trigger
  balance = web3.fromWei(web3.eth.getBalance(account), 'ether')
  newBalance = balance
  process.send('listening for new transaction')
  while(newBalance=balance){
    newBalance = web3.fromWei(web3.eth.getBalance(account), 'ether')
    sleep.sleep(1)
  }
  // Wait for new transaction
  var diff = newBalance-balance
  balance=newBalance
  process.send('balance:'+balance)
  process.send('transaction:'+diff)
  Listen();
}

process.on('message', function(m) {
  if (m=='Start') {
    Start();
  }
  if (m=='Listen') {
    Listen();
  }
});
