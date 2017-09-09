var Web3 = require('web3')

//  Init vars
var gethServerURL = 'http://localhost:8545'
var account = '0x4c16c4c7dc7d4b241b2164da31f7c397e2d57c71'
var balance = 0
var currentAppStatus = AppStatus.WAIT_SYNC

// App status
const AppStatus = {
  WAIT_SYNC: 0,
  WAIT_TRANSACTION : 1,
  WAIT_OK : 2,
  CHARGING: 3,
  FINISHED: 4
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


var web3 = new Web3(new Web3.providers.HttpProvider(gethServerURL))
console.log('web3 version ' + web3.version.api)
console.log('connected to geth in ' + gethServerURL)
console.log('base: ' + web3.eth.coinbase)

// Check If the server is in Sync
while (web3.eth.syncing) {
  await sleep(1000)
  console.log('waitin to be in Sync ')
}
console.log('In Sync !!')

// Unlock Account
web3.personal.unlockAccount(account, 'yourpasswordhere')

//update Balance
balance = web3.fromWei(web3.eth.getBalance(account), 'ether')

// Wait for new transaction
currentAppStatus = AppStatus.WAIT_TRANSACTION
newBalance = web3.fromWei(web3.eth.getBalance(account), 'ether')
while(newBalance===balance){
  newBalance = web3.fromWei(web3.eth.getBalance(account), 'ether')
  await sleep(1000)
}

console.log('New transaction!!')
var diff = newBalance-balance;
//Show POPUP and wait OK
currentAppStatus = AppStatus.WAIT_OK


function init () {

}

//  Main Loop
function mainLoop () {
//  Check if is syncing
}

showStatus()

function showStatus () {
  console.log('showing balance of ' + account)
  // retrieve the value of the token

  console.log('balance = ' + balance.toNumber())
}
