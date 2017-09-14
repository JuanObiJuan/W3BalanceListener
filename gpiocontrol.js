var i2c = require('./node_modules/i2c-bus/i2c-bus');
var sleep = require('./node_modules/sleep/');
var Gpio = require('onoff').Gpio,
  led = new Gpio(7, 'out'),
  buzz = new Gpio(20,'out'),
  button = new Gpio(21,'in','both');

var ip = require('ip')
var os = require("os");

var hostname = os.hostname();

var DISPLAY_RGB_ADDR = 0x62;
var DISPLAY_TEXT_ADDR = 0x3e;

function setRGB(i2c1, r, g, b) {
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,0,0)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,1,0)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,0x08,0xaa)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,4,r)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,3,g)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,2,b)
}

function textCommand(i2c1, cmd) {
  i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x80, cmd);
}

function setText(i2c1, text) {
  sleep.usleep(50000)
  textCommand(i2c1, 0x01) // clear display
  sleep.usleep(50000);
  textCommand(i2c1, 0x08 | 0x04) // display on, no cursor
  textCommand(i2c1, 0x28) // 2 lines
  sleep.usleep(50000);
  var count = 0;
  var row = 0;
  for(var i = 0, len = text.length; i < len; i++) {
    if(text[i] === '\n' || count === 16) {
      count = 0;
      row ++;
        if(row === 2)
          break;
      textCommand(i2c1, 0xc0)
      if(text[i] === '\n')
        continue;
    }
    count++;
    i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x40, text[i].charCodeAt(0));
  }
}

button.watch(function(err, value) {
   process.send('Button')
});

function ShowIP(){
  var i2c1 = i2c.openSync(1);
  setText(i2c1,ip.address()+' \n'+'8080');
  setRGB(i2c1, 55, 255, 55);
  i2c1.closeSync();
}

function Buzz(value){
 buzz.writeSync(value)
}

function BuzzOn(){
 Buzz(1)
}

function BuzzOff(){
 Buzz(0)
}

function BuzzShort(){
 setTimeout(BuzzOn,100)
 setTimeout(BuzzOff,150)
 setTimeout(BuzzOn,200)
 setTimeout(BuzzOff,250)
 setTimeout(BuzzOn,300)
 setTimeout(BuzzOff,350)
}

function BuzzLong(){
 BuzzOn()
 setTimeout(BuzzOff,1000)
}

function Led(value){
  led.writeSync(value);
}

var ledStatus = false;
var blinking;
function ToggleLED(){
  var value = 0
  if (ledStatus){value=1}
  led.writeSync(value)
  ledStatus=!ledStatus
}

function StopBlinkingLed(){
  clearInterval(blinking);
}

function StartBlinkingLed(){
  blinking = setInterval(ToggleLED, 100);
  setTimeout(StopBlinkingLed, 4000);
}

StartBlinkingLed()
sleep.sleep(1)
ShowIP()
BuzzShort()

process.on('message', function(m) {
  if (m == 'ShowIP') {
    ShowIP();
  }
  if (m == 'SwitchLedOn') {
    Led(true);
  }
  if (m == 'SwitchLedOff') {
    Led(false);
  }
  if (m == 'BuzzShort') {
    BuzzShort();
  }
  if (m == 'BuzzLong') {
    BuzzLong();
  }
  if (m == 'BlinkLed') {
    StartBlinkingLed();
  }
});
