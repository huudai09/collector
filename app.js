const collector = require('./collector');

collector({
  start: 'http://truyenfull.vn/de-ton/chuong-1',
  end: 'http://truyenfull.vn/de-ton/chuong-2922',
  cover: 'http://static.truyenfull.vn/poster/n/QWJ4NzhWQUZmRkcxcTBldypGYVZaejBpX0deRmYqQCp2VmtBYUxNMm0xMW8wTHkxUU9VXVlWRTVTVUd4U1JTOVdRWzFFTlZdRVNGVmlTUzlCUVVGQlFVRkJRV3ROT0M5I1UxXX1WVFpEVVY4NVl5OTNNfkUxTFdeek1*ST0=/poster-de-ton.jpg',
  dest: './files/de-ton.html' // if size over 10mb, the dest will be named <filename>.concated.html
})