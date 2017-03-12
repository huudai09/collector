var readline = require('readline');

function writeWaitingPercent(p) {
    //readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`waiting ... ${p}%`);
}

let i = 1;
console.log('aaaaaaaaaa');
let iterval = setInterval(() => {
  ++i;
  if (i == 10) {
    clearInterval(iterval);
    console.log('\n-vvvvvvvvvvvvvvv');
    return;
  }
  writeWaitingPercent(i);
}, 1000);