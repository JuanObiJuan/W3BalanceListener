var Gpio = require('onoff').Gpio,
    led = new Gpio(22, 'out'),
    buzz = new Gpio(4,'out'),
    button = new Gpio(27,'in','both');

var i2c = require('./node_modules/i2c-bus/i2c-bus');
var sleep = require('./node_modules/sleep/');

var ip = require('ip')

var DISPLAY_RGB_ADDR = 0x62;
var DISPLAY_TEXT_ADDR = 0x3e;

// commands
var LCD_CLEARDISPLAY = 0x01
var LCD_RETURNHOME = 0x02
var LCD_ENTRYMODESET = 0x04
var LCD_DISPLAYCONTROL = 0x08
var LCD_CURSORSHIFT = 0x10
var LCD_FUNCTIONSET = 0x20
var LCD_SETCGRAMADDR = 0x40
var LCD_SETDDRAMADDR = 0x80

// flags for display entry mode
var LCD_ENTRYRIGHT = 0x00
var LCD_ENTRYLEFT = 0x02
var LCD_ENTRYSHIFTINCREMENT = 0x01
var LCD_ENTRYSHIFTDECREMENT = 0x00

//flags for Display on off control
var LCD_DISPLAYON = 0x04
var LCD_DISPLAYOFF = 0x00
var LCD_CURSORON = 0x02
var LCD_CURSOROFF = 0x00
var LCD_BLINKON = 0x01
var LCD_BLINKOFF = 0x00

// flags for display/cursor shift
var LCD_DISPLAYMOVE = 0x08
var LCD_CURSORMOVE = 0x00
var LCD_MOVERIGHT = 0x04
var LCD_MOVELEFT = 0x00

// flags for function set
var LCD_8BITMODE = 0x10
var LCD_4BITMODE = 0x00
var LCD_2LINE = 0x08
var LCD_1LINE = 0x00
var LCD_5x10DOTS = 0x04
var LCD_5x8DOTS = 0x00

var red = [255, 10, 10]
var green = [10, 255, 10]
var blue = [10, 10, 255]
var white = [255, 255, 255]

var colorSelected=blue

function SetTextColor(text,color){
  var i2c1 = i2c.openSync(1);
  setText(i2c1,text);
  setRGB(i2c1,color[0],color[1],color[2]);
  i2c1.closeSync();
}

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
  textCommand(i2c1, 0x01) // clear display
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
   if(process.send!=undefined){
   process.send('Button')
   }
   //console.log('button')
});

function ShowIP(){
  var ipaddress = ip.address()
  console.log(ipaddress)
  SetTextColor('WEB Interface:'+'\n'+ipaddress,colorSelected)
}

function ShowText(content){
  SetTextColor(content,colorSelected)
}

function SetColor(newColor){
  if(newColor==='red'){colorSelected=red}
  if(newColor==='green'){colorSelected=green}
  if(newColor==='blue'){colorSelected=blue}
  if(newColor==='white'){colorSelected=white}
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
 setTimeout(BuzzOff,3000)
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
  led.writeSync(0)
}

function StartBlinkingLed(){
  blinking = setInterval(ToggleLED, 100);
  setTimeout(StopBlinkingLed, 4000);
}

StartBlinkingLed()
ShowIP()
BuzzShort()

process.on('message', function(m) {
  if (m == 'ShowIP') {
    ShowIP();
  }
  if (m == 'SwitchLedOn') {
    Led(1);
  }
  if (m == 'SwitchLedOff') {
    Led(0);
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
  if (m.startsWith("ShowText:")) {
    ShowText(m.split(":")[1])
  }
  if (m.startsWith("SetColor:")) {
    SetColor(m.split(":")[1])
  }

});
