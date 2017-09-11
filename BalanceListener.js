var Web3 = require('web3')
var sleep = require('sleep');

//  Init vars
var gethServerURL = 'http://localhost:8545'
var account = '0xa74dca289a9674edf2ba4c68ab8ecacde3f0b780'
var balance = 0


// App status
const AppStatus = {
  WAIT_SYNC: 0,
  WAIT_TRANSACTION : 1,
  WAIT_OK : 2,
  CHARGING: 3,
  FINISHED: 4
}

var currentAppStatus = AppStatus.WAIT_SYNC


var web3 = new Web3(new Web3.providers.HttpProvider(gethServerURL))
console.log('web3 version ' + web3.version.api)
console.log('connected to geth in ' + gethServerURL)
console.log('base: ' + web3.eth.coinbase)

// Check If the server is in Sync
while (web3.eth.syncing) {
  sleep.sleep(1)
  console.log('waitin to be in Sync ')
}
console.log('In Sync !!')

// Unlock Account
web3.personal.unlockAccount(account, 'yourpasswordhere')

//update Balance
balance = web3.fromWei(web3.eth.getBalance(account), 'ether')
console.log('balance: ' + balance)
// Wait for new transaction
currentAppStatus = AppStatus.WAIT_TRANSACTION
newBalance = web3.fromWei(web3.eth.getBalance(account), 'ether')
console.log('waitin for a new transaction ')
while(newBalance=balance){
  newBalance = web3.fromWei(web3.eth.getBalance(account), 'ether')
  sleep.sleep(1)
}
console.log('newBalance: ' + newBalance)
console.log('New transaction!!')
var diff = newBalance-balance;
//Show POPUP and wait OK
currentAppStatus = AppStatus.WAIT_OK


showStatus()

function showStatus () {
  console.log('showing balance of ' + account)
  // retrieve the value of the token

  console.log('balance = ' + balance.toNumber())
}
