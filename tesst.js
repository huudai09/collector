const fs = require('fs');
const concat = require('concatenate-files');

concat(['./files/cuc-pham-gia-dinh.html', './files/lang-thien-truyen-thuyet.html'], 'out.html', { separator: '' }, function(err, result) {
  // result == { outputFile: 'out.js', outputData: '...' }
  console.log(result);
});

let stat = fs.statSync('./files/cuc-pham-gia-dinh.html');

console.log(stat.size);

