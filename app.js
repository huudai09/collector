const collector = require('./collector');

collector({
  start: 'http://truyenfull.vn/tien-nghich/chuong-1',
  end: 'http://truyenfull.vn/tien-nghich/chuong-1976',
  dest: './files/tien-nghich.html' // if size over 10mb, the dest will be named <filename>.concated.html
})