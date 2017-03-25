const collector = require('./collector');

collector({
  output: 'LINH_VŨ_THIÊN_HẠ',
  start: 'http://truyenfull.vn/linh-vu-thien-ha/chuong-2101',
  end: 'http://truyenfull.vn/linh-vu-thien-ha/chuong-2102',
  cover: 'http://static.truyenfull.vn/poster/n/QWJ4NzhWQUZmRkcxcTBldypGYVZaejBpX0deRmYqQCp2VmtBYUxNMm0xMW96THkxNE1XTnhUVUpCTVd4VCN5OVdaM0JbKURdUlNGJFVTUzlCUVVGQlFVRkJRVUppUVM4elNGRk9USCRUTjFwRU9DOTNNfkUxTFdeek1*SXRTV00wTV49PQ==/linh-vu-thien-ha.jpg',
  dest: './files/linh-vu-thien-ha', // if size over 10mb, the dest will be named <filename>.concated.html
})